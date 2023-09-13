import { Observable } from 'rxjs';
import { ProviderStore } from '../@providers/store.ts';
import { SupportedProviders } from '../@providers/supported-providers.ts';
import { CloudEdge, CloudGraph } from '../cloud-graph/index.ts';
import { Apply } from '../modules/index.ts';
import { topologicalSort } from '../utils/sorting.ts';
import { PipelineStep } from './step.ts';
import { ApplyOptions } from './types.ts';

export enum PlanContext {
  Datacenter = 1,
  Environment = 2,
  Component = 3,
}

export type PlanOptions = {
  before: Pipeline;
  after: CloudGraph;
  context?: PlanContext;
  refresh?: boolean;
};

export type PipelineOptions = {
  steps?: PipelineStep[];
  edges?: CloudEdge[];
};

const setNoopSteps = async (
  providerStore: ProviderStore,
  previousPipeline: Pipeline,
  nextPipeline: Pipeline,
  context?: PlanContext,
  refresh?: boolean,
): Promise<Pipeline> => {
  let done = false;
  do {
    done = true;
    for (
      let step of nextPipeline.steps.filter((step) => step.action === 'update')
    ) {
      const previousStep = previousPipeline.steps.find((n) => n.id.startsWith(step.id));

      const allDependencies = nextPipeline.getDependencies(step.id);
      const completeDependencies = allDependencies.filter((step) => step.status.state === 'complete');
      const allDependenciesCompleted = allDependencies.length === completeDependencies.length;
      const doesMatchContext = !context ||
        (context === PlanContext.Component && Boolean(step.component)) ||
        (context === PlanContext.Environment && Boolean(step.environment)) ||
        (context === PlanContext.Datacenter && !step.environment && !step.component);

      // Definitely cant no-op if there are incomplete dependencies
      if (!allDependenciesCompleted && doesMatchContext) {
        continue;
      }

      try {
        step = new PipelineStep(nextPipeline.replaceRefsWithOutputValues(step));
        const newHash = await step.getHash(providerStore);
        const previousHash = await previousStep?.getHash(providerStore);
        const doesHashMatch = newHash === previousHash;
        const wasPreviouslyCompleted = previousStep?.status.state === 'complete';

        if (!doesMatchContext || (!refresh && doesHashMatch && wasPreviouslyCompleted)) {
          step.action = 'no-op';
          step.status.state = 'complete';
          step.state = previousStep?.state;
          step.outputs = previousStep?.outputs;
          nextPipeline.insertSteps(step);
          done = false;
        }
      } catch {
        // noop
      }
    }
  } while (!done);

  return nextPipeline;
};

const checkCircularRequiredDependencies = (pipeline: Pipeline) => {
  const graph: Record<string, Set<string>> = {};
  for (const edge of pipeline.edges) {
    if (!edge.required) {
      continue;
    }

    if (graph[edge.from] === undefined) {
      graph[edge.from] = new Set();
    }
    graph[edge.from].add(edge.to);
  }

  // Raises an error if it cannot be topologically sorted, which implies there is a cycle
  topologicalSort(graph);
};

export class Pipeline {
  steps: PipelineStep[];
  edges: CloudEdge[];

  constructor(options?: PipelineOptions) {
    this.steps = options?.steps?.map((step: any) => new PipelineStep(step)) || [];
    this.edges = options?.edges?.map((edge: any) => new CloudEdge(edge)) || [];
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

  private convertStringToType(input: string, type: string): any {
    switch (type) {
      case 'string':
        return String(input);
      case 'number':
        return Number(input);
      case 'boolean':
        return Boolean(input);
      default:
        throw new Error(`Invalid type: ${type}`);
    }
  }

  private getOutputValueForReference(key: string | undefined): any {
    if (key === undefined) {
      return undefined;
    }
    const initialType = typeof key;
    return key.toString().replace(/\${{\s*(.*?)\s}}/g, (_, ref) => {
      ref = ref.trim();
      const step_id = ref.substring(0, ref.lastIndexOf('.'));
      const key = ref.substring(ref.lastIndexOf('.') + 1);
      const step = this.steps.find((s) => s.id === step_id);
      const outputs = step?.outputs;
      if (!step || !outputs) {
        throw new Error(`Missing outputs for ${ref}`);
      } else if ((outputs as any)[key] === undefined) {
        throw new Error(
          `Invalid key, ${key}, for ${step.type}. ${JSON.stringify(outputs)}`,
        );
      }
      return this.convertStringToType(String((outputs as any)[key]) || '', initialType);
    });
  }

  /**
   * Replace step references with actual output values
   */
  public replaceRefsWithOutputValues<T>(input: T): T {
    if (input == undefined) {
      return undefined as T;
    }
    const output = JSON.parse(JSON.stringify(input));
    for (const [key, value] of Object.entries(output)) {
      if (typeof value === 'object' || Array.isArray(value)) {
        output[key] = this.replaceRefsWithOutputValues(value);
        continue;
      }
      output[key] = this.getOutputValueForReference(value as string);
    }
    return output;
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
    // Check for circular dependencies and edges that point to nodes that don't exist.
    // This will raise an exception if a circular dependency exists and abort
    checkCircularRequiredDependencies(this);

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
        this.edges.some((edge) => edge.from === step_id && edge.to === step.id && edge.required),
    );
  }

  public getDependents(step_id: string): PipelineStep[] {
    return this.steps.filter(
      (step) =>
        step.id !== step_id &&
        this.edges.some((edge) => edge.to === step_id && edge.from === step.id && edge.required),
    );
  }

  /**
   * Returns a new pipeline by comparing the old pipeline to a new target graph
   */
  public static async plan(options: PlanOptions, providerStore: ProviderStore): Promise<Pipeline> {
    const pipeline = new Pipeline({
      edges: [...options.after.edges],
    });

    // Insert hashes and generate map of IDs to replace with color-coded IDs
    const replacements: Record<string, string> = {};
    for (const newNode of options.after.nodes) {
      const previousStep = options.before.steps.find((n) => {
        return n.id.startsWith(newNode.id);
      });

      const oldId = newNode.id;
      if (
        !previousStep || (previousStep.status.state !== 'complete' && previousStep.action === 'create') ||
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
        newStep.hash = await newStep.getHash(providerStore);
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
        newExecutable.hash = await newExecutable.getHash(providerStore);
        pipeline.insertSteps(newExecutable);
        replacements[oldId] = newExecutable.id;
      }
    }

    // Replace references with color-coded refs
    for (const [source, target] of Object.entries(replacements)) {
      pipeline.replaceStepRefs(source, target);
    }

    const potentialEdges: CloudEdge[] = [];
    // Check for nodes that should be removed
    for (const previousStep of options.before.steps) {
      if (
        (previousStep.action === 'delete' &&
          previousStep.status.state === 'complete') ||
        (previousStep.action === 'create' &&
          (previousStep.status.state === 'pending' ||
            previousStep.status.state === 'error'))
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
            potentialEdges.push(
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

    // Add edges for nodes being removed that are still valid
    for (const potentialEdge of potentialEdges) {
      const targetNode = pipeline.steps.find((step) => step.id === potentialEdge.to);
      if (targetNode) {
        pipeline.insertEdges(potentialEdge);
      }
    }

    // Check for nodes that can be no-op'd
    return setNoopSteps(
      providerStore,
      options.before,
      pipeline,
      options.context,
      options.refresh,
    );
  }

  private flattenObject(obj: Record<string, any>, path: string[] = []): Record<string, any> {
    return Object.keys(obj).reduce((acc: Record<string, any>, key) => {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        Object.assign(
          acc,
          this.flattenObject(obj[key], [
            ...path,
            key,
          ]),
        );
      } else {
        acc[[...path, key].join(':')] = obj[key];
      }
      return acc;
    }, {});
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

          // Modules do not get run through the normal process
          if (step.type === 'module') {
            step.status = {
              state: step.action === 'delete' ? 'destroying' : 'applying',
              message: '',
              startTime: Date.now(),
              endTime: Date.now(),
            };
            const inputs = this.flattenObject(step.inputs as any || {});
            const response = await Apply({
              datacenterid: 'datacenter',
              inputs,
              image: step.image!,
              pulumistate: step.state,
              destroy: step.action === 'delete',
            });
            step.state = response.pulumistate;
            step.status = {
              state: 'complete',
              message: '',
              startTime: Date.now(),
              endTime: Date.now(),
            };
            continue;
          }

          // Hijack the arcctl account type to execute w/out a provider
          if (step.inputs?.type === 'arcctlAccount') {
            if (
              !Object.keys(SupportedProviders).includes(step.inputs.provider)
            ) {
              step.status.state = 'error';
              step.status.message = 'Invalid provider specified';
              throw new Error(
                `Invalid provider specified: ${step.inputs.provider}`,
              );
            }

            if (step.action === 'delete') {
              step.status = {
                state: 'destroying',
                message: '',
                startTime: Date.now(),
                endTime: Date.now(),
              };

              await options.providerStore.delete(step.inputs.name);
            } else {
              step.status = {
                state: 'applying',
                message: '',
                startTime: Date.now(),
                endTime: Date.now(),
              };
              await options.providerStore.save(
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
        .then(() => {
          for (const step of this.steps) {
            if (step.status.state !== 'complete') {
              throw Error(`Pipeline finished with an unfinished step`);
            }
          }
          subscriber.complete();
        })
        .catch((err) => {
          subscriber.error(err);
        });
    });
  }
}
