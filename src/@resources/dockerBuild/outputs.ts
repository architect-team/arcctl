export type DockerBuildOutputs = {
  /**
   * The resulting image address of the built artifact
   * @example "registry.architect.io/my-component:latest"
   */
  image: string;
};

export default DockerBuildOutputs;
