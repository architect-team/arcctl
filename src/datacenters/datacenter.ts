import { ResourceInputs } from '../@resources/index.ts';
import { CloudGraph } from '../cloud-graph/index.ts';

export type VariablesMetadata = {
  description?: string;
  required?: boolean;
  // TODO: this type isn't possible apparently, schema gen fails
  // provider?: keyof typeof SupportedProviders;
  provider?: string;
  type: keyof ResourceInputs | 'string' | 'number' | 'boolean';
} & { [key in keyof ResourceInputs]?: string }; // TODO: maybe should be more limited

export type ParsedVariablesMetadata = VariablesMetadata & {
  /*
   * Array of variables referenced by this variable metadata.
   * `key` is the VariablesMetadata key the variable is for,
   * and `value` is the variable that needs to be fulfilled.
   */
  depenendant_variables?: { key: keyof VariablesMetadata; value: string }[];
};

export type ParsedVariablesType = {
  [key: string]: ParsedVariablesMetadata;
};

export type DatacenterSecretsConfig = {
  account: string;
  namespace?: string;
};

export abstract class Datacenter {
  protected variable_values: Record<string, unknown>;

  constructor() {
    this.variable_values = {};
  }

  public abstract enrichGraph(
    /**
     * Graph of resources the environment defines
     */
    graph: CloudGraph,
    /**
     * Name of an environment to enrich resources for
     */
    environmentName?: string,
    /**
     * Whether or not to build the graph using debug features
     */
    debug?: boolean,
  ): Promise<CloudGraph>;

  public abstract getSecretsConfig(): DatacenterSecretsConfig;

  public abstract getVariables(): ParsedVariablesType;
  public abstract setVariableValues(variables: Record<string, unknown>): void;
}
