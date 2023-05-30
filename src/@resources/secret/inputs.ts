export type SecretInputs = {
  /**
   * Namespace the secret should be place in
   */
  namespace?: string;

  /**
   * Name for the secret
   */
  name: string;

  /**
   * Data to populate the secret with
   */
  data: string;
};

export default SecretInputs;
