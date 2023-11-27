export type DockerBuildInputs = {
  /**
   * Source of the component that contains the build context
   * @example "/Users/batman/Projects/awesome-component"
   */
  component_source: string;

  /**
   * Docker build context relative to the component root
   * @example "./frontend"
   */
  context: string;

  /**
   * Path to the dockerfile relative to the context
   * @default "Dockerfile"
   */
  dockerfile?: string;

  /**
   * Arguments to pass to the build command
   * @default {}
   */
  args?: Record<string, string>;

  /**
   * Name of a intermediate build stage to target
   * @example "builder"
   */
  target?: string;
};

export default DockerBuildInputs;
