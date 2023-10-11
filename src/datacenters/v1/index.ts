import { parseResourceOutputs, ResourceOutputs, ResourceType } from '../../@resources/index.ts';
import { AppGraph } from '../../graphs/app/graph.ts';
import { GraphEdge } from '../../graphs/edge.ts';
import { InfraGraphNode, MODULES_REGEX } from '../../graphs/index.ts';
import { InfraGraph } from '../../graphs/infra/graph.ts';
import { Datacenter, DockerBuildFn, DockerPushFn, DockerTagFn, GetGraphOptions } from '../datacenter.ts';
import { DatacenterVariablesSchema } from '../variables.ts';
import { applyContextRecursive } from './ast/parser.ts';
import {
  DuplicateModuleNameError,
  InvalidModuleReference,
  InvalidOutputProperties,
  MissingResourceHook,
} from './errors.ts';

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
  }[];
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
  outputs?: ResourceOutputs[T];
};

export default class DatacenterV1 extends Datacenter {
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
    }[];
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

  public constructor(data: any) {
    super();
    Object.assign(this, data);
  }

  public getVariablesSchema(): DatacenterVariablesSchema {
    throw new Error('Method not implemented.');
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

  private getScopedGraph(
    infraGraph: InfraGraph,
    modules: ModuleDictionary,
    options: GetGraphOptions & { component?: string; appNodeId?: string },
  ): InfraGraph {
    const scopedGraph = new InfraGraph();

    // Add all the modules to the scoped graph
    Object.entries(modules).forEach(([name, value]) => {
      // Module keys are an array for some reason. It shouldn't ever be empty though.
      if (value.length < 1) {
        return;
      }

      // The module name cannot be used in the current or parent scoped graph
      if (infraGraph.nodes.find((n) => n.name === name) || scopedGraph.nodes.find((n) => n.name === name)) {
        throw new DuplicateModuleNameError(name);
      }

      scopedGraph.insertNodes(
        new InfraGraphNode({
          image: value[0].source,
          inputs: value[0].inputs,
          component: options.component,
          appNodeId: options.appNodeId,
          plugin: 'pulumi',
          name: name,
          action: 'create',
        }),
      );
    });

    // Extract module edges and replace references with GraphNode references
    scopedGraph.nodes = scopedGraph.nodes.map((node) =>
      new InfraGraphNode(JSON.parse(
        JSON.stringify(node).replace(MODULES_REGEX, (full_match, match_path, module_name, module_key) => {
          const target_node = [...scopedGraph.nodes, ...infraGraph.nodes].find((n) => n.name === module_name);
          if (!target_node) {
            throw new InvalidModuleReference(node.name, module_name);
          }

          scopedGraph.insertEdges(
            new GraphEdge({
              from: node.getId(),
              to: target_node.getId(),
            }),
          );

          return full_match.replace(match_path, `${target_node.getId()}.${module_key}`);
        }),
      ))
    );

    return scopedGraph;
  }

  public getGraph(appGraph: AppGraph, options: GetGraphOptions): InfraGraph {
    // This is so that we don't mutate the object as part of the getGraph() method
    const dc = new DatacenterV1(this);

    const infraGraph = new InfraGraph();

    // Use default values where applicable
    let vars: Record<string, string> = {};
    for (const [key, configs] of Object.entries(dc.variable || {})) {
      // Variable keys are an array for some reason. It shouldn't ever be empty though.
      if (configs.length < 1) {
        continue;
      }

      applyContextRecursive(configs[0], {
        variable: options.variables || {},
        var: options.variables || {},
      });

      if (configs[0].default) {
        vars[key] = configs[0].default;
      }
    }

    vars = {
      ...vars,
      ...options.variables,
    };

    applyContextRecursive(dc, {
      datacenter: {
        name: options.datacenterName,
      },
      variable: vars,
      var: vars,
    });

    const dcScopedGraph = this.getScopedGraph(infraGraph, dc.module || {}, options);
    infraGraph.insertNodes(...dcScopedGraph.nodes);
    infraGraph.insertEdges(...dcScopedGraph.edges);

    if (options.environmentName) {
      applyContextRecursive(dc, {
        environment: {
          name: options.environmentName,
        },
      });

      const outputsMap: Record<string, ResourceOutputs[ResourceType]> = {};
      const resourceScopedGraphs: InfraGraph[] = [];

      for (const env of dc.environment || []) {
        const envScopedGraph = this.getScopedGraph(infraGraph, env.module || {}, options);
        infraGraph.insertNodes(...envScopedGraph.nodes);
        infraGraph.insertEdges(...envScopedGraph.edges);

        const hooks = Object.entries(env || {}).filter(([key]) => key !== 'module');

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
              applyContextRecursive(hook, {
                node: appGraphNode,
              });

              // Check the when clause before matching
              if (hook.when && eval(hook.when) === false) {
                continue;
              }

              const scopedGraph = this.getScopedGraph(infraGraph, hook.module || {}, {
                ...options,
                component: appGraphNode.component,
                appNodeId: appGraphNode.getId(),
              });
              resourceScopedGraphs.push(scopedGraph);

              try {
                // Make sure the output schema is valid for the resource type
                const validatedResourceOutputs = parseResourceOutputs(type, hook.outputs || {});

                // Replace any module references with node references
                outputsMap[appGraphNode.getId()] = JSON.parse(
                  JSON.stringify(validatedResourceOutputs).replace(
                    MODULES_REGEX,
                    (full_match, match_path, module_name, module_key) => {
                      const target_node = [...scopedGraph.nodes, ...infraGraph.nodes].find((n) =>
                        n.name === module_name
                      );
                      if (!target_node) {
                        throw new InvalidModuleReference(`${type}.outputs`, module_name);
                      }

                      return full_match.replace(match_path, `${target_node.getId()}.${module_key}`);
                    },
                  ),
                );
              } catch (errs) {
                throw new InvalidOutputProperties(type, errs);
              }

              // We can only match one hook per node
              break;
            }
          });
        });
      }

      appGraph.edges.forEach((appGraphEdge) => {
        const targetOutputs = outputsMap[appGraphEdge.to];
        if (!targetOutputs) {
          throw new MissingResourceHook(appGraphEdge.from, appGraphEdge.to);
        }
      });

      // We don't merge in the individual hook results until we've iterated over all of them so
      // that modules can't find each other across hooks
      resourceScopedGraphs.forEach((g) => {
        infraGraph.insertNodes(...g.nodes);
        infraGraph.insertEdges(...g.edges);
      });

      infraGraph.nodes = infraGraph.nodes.map((node) =>
        new InfraGraphNode(JSON.parse(
          JSON.stringify(node).replace(
            /\$\{\{\s*([a-zA-Z0-9_\-\/]+)\.([a-zA-Z0-9_-]+)\s*\}\}/g,
            (_, component_id, key) => {
              const outputs = outputsMap[component_id] as any;
              if (!outputs) {
                throw new MissingResourceHook(node.getId(), component_id);
              }

              const [match, target_component_id] = outputs[key].match(
                /\$\{\s*([a-zA-Z0-9_\-\/]+)\.([a-zA-Z0-9_-]+)\}/,
              );
              infraGraph.insertEdges(
                new GraphEdge({
                  from: node.getId(),
                  to: target_component_id,
                }),
              );

              return outputs[key];
            },
          ),
        ))
      );
    }

    return infraGraph;
  }
}
