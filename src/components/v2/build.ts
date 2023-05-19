export type BuildSchemaV2 = {
  /**
   * Description of the build artifact
   */
  description?: string;

  /**
   * Path to the folder containing the code to build
   */
  context: string;

  /**
   * The path to the dockerfile defining this build step
   * @default Dockerfile
   */
  dockerfile?: string;

  /**
   * A set of arguments to pass to the build job
   */
  args?: Record<string, string>;

  /**
   * The docker target to use during the build process
   */
  target?: string;

  /**
   * The resulting image that was created once the build is complete.
   * This will change whenever the component is tagged as well.
   */
  image?: string;
};

export type DebuggableBuildSchemaV2 = BuildSchemaV2 & {
  debug?: Partial<BuildSchemaV2>;
};
