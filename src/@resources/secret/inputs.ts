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

  /**
   * Whether or not the secret is required
   */
  required?: boolean;
};

export default SecretInputs;
