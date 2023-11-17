export type BuildSchemaV2 = {
  /**
   * Description of the build artifact
   *
   * @example "Builds the source code for the application"
   */
  description?: string;

  /**
   * Path to the folder containing the code to build
   *
   * @example "./"
   */
  context: string;

  /**
   * The path to the dockerfile defining this build step
   * @default Dockerfile
   */
  dockerfile?: string;

  /**
   * A set of arguments to pass to the build job
   *
   * @example { "BUILDKIT_INLINE_CACHE": "1" }
   */
  args?: Record<string, string>;

  /**
   * The docker target to use during the build process
   *
   * @example "builder"
   */
  target?: string;

  /**
   * The resulting image that was created once the build is complete.
   * This will change whenever the component is tagged as well.
   *
   * @example "my-registry.com/my-app:latest"
   */
  image?: string;
};

export type DebuggableBuildSchemaV2 = BuildSchemaV2 & {
  /**
   * Debugging options for the build step
   */
  debug?: Partial<BuildSchemaV2>;
};
