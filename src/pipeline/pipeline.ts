import { Observable } from 'rxjs';
import { ProviderStore } from '../@providers/store.ts';
import { SupportedProviders } from '../@providers/supported-providers.ts';
import { CloudEdge, CloudGraph } from '../cloud-graph/index.ts';
import { PipelineStep } from './step.ts';
import { ApplyOptions } from './types.ts';

export const PIPELINE_NO_OP = 'no-op';

export enum PlanContextLevel {
  None = 0,
  Datacenter = 1,
  Environment = 2,
  Component = 3,
}

export type PlanOptions = {
  before: Pipeline;
  after: CloudGraph;
  contextFilter?: PlanContextLevel;
};

export type PipelineOptions = {
  steps?: PipelineStep[];
  edges?: CloudEdge[];
};

const getContextLevel = (step: PipelineStep): PlanContextLevel => {
  if (step.component) {
    return PlanContextLevel.Component;
  }
  if (step.environment) {
    return PlanContextLevel.Environment;
  }
  return PlanContextLevel.Datacenter;
};

const setNoopSteps = (
  providerStore: ProviderStore,
  previousPipeline: Pipeline,
  nextPipeline: Pipeline,
  contextFilter?: PlanContextLevel,
): Pipeline => {
  let done = false;

  do {
    done = true;
    for (
      let step of nextPipeline.steps.filter((step) => step.action === 'update')
    ) {
      const previousStep = previousPipeline.steps.find((n) => n.id.startsWith(step.id));

      const allDependencies = nextPipeline.getDependencies(step.id);
      const completeDependencies = allDependencies.filter((step) => step.status.state === 'complete');

      const isNoop = !contextFilter ? false : getContextLevel(step) < contextFilter;

      if (!isNoop && allDependencies.length !== completeDependencies.length) {
        continue;
      }

      step = new PipelineStep(nextPipeline.replaceRefsWithOutputValues(step));

      if (
        isNoop ||
        (step.getHash(providerStore) === previousStep?.hash &&
          previousStep.status.state === 'complete')
      ) {
        step.action = PIPELINE_NO_OP;
        step.status.state = 'complete';
        step.state = previousStep?.state;
        step.outputs = previousStep?.outputs;
        nextPipeline.insertSteps(step);
        done = false;
      }
    }
  } while (!done);

  return nextPipeline;
};

export class Pipeline {
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
  public replaceRefsWithOutputValues<T>(input: T): T {
    return JSON.parse(
      JSON.stringify(input).replace(/\${{\s?(.*?)\s}}/g, (_, ref) => {
        ref = ref.trim();
        const step_id = ref.substring(0, ref.lastIndexOf('.'));
        const key = ref.substring(ref.lastIndexOf('.') + 1);
        const step = this.steps.find((s) => s.id === step_id);
        const outputs = step?.outputs;
        if (!step || !outputs) {
          throw new Error(`Missing outputs for ${step_id}`);
        } else if ((outputs as any)[key] === undefined) {
          throw new Error(`Invalid key, ${key}, for ${step.type}. ${JSON.stringify(outputs)}`);
        }

        return (outputs as any)[key] || '';
      }),
    );
  }

  /**
   * Returns a pipeline step that is ready to be applied
   */
  public getNextStep(...seenIds: string[]): PipelineStep | undefined {
    const availableSteps = this.steps
      .sort(
        (first, second) =>
          (first.environment || '').localeCompare(second.environment || '') ||
          (first.component || '').localeCompare(second.component || '') ||
          0,
      )
      .filter((step) => {
        const isStepSeen = seenIds.includes(step.id);
        const hasDeps = this.edges.some((edge) => edge.required && edge.from === step.id && !seenIds.includes(edge.to));

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
        (options.from && !options.to &&
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
        throw new Error(`${edge.to} is missing from the pipeline, but required by ${edge.from}`);
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
  public static plan(options: PlanOptions, providerStore: ProviderStore): Pipeline {
    const pipeline = new Pipeline({
      edges: [...options.after.edges],
    });

    const replacements: Record<string, string> = {};
    for (const newNode of options.after.nodes) {
      const previousStep = options.before.steps.find((n) => n.id.startsWith(newNode.id));

      const oldId = newNode.id;
      if (
        !previousStep || previousStep.status.state !== 'complete' ||
        previousStep.action === 'delete'
      ) {
        const newStep = new PipelineStep({
          ...newNode,
          type: newNode.type,
          color: 'blue',
          action: 'create',
          status: {
            state: 'pending',
          },
        });
        newStep.hash = newStep.getHash(providerStore);
        pipeline.insertSteps(newStep);
        replacements[oldId] = newStep.id;
      } else {
        const newExecutable = new PipelineStep({
          ...newNode,
          type: newNode.type,
          color: previousStep.color,
          state: previousStep.state,
          action: 'update',
          status: {
            state: 'pending',
          },
        });
        newExecutable.hash = newExecutable.getHash(providerStore);
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
        (previousStep.action === 'delete' &&
          previousStep.status.state === 'complete') ||
        (previousStep.action === 'create' &&
          previousStep.status.state === 'pending') ||
        (previousStep.action === 'delete' && !previousStep.outputs)
      ) {
        continue;
      }

      const newNode = options.after.nodes.find((n) => previousStep.id.startsWith(n.id));
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
            const targetNode = pipeline.steps.find((step) => step.id === oldEdge.from);
            if (targetNode) {
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
    }

    // Check for nodes that can be no-op'd
    return setNoopSteps(providerStore, options.before, pipeline, options.contextFilter);
  }

  /**
   * Kick off the pipeline
   */
  public apply(options: ApplyOptions): Observable<Pipeline> {
    const cwd = options.cwd || Deno.makeTempDirSync({ prefix: 'arcctl-' });

    return new Observable((subscriber) => {
      (async () => {
        let step: PipelineStep | undefined;
        while (
          (step = this.getNextStep(
            ...this.steps.filter((n) => n.status.state === 'complete' || n.status.state === 'error').map((n) => n.id),
          ))
        ) {
          if (!step) {
            subscriber.error(`Something went wrong queuing up a node to apply`);
            return;
          }

          if (step.inputs) {
            try {
              if (step.action !== 'delete') {
                step.inputs = this.replaceRefsWithOutputValues(step.inputs);
              }
            } catch (err: any) {
              step.status.state = 'error';
              step.status.message = err.message;
              subscriber.error(err.message);
              return;
            }
          }

          // Hijack the arcctl account type to execute w/out a provider
          if (step.inputs?.type === 'arcctlAccount') {
            if (!Object.keys(SupportedProviders).includes(step.inputs.provider)) {
              step.status.state = 'error';
              step.status.message = 'Invalid provider specified';
              subscriber.error(
                `Invalid provider specified: ${step.inputs.provider}`,
              );
              return;
            }

            if (step.action === 'delete') {
              step.status = {
                state: 'destroying',
                message: '',
                startTime: Date.now(),
                endTime: Date.now(),
              };

              options.providerStore.deleteProvider(step.inputs.name);
            } else {
              step.status = {
                state: 'applying',
                message: '',
                startTime: Date.now(),
                endTime: Date.now(),
              };

              options.providerStore.saveProvider(
                new SupportedProviders[
                  step.inputs.provider as keyof typeof SupportedProviders
                ](
                  step.inputs.name,
                  step.inputs.credentials as any,
                  options.providerStore,
                ),
              );
            }

            step.outputs = {
              id: step.inputs.name,
            };
            step.state = {
              id: step.inputs.name,
            };

            step.status = {
              state: 'complete',
              message: '',
              startTime: Date.now(),
              endTime: Date.now(),
            };
            continue;
          }

          await new Promise<void>((resolve, reject) => {
            step!
              .apply({
                ...options,
                cwd,
              })
              .subscribe({
                next: (res) => {
                  this.insertSteps(res);
                },
                error: (err) => {
                  reject(err);
                  return;
                },
                complete: () => {
                  resolve();
                  return;
                },
              });
          });
          subscriber.next(this);
        }
      })()
        .then(() => subscriber.complete())
        .catch((err) => {
          subscriber.error(err);
        });
    });
  }
}
