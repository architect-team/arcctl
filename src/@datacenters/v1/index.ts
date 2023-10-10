import { ResourceOutputs, ResourceType } from '../../@resources/types.ts';
import { AppGraph } from '../../graphs/app/graph.ts';
import { InfraGraphNode, MODULES_REGEX, VARIABLES_REGEX } from '../../graphs/index.ts';
import { InfraGraph } from '../../graphs/infra/graph.ts';
import { Datacenter, DockerBuildFn, DockerPushFn, DockerTagFn, GetGraphOptions } from '../datacenter.ts';
import { DatacenterVariablesSchema } from '../variables.ts';
import { applyContext } from './ast/parser.ts';

type ModuleDictionary = {
  [key: string]: {
    /**
     * The image source of the module
     */
    source: string;

    /**
     * Input values for the module
     */
    inputs: Record<string, unknown>;
  };
};

type ResourceHook<T extends ResourceType = ResourceType> = {
  /**
   * A condition that restricts when the hook should be active. Must resolve to a boolean.
   */
  when?: string;

  /**
   * Modules that will be created once per matching application resource
   */
  module?: ModuleDictionary;

  /**
   * A map of output values to be passed to upstream application resources
   */
  outputs: ResourceOutputs[T];
};

export class DatacenterV1 extends Datacenter {
  /**
   * Variables necessary for the datacenter to run
   */
  variable?: {
    [key: string]: {
      /**
       * The type of the variable
       */
      type: 'string' | 'number' | 'boolean';

      /**
       * The default value of the variable
       */
      default?: string;

      /**
       * A human-readable description of the variable
       */
      description?: string;
    };
  };

  /**
   * Modules that will be created once per datacenter
   */
  module?: ModuleDictionary;

  /**
   * Rules dictating what resources should be created in each environment hosted by the datacenter
   */
  environment?: (
    & {
      /**
       * Modules that will be created once per environment
       */
      module?: ModuleDictionary;
    }
    & {
      [resource in ResourceType]?: ResourceHook<resource>[];
    }
  )[];

  public getVariablesSchema(): DatacenterVariablesSchema {
  }

  public build(buildFn: DockerBuildFn): Promise<Datacenter> {
    throw new Error('Method not implemented.');
  }

  public tag(tagFn: DockerTagFn): Promise<Datacenter> {
    throw new Error('Method not implemented.');
  }

  public push(pushFn: DockerPushFn): Promise<Datacenter> {
    throw new Error('Method not implemented.');
  }

  private replaceVariableValues(obj: Record<string, unknown>, variables: Record<string, any>) {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object') {
        this.replaceVariableValues(value as Record<string, unknown>, variables);
      } else if (typeof value === 'string') {
        VARIABLES_REGEX.forEach((regex) => {
          obj[key] = value.replace(regex, (_, variable_name) => {
            const variable_value = variables[variable_name];
            if (variable_value === undefined) {
              throw Error(`Variable ${variable_name} has no value`);
            }
            return variable_value as string;
          });
        });
      }
    }
  }

  private getScopedGraph(infraGraph: InfraGraph, modules: ModuleDictionary, options: GetGraphOptions): InfraGraph {
    const scopedGraph = new InfraGraph();

    Object.entries(modules).forEach(([name, value]) => {
      if (scopedGraph.nodes.find((n) => n.name === name)) {
        throw Error(`Duplicate module name: ${name}`);
      }

      const infraNode = new InfraGraphNode({
        image: value.source,
        inputs: value.inputs,
        plugin: 'pulumi',
        name: name,
        action: 'create',
      });

      scopedGraph.insertNodes(infraNode);
      MODULES_REGEX.forEach((regex) => {
        value.inputs = JSON.parse(JSON.stringify(value.inputs).matchAll(regex));
      });
    });

    return scopedGraph;
  }

  public getGraph(appGraph: AppGraph, options: GetGraphOptions): InfraGraph {
    // This is so that we don't mutate the object as part of the getGraph() method
    const dc = JSON.parse(JSON.stringify(this));

    const infraGraph = new InfraGraph();

    applyContext(dc, {
      datacenter: {
        name: options.datacenterName,
      },
    });

    const dcScopedGraph = this.getScopedGraph(infraGraph, dc.module || {}, options);
    infraGraph.insertNodes(...dcScopedGraph.nodes);
    infraGraph.insertEdges(...dcScopedGraph.edges);

    if (options.environmentName) {
      applyContext(dc, {
        environment: {
          name: options.environmentName,
        },
      });

      const envScopedGraph = this.getScopedGraph(infraGraph, dc.environment?.module || {}, options);
      infraGraph.insertNodes(...envScopedGraph.nodes);
      infraGraph.insertEdges(...envScopedGraph.edges);

      const hooks = Object.entries(dc.environment || {}).filter(([key]) => key !== 'module');

      const outputsMap: Record<string, ResourceOutputs[ResourceType]> = {};
      const resourceScopedGraphs: InfraGraph[] = [];

      appGraph.nodes.forEach((appGraphNode) => {
        hooks.forEach(([key, values]) => {
          const type = key as ResourceType;

          // If the hook doesn't match the node type,
          if (appGraphNode.type !== type) {
            return;
          }

          if (!Array.isArray(values)) {
            throw Error(`Expected ${key} to be an array of ${type} hooks`);
          }

          for (const value of values) {
            const hook = value as ResourceHook;

            // Make sure all references to `node.*` are replaced with values
            applyContext(hook, {
              node: appGraphNode,
            });

            // Check the when clause before matching
            if (hook.when && eval(hook.when) === false) {
              continue;
            }

            resourceScopedGraphs.push(this.getScopedGraph(infraGraph, hook.module || {}, options));
            outputsMap[appGraphNode.getId()] = hook.outputs;

            // We can only match one hook per node
            break;
          }
        });
      });

      appGraph.edges.forEach((appGraphEdge) => {
        const targetOutputs = outputsMap[appGraphEdge.to];
        if (!targetOutputs) {
          throw new Error(`No matching hook found for ${appGraphEdge.to} (required by ${appGraphEdge.from}).`);
        }
      });

      // We don't merge in the individual hook results until we've iterated over all of them so
      // that modules can't find each other across hooks
      resourceScopedGraphs.forEach((g) => {
        infraGraph.insertNodes(...g.nodes);
        infraGraph.insertEdges(...g.edges);
      });

      // TODO: handle output values
    }

    return infraGraph;
  }
}
