export type SecretInputs = {
  /**
   * Data to populate the secret with
   */
  data: string;

  /**
   * Whether or not the secret is required
   * @default false
   */
  required?: boolean;

  /**
   * Whether or not the data is to be considered sensitive and stripped from logs
   * @default false
   */
  sensitive?: boolean;

  /**
   * Whether or not to merge the input data from multiple sources into an array of values
   * @default false
   */
  merge?: boolean;
};

export default SecretInputs;
