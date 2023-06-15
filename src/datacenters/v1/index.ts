import { ArcctlAccountInputs } from '../../@resources/arcctlAccount/inputs.ts';
import { InputSchema, ResourceInputs, ResourceType } from '../../@resources/index.ts';
import { CloudEdge, CloudGraph, CloudNode } from '../../cloud-graph/index.ts';
import { DeepPartial } from '../../utils/types.ts';
import { Datacenter, ParsedVariablesType, VariablesMetadata } from '../datacenter.ts';

/**
 * @discriminator type
 */
type FullResource = { account: string } & InputSchema;

type Hook<T extends ResourceType = ResourceType> = {
  when?: { type: T } & DeepPartial<ResourceInputs[T]>;
  resources?: {
    [key: string]: FullResource;
  };
  accounts?: {
    [key: string]: ArcctlAccountInputs;
  };
  modules?: {
    [key: string]: {
      source: string;
    } & Record<string, unknown>;
  };
} & DeepPartial<ResourceInputs[T]>;

export default class DatacenterV1 extends Datacenter {
  /**
   * Configure how secrets should be stored.
   */
  secrets!: {
    /**
     * Which account secrets should be stored in
     */
    account: string;

    /**
     * What additional namespacing to use for secrets hosted by the datacenter
     */
    namespace?: string;
  };

  /**
   * Variables whose values will be prompted for when creating the datacenter
   */
  variables?: { [key: string]: VariablesMetadata };

  /**
   * Create resources that live and die with the lifecycle of the datacenter
   */
  resources?: {
    [key: string]: FullResource;
  };

  /**
   * Cloud accounts to register and remove with the lifecycle of the datacenter
   */
  accounts?: {
    [key: string]: ArcctlAccountInputs;
  };

  /**
   * Create terraform modules that live and die with the lifecycle of the datacenter
   */
  modules?: {
    [key: string]: {
      source: string;
    } & Record<string, unknown>;
  };

  /**
   * A template for how environments inside the datacenter should behave
   */
  environment?: {
    /**
     * Configure what resources must exist in each environment in the datacenter
     */
    resources?: {
      [key: string]: FullResource;
    };

    /**
     * Cloud accounts to register and remove with the lifecycle of the environment
     */
    accounts?: {
      [key: string]: ArcctlAccountInputs;
    };

    /**
     * Create terraform modules that should be applied to each environment in the datacenter
     */
    modules?: {
      [key: string]: {
        source: string;
      } & Record<string, unknown>;
    };

    /**
     * Configure rules for how application resources should behave in the environment
     */
    hooks?: Hook[];
  };

  public constructor(data: Record<string, any>) {
    super();
    Object.assign(this, data);
  }

  private getNestedValue(input: any, keys: string[]): any {
    if (keys.length <= 0) {
      return input;
    } else {
      const key = keys.shift();

      if (!(key! in input)) {
        throw new Error(`${key} does not exist in ${JSON.stringify(input)}`);
      }

      return this.getNestedValue(input[key!], keys);
    }
  }

  private replaceDatacenterResourceRefs<T>(graph: CloudGraph, from_node_id: string, contents: T): T {
    return JSON.parse(
      JSON.stringify(contents).replace(
        /\${{\s?resources\.([\w-]+)\.(\S+)\s?}}/g,
        (full_ref, resource_id, resource_key) => {
          const resource = this.resources?.[resource_id];
          if (!resource) {
            throw new Error(`Invalid expression: ${full_ref}`);
          }

          const target_node_id = CloudNode.genId({
            type: resource.type,
            name: resource_id,
          });

          graph.insertEdges(
            new CloudEdge({
              from: from_node_id,
              to: target_node_id,
              required: true,
            }),
          );

          return `\${{ ${target_node_id}.${resource_key} }}`;
        },
      ),
    );
  }

  private replaceDatacenterAccountRefs<T>(graph: CloudGraph, from_node_id: string, contents: T): T {
    return JSON.parse(
      JSON.stringify(contents).replace(
        /\${{\s?accounts\.([\w-]+)\.(\S+)\s?}}/g,
        (full_ref, account_id, resource_key) => {
          const account = this.accounts?.[account_id];
          if (!account) {
            throw new Error(`Invalid expression: ${full_ref}`);
          }

          const target_node_id = CloudNode.genId({
            type: 'arcctlAccount',
            name: account.name,
          });

          graph.insertEdges(
            new CloudEdge({
              from: from_node_id,
              to: target_node_id,
              required: true,
            }),
          );

          return `\${{ ${target_node_id}.${resource_key} }}`;
        },
      ),
    );
  }

  private replaceEnvironmentResourceRefs<T>(
    graph: CloudGraph,
    environmentName: string,
    from_node_id: string,
    contents: T,
  ): T {
    return JSON.parse(
      JSON.stringify(contents).replace(
        /\${{\s?environment\.resources\.([\w-]+)\.(\S+)\s?}}/g,
        (full_ref, resource_id, resource_key) => {
          const resource = this.environment?.resources?.[resource_id];
          if (!resource) {
            throw new Error(`Invalid expression: ${full_ref}`);
          }

          const target_node_id = CloudNode.genId({
            type: resource.type,
            name: resource_id,
            environment: environmentName,
          });

          graph.insertEdges(
            new CloudEdge({
              from: from_node_id,
              to: target_node_id,
              required: true,
            }),
          );

          return `\${{ ${target_node_id}.${resource_key} }}`;
        },
      ),
    );
  }

  private replaceEnvironmentAccountRefs<T>(
    graph: CloudGraph,
    environmentName: string,
    from_node_id: string,
    contents: T,
  ): T {
    return JSON.parse(
      JSON.stringify(contents).replace(
        /\${{\s?environment\.accounts\.([\w-]+)\.(\S+)\s?}}/g,
        (full_ref, account_id, resource_key) => {
          const account = this.environment?.accounts?.[account_id];
          if (!account) {
            throw new Error(`Invalid expression: ${full_ref}`);
          }

          const target_node_id = CloudNode.genId({
            type: 'arcctlAccount',
            name: this.replaceEnvironmentNameRefs(environmentName, account.name),
            environment: environmentName,
          });

          graph.insertEdges(
            new CloudEdge({
              from: from_node_id,
              to: target_node_id,
              required: true,
            }),
          );

          return `\${{ ${target_node_id}.${resource_key} }}`;
        },
      ),
    );
  }

  private replaceEnvironmentNameRefs<T>(environmentName: string, contents: T): T {
    return JSON.parse(JSON.stringify(contents).replace(/\${{\s?environment\.name\s?}}/g, environmentName));
  }

  private replaceDatacenterVariableRefs<T>(contents: T): T {
    if (!this.variables) {
      return contents;
    }

    return JSON.parse(
      JSON.stringify(contents).replace(
        /\${{\s?variables\.([\w-]+)\s?}}/g,
        (_full_ref, variable_name) => {
          const variable_value = this.variable_values[variable_name];
          if (variable_value === undefined) {
            throw Error(`Variable ${variable_name} has no value`);
          }
          // TODO(tyler): Won't always be a string, make sure we can toString it
          return variable_value as string;
        },
      ),
    );
  }

  public getVariables(): ParsedVariablesType {
    if (!this.variables) {
      return {};
    }

    const variables: ParsedVariablesType = { ...this.variables };
    const variable_regex = /\${{\s?variables\.([\w-]+)\s?}}/;

    const variable_names = new Set(Object.keys(variables));

    for (const [variable_name, variable_metadata] of Object.entries(variables)) {
      for (const [metadata_key, metadata_value] of Object.entries(variable_metadata)) {
        if (typeof metadata_value === 'string' && variable_regex.test(metadata_value)) {
          const match = metadata_value.match(variable_regex);
          if (match && match.length > 1) {
            if (!variables[variable_name].depenendant_variables) {
              variables[variable_name].depenendant_variables = [];
            }

            const variable_value = match[1];
            if (!variable_names.has(variable_value)) {
              throw new Error(
                `Variable reference '${metadata_key}: ${metadata_value}' references variable '${variable_value}' that does not exist.`,
              );
            }

            variables[variable_name].depenendant_variables?.push({
              key: metadata_key as keyof VariablesMetadata,
              value: match[1],
            });
          }
        }
      }
    }

    return variables;
  }

  public setVariableValues(variables: Record<string, unknown>) {
    this.variable_values = variables;
  }

  public enrichGraph(graph: CloudGraph, environmentName?: string): Promise<CloudGraph> {
    // Create nodes for explicit resources of the datacenter
    for (const [key, value] of Object.entries(this.resources || {})) {
      const node = new CloudNode({
        name: key,
        inputs: value,
      });

      node.inputs = this.replaceDatacenterVariableRefs(node.inputs);
      node.inputs = this.replaceDatacenterResourceRefs(graph, node.id, node.inputs);
      node.inputs = this.replaceDatacenterAccountRefs(graph, node.id, node.inputs);

      graph.insertNodes(node);
    }

    // Create nodes for datacenter accounts
    for (const value of Object.values(this.accounts || {})) {
      const node = new CloudNode({
        name: value.name,
        inputs: {
          type: 'arcctlAccount',
          account: 'n/a', // Helps it skip hook mutations
          ...value,
        },
      });

      node.inputs = this.replaceDatacenterVariableRefs(node.inputs);
      node.inputs = this.replaceDatacenterResourceRefs(graph, node.id, node.inputs);

      graph.insertNodes(node);
    }

    // Fill the graph with things that should be in the environment
    if (environmentName) {
      // Create nodes for explicit resources that should be in each environment
      for (const [key, value] of Object.entries(this.environment?.resources || {})) {
        const node = new CloudNode({
          name: key,
          environment: environmentName,
          inputs: value,
        });

        node.inputs = this.replaceDatacenterVariableRefs(node.inputs);
        node.inputs = this.replaceDatacenterResourceRefs(graph, node.id, node.inputs);
        node.inputs = this.replaceDatacenterAccountRefs(graph, node.id, node.inputs);
        node.inputs = this.replaceEnvironmentResourceRefs(graph, environmentName, node.id, node.inputs);
        node.inputs = this.replaceEnvironmentAccountRefs(graph, environmentName, node.id, node.inputs);
        node.inputs = this.replaceEnvironmentNameRefs(environmentName, node.inputs);

        graph.insertNodes(node);
      }

      // Create nodes for environment accounts
      for (const value of Object.values(this.environment?.accounts || {})) {
        const node = new CloudNode({
          name: this.replaceEnvironmentNameRefs(environmentName, value.name),
          environment: environmentName,
          inputs: {
            type: 'arcctlAccount',
            account: 'n/a', // Helps it skip hook mutations
            ...value,
          },
        });

        node.inputs = this.replaceDatacenterVariableRefs(node.inputs);
        node.inputs = this.replaceDatacenterResourceRefs(graph, node.id, node.inputs);
        node.inputs = this.replaceEnvironmentResourceRefs(graph, environmentName, node.id, node.inputs);
        node.inputs = this.replaceEnvironmentNameRefs(environmentName, node.inputs);

        graph.insertNodes(node);
      }

      // Run hooks on each node
      for (const node of graph.nodes) {
        // Skip nodes that already have an account
        if (node.account) continue;

        // See if the node matches any hooks
        for (const hook of this.environment?.hooks || []) {
          const doesMatchNode = !hook.when ||
            Object.entries(hook.when || {}).every(
              ([key, value]) => key in node.inputs && (node.inputs as any)[key] === value,
            );

          if (!doesMatchNode) {
            console.log(`skipping: ${hook}`);
            continue;
          }

          const replaceHookExpressions = <T>(
            resources: { [key: string]: InputSchema },
            accounts: { [key: string]: ArcctlAccountInputs },
            from_node_name: string,
            from_node_id: string,
            contents: T,
          ): T =>
            JSON.parse(
              JSON.stringify(contents)
                .replace(/\${{\s?this\.resources\.([\w-]+)\.(\S+)\s?}}/g, (full_ref, resource_id, resource_key) => {
                  const resource = resources?.[resource_id];
                  if (!resource) {
                    throw new Error(`Invalid expression: ${full_ref}`);
                  }

                  const target_node_id = CloudNode.genId({
                    type: resource.type,
                    name: `${from_node_name}/${resource_id}`,
                    environment: environmentName,
                    component: node.component,
                  });
                  graph.insertEdges(
                    new CloudEdge({
                      from: from_node_id,
                      to: target_node_id,
                      required: true,
                    }),
                  );

                  return `\${{ ${target_node_id}.${resource_key} }}`;
                })
                .replace(/\${{\s?this\.accounts\.([\w-]+)\.(\S+)\s?}}/g, (full_ref, account_id, resource_key) => {
                  const account = accounts?.[account_id];
                  if (!account) {
                    throw new Error(`Invalid expression: ${full_ref}`);
                  }

                  const target_node_id = CloudNode.genId({
                    type: 'arcctlAccount',
                    name: this.replaceEnvironmentNameRefs(environmentName, account.name),
                    environment: environmentName,
                    component: node.component,
                  });
                  graph.insertEdges(
                    new CloudEdge({
                      from: from_node_id,
                      to: target_node_id,
                      required: true,
                    }),
                  );

                  return `\${{ ${target_node_id}.${resource_key} }}`;
                })
                .replace(
                  /\${{\s?this\.(\S+)\s?}}/g,
                  (_, node_key: string) => {
                    return this.getNestedValue(node, node_key.split('.'));
                  },
                ),
            );

          // Create inline resources defined by the hook
          for (const [resource_key, resource_config] of Object.entries(hook.resources || {})) {
            const newResourceName = `${node.name}/${resource_key}`;

            const hook_node_id = CloudNode.genId({
              type: resource_config.type,
              name: newResourceName,
              component: node.component,
              environment: environmentName,
            });

            graph.insertNodes(
              new CloudNode({
                name: newResourceName,
                environment: environmentName,
                component: node.component,
                inputs: this.replaceDatacenterVariableRefs(
                  this.replaceDatacenterAccountRefs(
                    graph,
                    hook_node_id,
                    this.replaceDatacenterResourceRefs(
                      graph,
                      hook_node_id,
                      this.replaceEnvironmentNameRefs(
                        environmentName,
                        this.replaceEnvironmentAccountRefs(
                          graph,
                          environmentName,
                          hook_node_id,
                          this.replaceEnvironmentResourceRefs(
                            graph,
                            environmentName,
                            hook_node_id,
                            replaceHookExpressions(
                              hook.resources || {},
                              hook.accounts || {},
                              newResourceName,
                              hook_node_id,
                              JSON.parse(
                                JSON.stringify(resource_config).replace(
                                  /\${{\s?this\.outputs\.(\S+)\s?}}/g,
                                  (_, key: string) => {
                                    graph.insertEdges(
                                      new CloudEdge({
                                        from: hook_node_id,
                                        to: node.id,
                                        required: true,
                                      }),
                                    );

                                    return `\${{ ${node.id}.${key} }}`;
                                  },
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              }),
            );
          }

          // Create inline accounts defined by the hook
          for (const account_config of Object.values(hook.accounts || {})) {
            const newResourceName = this.replaceEnvironmentNameRefs(environmentName, account_config.name);

            const hook_node_id = CloudNode.genId({
              type: 'arcctlAccount',
              name: newResourceName,
              component: node.component,
              environment: environmentName,
            });
            graph.insertNodes(
              new CloudNode({
                name: newResourceName,
                environment: environmentName,
                component: node.component,
                inputs: this.replaceDatacenterVariableRefs(
                  this.replaceDatacenterAccountRefs(
                    graph,
                    hook_node_id,
                    this.replaceDatacenterResourceRefs(
                      graph,
                      hook_node_id,
                      this.replaceEnvironmentNameRefs(
                        environmentName,
                        this.replaceEnvironmentAccountRefs(
                          graph,
                          environmentName,
                          hook_node_id,
                          this.replaceEnvironmentResourceRefs(
                            graph,
                            environmentName,
                            hook_node_id,
                            replaceHookExpressions(
                              hook.resources || {},
                              hook.accounts || {},
                              newResourceName,
                              hook_node_id,
                              JSON.parse(
                                JSON.stringify(account_config).replace(
                                  /\${{\s?this\.outputs\.(\S+)\s?}}/g,
                                  (_, key: string) => {
                                    graph.insertEdges(
                                      new CloudEdge({
                                        from: hook_node_id,
                                        to: node.id,
                                        required: true,
                                      }),
                                    );

                                    return `\${{ ${node.id}.${key} }}`;
                                  },
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              }),
            );
          }

          // Update
          const hookData = { ...hook };
          const hookResources = hookData.resources || {};
          const hookAccounts = hookData.accounts || {};
          delete hookData.when;
          delete hookData.resources;
          delete hookData.accounts;

          node.inputs = this.replaceDatacenterAccountRefs(
            graph,
            node.id,
            this.replaceDatacenterResourceRefs(
              graph,
              node.id,
              this.replaceEnvironmentAccountRefs(
                graph,
                environmentName,
                node.id,
                this.replaceEnvironmentResourceRefs(
                  graph,
                  environmentName,
                  node.id,
                  replaceHookExpressions(hookResources, hookAccounts, node.name, node.id, {
                    ...node.inputs,
                    ...hookData,
                    account: node.inputs.account || hookData.account,
                  } as any),
                ),
              ),
            ),
          );

          graph.insertNodes(node);

          if (node.account) {
            break;
          }
        }
      }
    }

    return Promise.resolve(graph);
  }

  public getSecretsConfig(): DatacenterSecretsConfig {
    return this.secrets;
  }
}
