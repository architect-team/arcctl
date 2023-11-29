export type DeploymentOutputs = {
  /**
   * A set of labels that were used to annotate the cloud resource
   * @example
   * {
   *   "app.kubernetes.io/name": "my-app"
   * }
   */
  labels?: Record<string, string>;
};

export default DeploymentOutputs;
