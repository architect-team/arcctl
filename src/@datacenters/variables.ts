export type VariablesMetadata = {
  type: 'string' | 'number' | 'boolean';
  description?: string;
  value?: string | number | boolean;
};

export type ParsedVariablesMetadata = VariablesMetadata & {
  /*
   * Array of variables referenced by this variable metadata.
   * `key` is the VariablesMetadata key the variable is for,
   * and `value` is the variable that needs to be fulfilled.
   */
  dependant_variables?: {
    key: keyof VariablesMetadata;
    value: string;
  }[];
};

export type DatacenterVariablesSchema = {
  [key: string]: ParsedVariablesMetadata;
};
