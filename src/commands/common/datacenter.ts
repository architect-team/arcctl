import * as path from 'std/path/mod.ts';
import winston, { Logger } from 'winston';
import { BuildResponse, ModuleServer } from '../../datacenter-modules/index.ts';
import {
  Datacenter,
  DatacenterRecord,
  DatacenterStore,
  DatacenterVariablesSchema,
  ParsedVariablesMetadata,
} from '../../datacenters/index.ts';
import { InfraGraph } from '../../graphs/index.ts';
import { topologicalSort } from '../../utils/sorting.ts';
import { Inputs } from './inputs.ts';

export class DatacenterUtils {
  constructor(
    private readonly datacenterStore: DatacenterStore,
  ) {}

  /**
   * Store the pipeline in the datacenters secret manager and then log
   * it to the datacenter store
   */
  public async saveDatacenter(datacenterName: string, datacenter: Datacenter, priorState: InfraGraph): Promise<void> {
    await this.datacenterStore.save({
      name: datacenterName,
      config: datacenter,
      priorState: priorState,
    });
  }

  public async removeDatacenter(record: DatacenterRecord): Promise<void> {
    await this.datacenterStore.remove(record.name);
  }

  /**
   * Prompts for all variables required by a datacenter.
   * If variables cannot be prompted in a valid order (e.g. a cycle in variable dependencies),
   * an error is thrown.
   */
  public async promptForVariables(
    variables: DatacenterVariablesSchema,
    user_inputs: Record<string, string> = {},
  ): Promise<Record<string, unknown>> {
    const variable_inputs: Record<string, unknown> = {};

    const sorted_vars = this.sortVariables(variables);

    while (sorted_vars.length > 0) {
      const variable = sorted_vars.shift()!;

      // If the variable input was passed in by the user or contains a default,
      // this will validate that their input matches a given resource/account if necessary.
      const variable_value = await this.promptForVariableFromMetadata(
        variable.name,
        variable.metadata,
        user_inputs[variable.name] || variable.metadata.value?.toString(),
      );

      variable_inputs[variable.name] = variable_value;

      // Fill in metadata that relied on this variable
      for (const next_variable of sorted_vars) {
        if (next_variable.dependencies.has(variable.name)) {
          const dependency = variables[next_variable.name].dependant_variables?.find((dep) =>
            dep.value === variable.name
          )!;

          (next_variable.metadata as Record<string, unknown>)[dependency.key] = variable_value;
        }
      }
    }
    return variable_inputs;
  }

  private async promptForVariableFromMetadata(
    name: string,
    metadata: ParsedVariablesMetadata,
    value?: string,
  ): Promise<string | boolean | number | undefined> {
    const message = `${name}: ${metadata.description}`;
    if (metadata.type === 'string') {
      return value || Inputs.promptString(message);
    } else if (metadata.type === 'boolean') {
      return value || Inputs.promptBoolean(message);
    } else if (metadata.type === 'number') {
      return value || Inputs.promptNumber(message);
    }

    throw new Error(`Invalid variable type: ${metadata.type}`);
  }

  /*
   * Sort ParsedVariablesType into an order that can be prompted for, ensuring variables that
   * depend on other variables get resolved first. If no valid order exists (e.g., there are cycles),
   * this raises an error.
   */
  public sortVariables(
    variables: DatacenterVariablesSchema,
  ): { name: string; metadata: ParsedVariablesMetadata; dependencies: Set<string> }[] {
    const variable_graph: Record<string, Set<string>> = {};
    for (const [variable_name, variable_metadata] of Object.entries(variables)) {
      const var_dependencies = new Set(
        variable_metadata.dependant_variables ? variable_metadata.dependant_variables.map((v) => v.value) : [],
      );
      variable_graph[variable_name] = var_dependencies;
    }

    const result = topologicalSort(variable_graph);

    // We must reverse the topological sort to get the correct ordering - the edges in this
    // graph are variables the node depends on, so those dependencies must be prompted for first.
    result.reverse();

    const vars = [];
    for (const var_name of result) {
      vars.push({
        name: var_name,
        metadata: variables[var_name],
        dependencies: variable_graph[var_name],
      });
    }
    return vars;
  }

  public async applyDatacenter(
    name: string,
    datacenter: Datacenter,
    graph: InfraGraph,
    logger?: winston.Logger,
    concurrency?: number,
  ): Promise<void> {
    return new Promise((resolve) => {
      return graph
        .apply({ logger, concurrency })
        .subscribe({
          complete: async () => {
            await this.saveDatacenter(name, datacenter, graph);
            resolve();
          },
          error: async (err) => {
            await this.saveDatacenter(name, datacenter, graph);
            console.error(err);
            Deno.exit(1);
          },
        });
    });
  }

  public async buildDatacenter(datacenter: Datacenter, context: string, logger?: Logger): Promise<Datacenter> {
    const promises: Record<string, Promise<string>> = {};

    return datacenter.build(async (build_options) => {
      // An absolute path is set as build_options.context when building from a git repo.
      let module_path = path.isAbsolute(build_options.context)
        ? build_options.context
        : path.join(path.dirname(context), build_options.context);

      if (!path.isAbsolute(path.dirname(context))) {
        module_path = path.resolve(module_path);
      }

      if (module_path in promises) {
        // Build has already started. Return results.
        return promises[module_path];
      }

      console.log(`Building module: ${module_path}`);
      promises[module_path] = new Promise((resolve, reject) => {
        const server = new ModuleServer(build_options.plugin);
        server.start(module_path).then(async (client) => {
          let build_res: BuildResponse | undefined;
          let _err: any;
          try {
            build_res = await client.build({
              directory: module_path,
            }, { logger });
          } catch (err) {
            _err = err;
          } finally {
            client.close();
            await server.stop();
          }

          if (_err) {
            reject(_err);
          } else if (build_res) {
            resolve(build_res.image);
          } else {
            reject(new Error('Something went wrong'));
          }
        });
      });

      return promises[module_path];
    });
  }
}
