export type ArcctlAccountInputs = {
  /**
   * Name of the new account
   */
  name: string;

  /**
   * Cloud provider the account connects to
   */
  provider: string;

  /**
   * Credentials used to access the cloud provider
   */
  credentials: Record<string, any>;
};

export default ArcctlAccountInputs;
