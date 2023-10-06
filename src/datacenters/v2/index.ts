import { InputSchema, ResourceInputs } from '../../@resources/index.ts';
import OutputsSchema from '../../@resources/outputs-schema.ts';
import { CloudEdge } from '../../cloud-graph/edge.ts';
import { CloudGraph } from '../../cloud-graph/graph.ts';
import { CloudNode } from '../../cloud-graph/node.ts';
import { Plugin } from '../../modules/index.ts';
import {
  Datacenter,
  DatacenterEnrichmentOptions,
  DockerBuildFn,
  DockerPushFn,
  DockerTagFn,
  ParsedVariablesType,
  VariablesMetadata,
} from '../datacenter.ts';
import { applyContext, applyContextRecursive } from './ast-parser.ts';

export type DatacenterModuleV2 = {
  source: string;
  inputs: Record<string, any>;
  plugin?: Plugin;
} & InputSchema;

export type HookV2 = {
  when: string;
  modules: Record<string, DatacenterModuleV2>;
  outputs: Record<string, any>;
};

export type EnvironmentV2 = {
  hooks: HookV2[];
  modules: Record<string, DatacenterModuleV2>;
};

export type DatacenterVariableV2 = {
  type: keyof ResourceInputs | 'string' | 'number' | 'boolean';
  description?: string;
  provider?: string;
  value?: string | number | boolean;
} & { [key in keyof ResourceInputs]?: string };

export type DatacenterDataV2 = {
  variables: {
    [key: string]: DatacenterVariableV2;
  };
  modules: {
    [key: string]: DatacenterModuleV2;
  };
  environment: EnvironmentV2;
};

const COMPONENT_RESOURCES = [
  'deployment',
  'service',
  'ingressRule',
  'database',
  'databaseUser',
  'secret',
];

const DEFAULT_PLUGIN: Plugin = 'pulumi';

export default class DatacenterV2 extends Datacenter {
  private datacenter!: DatacenterDataV2;
  private modules: Record<string, DatacenterModuleV2> = {};
  private moduleImages: Record<string, string> = {};

  constructor(data: any) {
    super();
    if (data.input_type === 'hcl') {
      this.datacenter = this.convertToV2(data);
    }
    Object.assign(this, data);
  }

  private cleanupWhenClause(when: string): string {
    if (when.startsWith('${')) {
      when = when.substring(2);
    }
    if (when.endsWith('}')) {
      when = when.substring(0, when.length - 1);
    }
    return when;
  }

  private convertToV2(data: any): DatacenterDataV2 {
    const modules: Record<string, any> = {};
    for (const [key, value] of Object.entries(data.module || {})) {
      modules[key] = (value as any)[0] || value;
    }
    const variables: Record<string, any> = {};
    for (const [key, value] of Object.entries(data.variable || {})) {
      variables[key] = (value as any)[0] || value;
    }
    const datacenter: DatacenterDataV2 = {
      variables: {
        ...variables,
      },
      modules: {
        ...modules,
      },
      environment: {
        hooks: [],
        modules: {},
      },
    };

    if (data.environment?.length && data.environment[0]) {
      if (data.environment[0].module) {
        for (const [key, value] of Object.entries(data.environment[0].module)) {
          datacenter.environment.modules[key] = (value as any)[0] || value;
          modules[key] = datacenter.environment.modules[key];
        }
      }
    }

    for (const type of COMPONENT_RESOURCES) {
      if (data.environment?.length && data.environment[0][type]) {
        for (const entry of data.environment[0][type]) {
          const modules: Record<string, any> = {};
          for (const [key, value] of Object.entries(entry.module)) {
            modules[key] = (value as any)[0] || value;
          }
          const when = entry.when ? ` && ${this.cleanupWhenClause(entry.when)}` : '';
          datacenter.environment.hooks.push({
            when: `\${node.type == \"${type}\"${when}}`,
            modules,
            outputs: entry.outputs,
          });
        }
      }
    }

    for (const hook of datacenter.environment.hooks) {
      for (const [key, module] of Object.entries(hook.modules)) {
        modules[key] = module;
      }
    }
    this.modules = modules;

    return datacenter;
  }

  private stringMustacheReplace(str: string, replacer: (matcher: string, key: string) => string) {
    let result = str;
    let start = 0;
    while (true) {
      const index = result.indexOf('${{', start);
      if (index === -1) {
        break;
      }
      let braceCount = 2;
      for (let i = index + 3; i < result.length; i++) {
        if (result[i] === '{') {
          braceCount++;
        } else if (result[i] === '}') {
          braceCount--;
        }
        if (braceCount === 0) {
          const match = result.substring(index, i + 1);
          const key = result.substring(index + 3, i - 2);
          const value = replacer(match, key.trim());
          result = result.substring(0, index) + value + result.substring(i + 2);
          start = index + value.length;
          break;
        }
      }
    }
    return result;
  }

  private convertStringToMustach(str: string) {
    let result = str;
    let start = 0;
    while (true) {
      const index = result.indexOf('${', start);
      if (index === -1) {
        break;
      }
      if (result[index + 2] === '{') {
        start += 2;
        continue;
      }
      let braceCount = 1;
      for (let i = index + 2; i < result.length; i++) {
        if (result[i] === '{') {
          braceCount++;
        } else if (result[i] === '}') {
          braceCount--;
        }
        if (braceCount === 0) {
          const key = result.substring(index + 2, i);
          const value = '${{ ' + key.trim() + ' }}';
          result = result.substring(0, index) + value + result.substring(i + 1);
          start = index + value.length;
          break;
        }
      }
    }
    return result;
  }

  private replaceObject(obj: any, replacer: (matcher: string, key: string) => string) {
    for (const [key, value] of Object.entries(obj)) {
      if (!value) {
        continue;
      }
      if (typeof value === 'object' || Array.isArray(value)) {
        this.replaceObject(value, replacer);
      } else {
        obj[key] = this.stringMustacheReplace(value.toString(), replacer);
      }
    }
  }

  private convertToMustache(obj: any) {
    for (const [key, value] of Object.entries(obj)) {
      if (!value) {
        continue;
      }
      if (typeof value === 'object' || Array.isArray(value)) {
        this.convertToMustache(value);
      } else {
        obj[key] = this.convertStringToMustach(value.toString());
      }
    }
    return obj;
  }

  private addModules(
    graph: CloudGraph,
    resultGraph: CloudGraph,
    modules: Record<string, any>,
    nodeNameToModuleLookup: Record<string, CloudNode>,
    options?: DatacenterEnrichmentOptions,
  ) {
    const nodes: CloudNode[] = [];
    for (const [name, value] of Object.entries(modules)) {
      const copied_value = {
        ...value,
      };
      applyContextRecursive(copied_value, {
        node: {
          ...value,
          type: value.inputs.type,
        },
        datacenter: {
          name: options?.datacenterName,
        },
        environment: {
          name: options?.environmentName,
        },
      });
      const id = CloudNode.genId({
        name: name,
        type: 'module',
      });
      nodes.push({
        account: undefined,
        id,
        resource_id: id,
        name,
        image: this.moduleImages[name],
        type: 'module',
        inputs: this.convertToMustache(copied_value.inputs as any),
        plugin: value.plugin || DEFAULT_PLUGIN,
      });
      nodeNameToModuleLookup[name] = nodes[nodes.length - 1];
    }
    for (const node of nodes) {
      this.replaceObject(node, (match, key) => {
        const key_parts = key.split('.');
        const nodeTo = nodeNameToModuleLookup[key_parts[1]];
        if (!nodeTo) {
          throw new Error(`Missing node for key: ${key_parts[1]}`);
        }
        const toId = CloudNode.genId({
          name: nodeTo.name,
          type: nodeTo.inputs.type || 'module',
        });
        resultGraph.insertEdges(
          new CloudEdge({
            from: `${node.id}`,
            to: `${toId}`,
          }),
        );
        return `\${{ ${[`${toId}`, key_parts[2]].join('.')} }}`;
      });
    }
    resultGraph.insertNodes(...nodes);
  }

  private addHooks(
    graph: CloudGraph,
    resultGraph: CloudGraph,
    nodeNameToModuleLookup: Record<string, CloudNode>,
    options: DatacenterEnrichmentOptions,
  ) {
    const hookModuleNodes: CloudNode[] = [];
    const moduleOutputContext: Record<string, string> = {};
    for (const node of graph.nodes) {
      for (const hook of this.datacenter.environment.hooks) {
        const localHookModules: Record<string, CloudNode> = {};
        const copied_hook = JSON.parse(JSON.stringify(hook));
        applyContextRecursive(copied_hook, {
          node: {
            ...node,
            type: node.inputs.type,
          },
          datacenter: {
            name: options.datacenterName,
          },
          environment: {
            name: options.environmentName,
          },
        });
        if (copied_hook.when !== 'true') {
          continue;
        }
        const lookupId = CloudNode.genId({
          name: node.name,
          type: node.inputs.type,
          component: node.component,
          environment: node.environment,
        });
        for (const [module_name, module] of Object.entries(copied_hook.modules)) {
          const name = CloudNode.genId({
            name: node.name,
            type: module_name as any,
            component: node.component,
            environment: node.environment,
          });
          const moduleNode: CloudNode = {
            account: undefined,
            id: name,
            resource_id: name,
            name: name,
            image: this.moduleImages[module_name],
            type: 'module',
            inputs: JSON.parse(JSON.stringify((module as any).inputs)),
          };
          localHookModules[module_name] = moduleNode;
          hookModuleNodes.push(moduleNode);
        }

        const schemaDefinition = OutputsSchema[node.inputs.type].definitions;
        const schema = Object.entries(schemaDefinition)[0][1] as Record<string, any>;
        if ('required' in schema) {
          const schemaDefinitionKeys = Object.values(schema.required as any) as string[];
          const hookOutputKeys = Object.keys(copied_hook.outputs);
          const missingKeys = schemaDefinitionKeys.filter((k: string) => !hookOutputKeys.includes(k));
          if (missingKeys.length > 0) {
            throw new Error(`Missing output keys: ${missingKeys.join(', ')} for ${node.id}`);
          }
        }

        this.replaceObject(this.convertToMustache(copied_hook.outputs), (match, key) => {
          const key_parts = key.split('.');
          if (key_parts[0] !== 'module') {
            return match;
          }
          try {
            const outputName = localHookModules[key_parts[1]]
              ? localHookModules[key_parts[1]].name
              : 'module/' + nodeNameToModuleLookup[key_parts[1]].name;
            key_parts.shift();
            key_parts.shift();
            const identifier = key_parts.join('.');
            const toId = `${outputName}.${identifier}`;
            moduleOutputContext[`${lookupId}.${identifier}`] = toId;
            return `\${{ ${toId} }}`;
          } catch (err) {
            console.log(`Couold not find module output for key: ${key_parts[1]}`);
            throw err;
          }
        });

        // Only 1 hook can be used per module
        break;
      }
    }
    resultGraph.insertNodes(...hookModuleNodes);

    for (const hookModuleNode of hookModuleNodes) {
      this.replaceObject(this.convertToMustache(hookModuleNode.inputs), (match: string, key: string) => {
        if (moduleOutputContext[key]) {
          const keyParts = key.split('.');
          const id = keyParts[0];
          resultGraph.insertEdges(
            new CloudEdge({
              from: `${hookModuleNode.id}`,
              to: `${id}`,
            }),
          );
          return `\${{ ${moduleOutputContext[key]} }}`;
        }
        const keyParts = key.split('.');
        const id = keyParts[1];
        keyParts.shift();
        keyParts.shift();
        const identifier = keyParts.join('.');
        if (nodeNameToModuleLookup[id]) {
          return `\${{ module/${nodeNameToModuleLookup[id].name}.${identifier} }}`;
        }
        console.log(`Could not find module for key: ${key}`);
        return match;
      });
    }
  }

  public enrichGraph(
    graph: CloudGraph,
    options: DatacenterEnrichmentOptions,
  ): Promise<CloudGraph> {
    applyContext(graph, {
      datacenter: {
        name: options.datacenterName,
      },
    });
    if (options.environmentName) {
      applyContext(graph, {
        environment: {
          name: options.environmentName,
        },
      });
    }
    const resultGraph = new CloudGraph();
    const nodeNameToModuleLookup: Record<string, CloudNode> = {};
    this.addModules(graph, resultGraph, this.datacenter.modules, nodeNameToModuleLookup, options);
    if (options.environmentName && this.datacenter.environment && this.datacenter.environment.modules) {
      this.addModules(graph, resultGraph, this.datacenter.environment.modules, nodeNameToModuleLookup, options);
    }
    this.addHooks(graph, resultGraph, nodeNameToModuleLookup, options);
    return Promise.resolve(resultGraph);
  }

  public getVariables(): ParsedVariablesType {
    if (!this.datacenter.variables) {
      return {};
    }

    // Parse/stringify to deep copy the object.
    // Don't want dependant_variables metadata key to end up in the json dumped datacenter
    const variables: ParsedVariablesType = JSON.parse(JSON.stringify(this.datacenter.variables));
    const variable_names = new Set(Object.keys(variables));
    const variable_regex = /\${\s*?variable\.([\w-]+)\s*?}/;

    for (const [variable_name, variable_metadata] of Object.entries(variables)) {
      for (const [metadata_key, metadata_value] of Object.entries(variable_metadata)) {
        if (typeof metadata_value === 'string' && variable_regex.test(metadata_value)) {
          const match = metadata_value.match(variable_regex);
          if (match && match.length > 1) {
            if (!variables[variable_name].dependant_variables) {
              variables[variable_name].dependant_variables = [];
            }

            const variable_value = match[1];
            if (!variable_names.has(variable_value)) {
              throw new Error(
                `Variable reference '${metadata_key}: ${metadata_value}' references variable '${variable_value}' that does not exist.`,
              );
            }

            variables[variable_name].dependant_variables?.push({
              key: metadata_key as keyof VariablesMetadata,
              value: match[1],
            });
          }
        }
      }
    }

    return variables;
  }

  private replaceVariableValues(obj: Record<string, unknown>, variables: Record<string, any>) {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object') {
        this.replaceVariableValues(value as Record<string, unknown>, variables);
      } else if (typeof value === 'string') {
        obj[key] = value.replace(
          /\${\s*?variable\.([\w-]+)\s*?}/g,
          (_full_ref, variable_name) => {
            const variable_value = variables[variable_name];
            if (variable_value === undefined) {
              throw Error(`Variable ${variable_name} has no value`);
            }
            return variable_value as string;
          },
        ).replace(
          /\s*?variable\.([\w-]+)/g,
          (_full_ref, variable_name) => {
            const variable_value = variables[variable_name];
            if (variable_value === undefined) {
              throw Error(`Variable ${variable_name} has no value`);
            }
            return variable_value as string;
          },
        );
      }
    }
  }

  public setVariableValues(variables: Record<string, unknown>): void {
    this.replaceVariableValues(this.datacenter, variables);
  }

  public async build(buildFn: DockerBuildFn): Promise<Datacenter> {
    for (const [moduleName, module] of Object.entries(this.modules || {})) {
      const digest = await buildFn({
        context: module.source,
        plugin: module.plugin || DEFAULT_PLUGIN,
      });
      this.moduleImages[moduleName] = digest;
    }

    return this;
  }

  public async tag(tagFn: DockerTagFn): Promise<Datacenter> {
    for (const [moduleName, image] of Object.entries(this.moduleImages || {})) {
      this.moduleImages[moduleName] = await tagFn(image, moduleName);
    }

    return this;
  }

  public async push(pushFn: DockerPushFn): Promise<Datacenter> {
    for (const [_, image] of Object.entries(this.moduleImages || {})) {
      await pushFn(image);
    }

    return this;
  }
}
