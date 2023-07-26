import { ResourceInputs } from '../@resources/index.ts';
import { CloudGraph } from '../cloud-graph/index.ts';

export type VariablesMetadata = {
  type: keyof ResourceInputs | 'string' | 'number' | 'boolean';
  description?: string;
  provider?: string;
  value?: string | number | boolean;
} & { [key in keyof ResourceInputs]?: string };

/**
 * Returned by the Datacenter with additional metadata
 * not part of the datacenter schema to track variables
 * and the keys they point to.
 */
export type ParsedVariablesMetadata = VariablesMetadata & {
  /*
   * Array of variables referenced by this variable metadata.
   * `key` is the VariablesMetadata key the variable is for,
   * and `value` is the variable that needs to be fulfilled.
   */
  dependant_variables?: { key: keyof VariablesMetadata; value: string }[];
};

/**
 * Type used by schema variables to prompt for values
 */
export type ParsedVariablesType = {
  [key: string]: ParsedVariablesMetadata;
};

export type DatacenterSecretsConfig = {
  account: string;
  namespace?: string;
};

export type DatacenterEnrichmentOptions = {
  /**
   * Name of an environment to enrich resources for
   */
  environmentName?: string;

  /**
   * Name of the datacenter itself
   */
  datacenterName: string;

  /**
   * Whether or not to build the graph using debug features
   */
  debug?: boolean;
};

export abstract class Datacenter {
  public abstract enrichGraph(
    /**
     * Graph of resources the environment defines
     */
    graph: CloudGraph,
    /**
     * Options used to enrich the environment
     */
    options: DatacenterEnrichmentOptions,
  ): Promise<CloudGraph>;

  public abstract getVariables(): ParsedVariablesType;
  public abstract setVariableValues(variables: Record<string, unknown>): void;
}
