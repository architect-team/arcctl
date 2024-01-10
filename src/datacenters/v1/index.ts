import * as path from 'std/path/mod.ts';
import { parseResourceOutputs, ResourceOutputs, ResourceType } from '../../@resources/index.ts';
import { AppGraph } from '../../graphs/app/graph.ts';
import { GraphEdge } from '../../graphs/edge.ts';
import { InfraGraphNode, MODULES_REGEX } from '../../graphs/index.ts';
import { InfraGraph } from '../../graphs/infra/graph.ts';
import { applyContext } from '../../hcl-parser/index.ts';
import { exec } from '../../utils/command.ts';
import { Datacenter, GetGraphOptions, ModuleBuildFn, ModulePushFn, ModuleTagFn } from '../datacenter.ts';
import { DatacenterVariablesSchema } from '../variables.ts';
import {
  DuplicateModuleNameError,
  InvalidModuleReference,
  InvalidOutputProperties,
  MissingResourceHook,
  ModuleReferencesNotAllowedInWhenClause,
} from './errors.ts';

type Module = {
  /**
   * A condition that restricts when the module should be created. Must resolve to a boolean.
   *
   * @example "node.type == 'database' && node.inputs.databaseType == 'postgres'"
   * @example "contains(environment.nodes.*.inputs.databaseType, 'postgres')"
   */
  when?: string;

  /**
   * The image source of the module.
   *
   * @example "my-registry.com/my-image:latest"
   */
  image?: string;

  /**
   * The path to a directory containing the code for the module, or a module.yml file describing the module.
   *
   * @example "./my-module"
   * @example "./my-module/module.yml"
   */
  build?: string;

  /**
   * Volumes that should be mounted to the container executing the module
   */
  volume?: {
    /**
     * The path on the host machine to mount to the container
     *
     * @example "/Users/batman/my-volume"
     */
    host_path: string;

    /**
     * The path in the container to mount the volume to
     *
     * @example "/app/my-volume"
     */
    mount_path: string;
  }[];

  /**
   * Environment variables that should be provided to the container executing the module
   *
   * @example
   * {
   *   "MY_ENV_VAR": "my-value"
   * }
   */
  environment?: Record<string, string>;

  /**
   * Input values for the module.
   *
   * @example
   * {
   *   "image": "nginx:latest",
   *   "port": 8080
   * }
   */
  inputs: Record<string, unknown> | string;

  /**
   * The Time to Live (in seconds) for a module. When the TTL for a module is expired, the next deploy
   * will force an update of the module.
   *
   * @example "24*60*60"
   */
  ttl?: string;

  /**
   * Other modules this one depends on
   */
  depends_on?: string[];
};

type ModuleDictionary = {
  [key: string]: Module[];
};

type ResourceHook<T extends ResourceType = ResourceType> = {
  /**
   * A condition that restricts when the hook should be active. Must resolve to a boolean.
   *
   * @example "node.type == 'database' && node.inputs.databaseType == 'postgres'"
   * @example "contains(environment.nodes.*.inputs.databaseType, 'postgres')"
   */
  when?: string;

  /**
   * Modules that will be created once per matching application resource
   */
  module?: ModuleDictionary;

  /**
   * A map of output values to be passed to upstream application resources
   *
   * @example
   * {
   *   "id": "${module.database.id}",
   *   "host": "${module.database.host}",
   *   "port": "${module.database.port}",
   *   "username": "${module.database.username}",
   *   "password": "${module.database.password}"
   * }
   */
  outputs?: ResourceOutputs[T];
};

/**
 * Clones the repository at the given repo URL and returns the tmp dir it was cloned to.
 */
async function cloneRepo(repo: string): Promise<string> {
  const tmpDir = await Deno.makeTempDir({ prefix: 'module' });
  await exec('git', { args: ['clone', repo, tmpDir] });
  return tmpDir;
}

export default class DatacenterV1 extends Datacenter {
  /**
   * Variables necessary for the datacenter to run
   */
  variable?: {
    [key: string]: {
      /**
       * The type of the variable
       * @example "string"
       * @enum "string" "number" "boolean"
       */
      type: 'string' | 'number' | 'boolean';

      /**
       * The default value of the variable
       *
       * @example "my-value"
       */
      default?: string;

      /**
       * A human-readable description of the variable
       *
       * @example "An example description"
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
    const res: DatacenterVariablesSchema = {};

    for (const [key, value] of Object.entries(this.variable || {})) {
      for (const item of value) {
        res[key] = {
          type: item.type,
          description: item.description,
          value: item.default,
        };
      }
    }

    return res;
  }

  public async build(buildFn: ModuleBuildFn): Promise<Datacenter> {
    for (const mod of Object.values(this.getModules())) {
      // Modules with only a source are skipped, they point to images that already exist.
      if (mod.build) {
        let context = mod.build;
        // If the build field points to a URL, clone the repo and attempt to build from the cloned repo.
        if (URL.canParse(context)) {
          const repo_url = new URL(context);
          // The URL can contain '//' which separates the repo from a specific folder within that should be built.
          const [repo_path, folder_path] = repo_url.pathname.split('//');
          repo_url.pathname = repo_path;
          context = await cloneRepo(repo_url.toString());
          context = path.join(context, folder_path);
        }

        const digest = await buildFn({
          context,
        });
        mod.image = digest;
      }
    }

    return this;
  }

  public async tag(tagFn: ModuleTagFn): Promise<Datacenter> {
    for (const [moduleName, mod] of Object.entries(this.getModules())) {
      if (mod.build && mod.image) {
        mod.image = await tagFn(mod.image, moduleName);
      }
    }

    return this;
  }

  public async push(pushFn: ModulePushFn): Promise<Datacenter> {
    for (const module of Object.values(this.getModules())) {
      // Only push modules that have a build field, otherwise the image already exists.
      if (module.build && module.image) {
        await pushFn(module.image);
      }
    }

    return this;
  }

  /**
   * Return all modules within this datacenter.
   */
  private getModules(): Record<string, Module> {
    const modules: Record<string, Module> = {};

    // Extract all top-level modules
    for (const [name, value] of Object.entries(this.module || {})) {
      if (value.length < 1) {
        continue;
      }
      modules[name] = value[0];
    }

    for (const env of this.environment || []) {
      // Extract all environment-level modules
      for (const [name, value] of Object.entries(env.module || {})) {
        if (value.length < 1) {
          continue;
        }
        modules[name] = value[0];
      }

      // Hooks can have the same "name" (the resource type) so ensure uniqueness
      let hookModuleNumber = 0;
      // Extract all environment hook modules
      const hooks = Object.entries(env).filter(([key]) => key !== 'module');
      for (const hook of hooks) {
        const key = hook[0] as ResourceType;
        const values = hook[1] as ResourceHook[];
        for (const value of values) {
          for (const [name, mod] of Object.entries(value.module || {})) {
            if (mod.length < 1) {
              continue;
            }
            modules[`${name}-${hookModuleNumber}`] = mod[0];
            hookModuleNumber += 1;
          }
        }
      }
    }

    return modules;
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

      const module = value[0];

      // The module name cannot be used in the current or parent scoped graph
      if (infraGraph.nodes.find((n) => n.name === name) || scopedGraph.nodes.find((n) => n.name === name)) {
        throw new DuplicateModuleNameError(name);
      }

      if (value[0].when && value[0].when !== 'true' && value[0].when !== 'false') {
        // If a when clause is set but can't be evaluated, it means it has an unresolvable value
        throw new ModuleReferencesNotAllowedInWhenClause();
      } else if (value[0].when && value[0].when === 'false') {
        // If it evaluates to false it should be skipped.
        return;
      } else if (!module.image) {
        console.log(module);
        throw new Error(`Module ${name} must contain a build or source field.`);
      }

      const node = new InfraGraphNode({
        image: module.image,
        inputs: module.inputs,
        component: options.component,
        appNodeId: options.appNodeId,
        volumes: module.volume,
        environment_vars: module.environment,
        name: name,
        action: 'create',
        // TODO: Why is module.ttl parsed as a string?
        ttl: module.ttl ? parseInt(module.ttl) : undefined,
      });

      scopedGraph.insertNodes(node);

      for (const depends_on of module.depends_on || []) {
        const dep = [...scopedGraph.nodes, ...infraGraph.nodes].find((n) => n.name === depends_on);
        if (!dep) {
          throw new Error(`${node.getId()} depends on ${depends_on} but it cannot be found`);
        }

        scopedGraph.insertEdges(
          new GraphEdge({
            from: node.getId(),
            to: dep.getId(),
          }),
        );
      }
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
    const infraGraph = new InfraGraph();

    // Use default values where applicable
    let vars: Record<string, string> = {};
    for (const [key, configs] of Object.entries(this.variable || {})) {
      // Variable keys are an array for some reason. It shouldn't ever be empty though.
      if (configs.length < 1) {
        continue;
      }

      applyContext(configs[0], {
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

    applyContext(this, {
      datacenter: {
        name: options.datacenterName,
      },
      variable: vars,
      var: vars,
    });

    // This is so that we don't mutate the object as part of the getGraph() method
    // NOTE: we do this after variables because we WANT to pin the variable values that were provided
    const dc = new DatacenterV1(this);

    const dcScopedGraph = this.getScopedGraph(infraGraph, dc.module || {}, options);
    infraGraph.insertNodes(...dcScopedGraph.nodes);
    infraGraph.insertEdges(...dcScopedGraph.edges);

    if (options.environmentName) {
      applyContext(dc, {
        environment: {
          name: options.environmentName,
          ...appGraph,
        },
      });

      const outputsMap: Record<string, ResourceOutputs[ResourceType]> = {};
      const resourceScopedGraphs: InfraGraph[] = [];

      for (const env of dc.environment || []) {
        const envScopedGraph = this.getScopedGraph(infraGraph, env.module || {}, options);
        infraGraph.insertNodes(...envScopedGraph.nodes.map((n) => {
          n.environment = options.environmentName;
          return n;
        }));
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
              const hook = JSON.parse(JSON.stringify(value)) as ResourceHook;

              // Make sure all references to `node.*` are replaced with values
              applyContext(hook, {
                node: appGraphNode,
              });

              if (hook.when && hook.when !== 'true' && hook.when !== 'false') {
                // If a when clause is set but can't be evaluated, it means it has an unresolvable value
                throw new ModuleReferencesNotAllowedInWhenClause();
              } else if (hook.when && hook.when === 'false') {
                // If it evaluates to false, its just not a match. Try the next hook.
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
                if (Array.isArray(errs)) {
                  throw new InvalidOutputProperties(type, errs);
                }

                throw errs;
              }

              // We can only match one hook per node
              return;
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
        infraGraph.insertNodes(...g.nodes.map((n) => {
          n.environment = options.environmentName;
          return n;
        }));
        infraGraph.insertEdges(...g.edges);
      });

      // Look for appGraph relationships, create edges, and replace with infraGraph outputs
      infraGraph.nodes = infraGraph.nodes.map((node) => {
        const recursivelyReplaceAppRefs = (input: string): string =>
          input.replace(
            /\$\{\{\s*([a-zA-Z0-9_\-\/]+)\.([a-zA-Z0-9_-]+)\s*\}\}/g,
            (_, component_id, key) => {
              const outputs = outputsMap[component_id] as any;
              if (!outputs) {
                throw new MissingResourceHook(node.getId(), component_id);
              }

              // We need to check output values for app node references too (e.g. ingress url loaded from service url, etc.)
              const outputValue = recursivelyReplaceAppRefs(outputs[key] || '');

              // Check if the output value is actually a pointer to another module
              const moduleRefs = outputValue.matchAll(
                /\$\{\s*([a-zA-Z0-9_\-\/]+)\.([a-zA-Z0-9_-]+)\}/g,
              );
              for (const match of moduleRefs) {
                infraGraph.insertEdges(
                  new GraphEdge({
                    from: node.getId(),
                    to: match[1],
                  }),
                );
              }

              return outputValue.replace(/((?<![\\])['"])((?:.(?!(?<![\\])\1))*.?)\1/g, '\\"$2\\"');
            },
          );

        const stringifiedNode = recursivelyReplaceAppRefs(JSON.stringify(node, null, 2));
        try {
          return new InfraGraphNode(JSON.parse(stringifiedNode));
        } catch (err) {
          console.log(stringifiedNode);
          throw err;
        }
      });
    }

    return infraGraph;
  }
}
