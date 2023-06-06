export type ParameterSchemaV1 =
  | string
  | {
    /**
     * The default value to apply to the parameter when one wasn't provided by the operator
     */
    default?: string | number;

    /**
     * A boolean indicating whether or not an operator is required ot provide a value
     * @default false
     */
    required?: boolean;

    /**
     * A human-readable description of the parameter, how it should be used, and what kinds of values it supports.
     */
    description?: string;
  };
