type BuildImage = {
  /**
   * Docker artifact containing the source code and build environment
   *
   * @example "registry.architect.io/architect/webapp:latest"
   */
  image?: string;

  /**
   * Path to the source code containing everything needed to build or serve the webapp
   *
   * @example "./"
   */
  context?: string;
};

export type WebappConfig =
  | BuildImage
  | (BuildImage & {
    /**
     * Command used to compile the webapp
     *
     * @example ["npm", "run", "build"]
     */
    build: string | string[];

    /**
     * Command used to boot the webapp in dev mode
     *
     * @example ["npm", "run", "dev"]
     */
    dev?: string | string[];

    /**
     * Command to run inside the `outdir` to start the webapp
     *
     * @example ["node", "server.js"]
     */
    start?: string | string[];

    /**
     * Directory containing the compiled webapp after running the `build` command
     *
     * @example "./build"
     */
    outdir: string;

    /**
     * Environment variables to set when building the webapp
     *
     * @example
     * {
     *   "BACKEND_ADDR": "${{ ingresses.backend.url }}"
     * }
     */
    environment?: Record<string, string>;
  });
