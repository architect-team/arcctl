import { InputSchema, ResourceInputs } from '../../@resources/index.ts';
import { CloudGraph } from '../../cloud-graph/graph.ts';
import { CloudNode } from '../../cloud-graph/node.ts';
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
  'secret',
];

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
    for (const [key, value] of Object.entries(data.module)) {
      modules[key] = (value as any)[0] || value;
    }
    const variables: Record<string, any> = {};
    for (const [key, value] of Object.entries(data.variable)) {
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

    if (data.environment[0]) {
      if (data.environment[0].module) {
        for (const [key, value] of Object.entries(data.environment[0].module)) {
          datacenter.environment.modules[key] = (value as any)[0] || value;
          modules[key] = datacenter.environment.modules[key];
        }
      }
    }

    for (const type of COMPONENT_RESOURCES) {
      if (data.environment[0][type]) {
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
          const key = result.substring(index + 3, i - 1);
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
    return str.replaceAll('${', '${{').replaceAll('}', '}}');
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
    nodeLookup: Record<string, CloudNode>,
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
      });
      nodeLookup[name] = nodes[nodes.length - 1];
    }
    for (const node of nodes) {
      this.replaceObject(node, (match, key) => {
        const key_parts = key.split('.');
        const nodeTo = nodeLookup[key_parts[1]];
        const toId = CloudNode.genId({
          name: nodeTo.name,
          type: nodeTo.inputs.type || 'module',
        });
        resultGraph.insertEdges({
          id: `${node.id}-${toId}`,
          from: `${node.id}`,
          to: `${toId}`,
          required: true,
        });
        return `\${{ ${[`${toId}`, key_parts[3]].join('.')} }}`;
      });
    }
    resultGraph.insertNodes(...nodes);
  }

  public enrichGraph(
    graph: CloudGraph,
    options: DatacenterEnrichmentOptions,
  ): Promise<CloudGraph> {
    if (options.environmentName) {
      applyContext(graph, {
        environment: {
          name: options.environmentName,
        },
      });
    }
    const resultGraph = new CloudGraph();
    const nodeLookup: Record<string, CloudNode> = {};
    this.addModules(graph, resultGraph, this.datacenter.modules, nodeLookup);
    if (options.environmentName && this.datacenter.environment && this.datacenter.environment.modules) {
      this.addModules(graph, resultGraph, this.datacenter.environment.modules, nodeLookup);
    }
    graph = JSON.parse(JSON.stringify(graph).replace('${{', '${').replace('}}', '}'));
    graph.nodes.forEach((node) => {
      if ('name' in node.inputs) {
        const id = CloudNode.genId({
          name: node.name,
          type: node.inputs.type,
          component: node.component,
          environment: node.environment,
        });
        nodeLookup[id] = node;
      }
    });
    const hookLookup: Record<string, HookV2> = {};
    const nodes: CloudNode[] = [];
    for (const node of graph.nodes) {
      for (const hook of this.datacenter.environment.hooks) {
        const copied_hook = JSON.parse(JSON.stringify(hook));
        applyContextRecursive(copied_hook, {
          node: {
            ...node,
            type: node.inputs.type,
          },
          environment: {
            name: options.environmentName,
          },
        });
        if (copied_hook.when === 'true') {
          const id = CloudNode.genId({
            name: node.name,
            type: node.inputs.type,
            component: node.component,
            environment: node.environment,
          });
          hookLookup[id] = hook;
          for (
            const [module_name, module] of Object.entries(
              {
                ...copied_hook,
              }.modules,
            )
          ) {
            const name = `${id}`;
            const duplicated_inputs = this.convertToMustache({
              ...(module as any).inputs,
            });
            this.replaceObject(duplicated_inputs, (match, key) => {
              const key_parts = key.split('.');
              const nodeTo = nodeLookup[key_parts[1]];
              const toId = CloudNode.genId({
                name: nodeTo.name,
                type: nodeTo.inputs.type || 'module',
              });
              resultGraph.insertEdges({
                id: `${id}-${toId}`,
                from: `${id}`,
                to: `${toId}`,
                required: true,
              });
              return `\${{ ${[`${toId}`, key_parts[3]].join('.')} }}`;
            });
            nodes.push({
              account: undefined,
              id: name,
              resource_id: name,
              name: name,
              image: this.moduleImages[module_name],
              type: 'module',
              inputs: duplicated_inputs,
            });
          }
        }
      }
    }
    for (const node of nodes) {
      this.replaceObject(node, (match, key) => {
        const key_parts = key.split('.');
        const hook = hookLookup[key_parts[0]];
        const nodeTo = nodeLookup[key_parts[0]];
        if (!hook) {
          return match;
        }
        let to;
        if (!hook.outputs && Object.entries(hook.modules).length > 1) {
          throw new Error(`Missing outputs for hook: ${key_parts[0]}`);
        } else if (Object.entries(hook.modules).length === 1) {
          const key = Object.keys(hook.modules)[0];
          const id = CloudNode.genId({
            name: nodeTo.name,
            type: nodeTo.inputs.type,
            component: nodeTo.component,
            environment: nodeTo.environment,
          });
          to = `${key}/${id}`;
        } else {
          if (!key_parts[1]) {
            key_parts.push('id');
          }
          const path = hook.outputs[key_parts[1]];
          if (!path) {
            console.log(`Missing output for key: ${key_parts}`);
          }
          const path_parts = path.split('.');
          const key = Object.keys(hook.modules)[0];
          const id = CloudNode.genId({
            name: nodeTo.name,
            type: nodeTo.inputs.type,
            component: nodeTo.component,
            environment: nodeTo.environment,
          });
          to = `${path_parts[1]}/${key}/${id}`;
        }
        resultGraph.insertEdges({
          id: `${node.id}-${to}`,
          from: `${node.id}`,
          to: `${to}`,
          required: true,
        });
        key_parts.shift();
        return `\${{ ${[`${to}`, ...key_parts].join('.')} }`;
      });
      resultGraph.insertNodes(node);
    }
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
