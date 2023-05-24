import { CloudEdge, CloudGraph } from '../cloud-graph/index.js';
import { Terraform } from '../terraform/terraform.js';
import CloudCtlConfig from '../utils/config.js';
import { replaceAsync } from '../utils/string.js';
import { PipelineStep } from './step.js';
import { ApplyOptions, ApplyStepOptions } from './types.js';
import fs from 'fs';
import os from 'os';
import path from 'path';

export type PlanOptions = {
  before: Pipeline;
  after: CloudGraph;
};

export type PipelineOptions = {
  steps?: PipelineStep[];
  edges?: CloudEdge[];
};

export class Pipeline {
  private _terraform?: Terraform;

  steps: PipelineStep[];
  edges: CloudEdge[];

  constructor(options?: PipelineOptions) {
    this.steps = options?.steps || [];
    this.edges = options?.edges || [];
  }

  /**
   * Updates pointers to the sourceId to reference the targetId instead.
   * @param sourceId
   * @param targetId
   */
  private replaceStepRefs(sourceId: string, targetId: string): void {
    // Replace expressions within nodes
    this.steps = this.steps.map((step) => {
      return new PipelineStep(
        JSON.parse(
          JSON.stringify(step).replace(
            new RegExp('\\${{\\s?' + sourceId + '\\.(\\S+)\\s?}}', 'g'),
            (_, key) => `\${{ ${targetId}.${key} }}`,
          ),
        ),
      );
    });

    // Replace edge sources and targets
    this.edges = this.edges.map((edge) => {
      if (edge.from === sourceId) {
        edge.from = targetId;
      } else if (edge.to === sourceId) {
        edge.to = targetId;
      }

      return edge;
    });
  }

  /**
   * Replace step references with actual output values
   */
  private async replaceRefsWithOutputValues<T>(
    input: T,
    options: ApplyStepOptions,
  ): Promise<T> {
    const strVal = await replaceAsync(
      JSON.stringify(input),
      /\${{\s?([^.]+).(\S+)\s?}}/g,
      async (_, step_id, key) => {
        const step = this.steps.find((s) => s.id === step_id);
        const outputs = await step?.getOutputs(options);
        if (!step || !outputs) {
          throw new Error(`Missing outputs for ${step_id}`);
        } else if (!(outputs as any)[key]) {
          throw new Error(`Invalid key, ${key}, for ${step.type}`);
        }

        return (outputs as any)[key];
      },
    );

    return JSON.parse(strVal);
  }

  private async getTerraformPlugin(): Promise<Terraform> {
    if (this._terraform) {
      return this._terraform;
    }

    this._terraform = await Terraform.generate(
      CloudCtlConfig.getPluginDirectory(),
      '1.4.5',
    );

    return this._terraform;
  }

  /**
   * Returns a pipeline step that is ready to be applied
   */
  private getNextStep(...seenIds: string[]): PipelineStep | undefined {
    const availableSteps = this.steps.filter((step) => {
      const isStepSeen = seenIds.includes(step.id);
      const hasDeps = this.edges.some(
        (edge) =>
          edge.required && edge.from === step.id && !seenIds.includes(edge.to),
      );

      return !isStepSeen && !hasDeps;
    });

    return availableSteps.shift();
  }

  public insertSteps(...args: PipelineStep[]): Pipeline {
    for (const node of args) {
      const index = this.steps.findIndex((item) => item.id === node.id);
      if (index >= 0) {
        this.steps[index] = node;
      } else {
        this.steps.push(node);
      }
    }

    return this;
  }

  public insertEdges(...args: CloudEdge[]): Pipeline {
    for (const edge of args) {
      const index = this.edges.findIndex((item) => item.id === edge.id);
      if (index >= 0) {
        this.edges[index] = edge;
      } else {
        this.edges.push(edge);
      }
    }

    return this;
  }

  public removeStep(id: string): Pipeline {
    for (const index in this.steps) {
      if (this.steps[index].id === id) {
        this.steps.splice(Number(index), 1);
        return this;
      }
    }

    throw new Error(`Node with id ${id} not found`);
  }

  public removeEdge(options: { from?: string; to?: string }): Pipeline {
    if (!options.from && !options.to) {
      throw new Error('Must specify at least one of: from, to');
    }

    for (const index in this.edges) {
      if (
        (options.from &&
          options.to &&
          this.edges[index].from === options.from &&
          this.edges[index].to === options.to) ||
        (options.from &&
          !options.to &&
          this.edges[index].from === options.from) ||
        (options.to && !options.from && this.edges[index].to === options.to)
      ) {
        this.edges.splice(Number(index), 1);
        return this;
      }
    }

    throw new Error(
      `No edge found matching options: ${JSON.stringify(options)}`,
    );
  }

  public validate(): void {
    for (const edge of this.edges) {
      if (!this.steps.some((n) => n.id === edge.from)) {
        throw new Error(`${edge.from} is missing from the pipeline`);
      } else if (!this.steps.some((n) => n.id === edge.to)) {
        throw new Error(
          `${edge.to} is missing from the pipeline, but required by ${edge.from}`,
        );
      }
    }
  }

  public getDependencies(step_id: string): PipelineStep[] {
    return this.steps.filter(
      (step) =>
        step.id !== step_id &&
        this.edges.some((edge) => edge.from === step_id && edge.to === step.id),
    );
  }

  public getDependents(step_id: string): PipelineStep[] {
    return this.steps.filter(
      (step) =>
        step.id !== step_id &&
        this.edges.some((edge) => edge.to === step_id && edge.from === step.id),
    );
  }

  /**
   * Returns a new pipeline by comparing the old pipeline to a new target graph
   */
  public static plan(options: PlanOptions): Pipeline {
    const pipeline = new Pipeline({
      edges: [...options.after.edges],
    });

    const replacements: Record<string, string> = {};
    for (const newNode of options.after.nodes) {
      const previousStep = options.before.steps.find((n) =>
        n.id.startsWith(newNode.id),
      );

      const oldId = newNode.id;
      if (!previousStep) {
        const newStep = new PipelineStep({
          ...newNode,
          type: newNode.type,
          color: 'blue',
          action: 'create',
          status: {
            state: 'pending',
          },
        });
        pipeline.insertSteps(newStep);
        replacements[oldId] = newStep.id;
      } else {
        const newExecutable = new PipelineStep({
          ...newNode,
          type: newNode.type,
          color: previousStep.color,
          action: 'update',
          status: {
            state: 'pending',
          },
        });
        pipeline.insertSteps(newExecutable);
        replacements[oldId] = newExecutable.id;
      }
    }

    // Replace references with color-coded refs
    for (const [source, target] of Object.entries(replacements)) {
      pipeline.replaceStepRefs(source, target);
    }

    // Check for nodes that should be removed
    for (const previousStep of options.before.steps) {
      if (
        previousStep.action === 'delete' &&
        previousStep.status.state !== 'error'
      ) {
        continue;
      }

      const newNode = options.after.nodes.find((n) =>
        previousStep.id.startsWith(n.id),
      );
      if (!newNode) {
        const rmStep = new PipelineStep({
          ...previousStep,
          action: 'delete',
          status: {
            state: 'pending',
          },
        });

        pipeline.insertSteps(rmStep);

        for (const oldEdge of options.before.edges) {
          if (oldEdge.to === rmStep.id) {
            pipeline.insertEdges(
              new CloudEdge({
                from: oldEdge.to,
                to: oldEdge.from,
                required: oldEdge.required,
              }),
            );
          }
        }
      }
    }

    return pipeline;
  }

  /**
   * Kick off the pipeline
   */
  public async apply(options: ApplyOptions): Promise<void> {
    const cwd =
      options.cwd || fs.mkdtempSync(path.join(os.tmpdir(), 'cldctl-'));

    let step: PipelineStep | undefined;
    const terraform = await this.getTerraformPlugin();
    while (
      (step = this.getNextStep(
        ...this.steps
          .filter(
            (n) => n.status.state === 'complete' || n.status.state === 'error',
          )
          .map((n) => n.id),
      ))
    ) {
      if (!step) {
        throw new Error(`Something went wrong queuing up a node to apply`);
      }

      if (step.inputs) {
        step.inputs = await this.replaceRefsWithOutputValues(step.inputs, {
          ...options,
          terraform,
          cwd,
        });
      }

      await new Promise<void>((resolve, reject) => {
        step!
          .apply({
            ...options,
            terraform,
            cwd,
          })
          .subscribe({
            next: (res) => {
              this.insertSteps(res);
            },
            error: reject,
            complete: resolve,
          });
      });
    }
  }
}
