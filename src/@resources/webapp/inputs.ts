type BuildImage = {
  /**
   * Docker artifact containing the source code and build environment
   *
   * @example "registry.architect.io/architect/webapp:latest"
   */
  image: string;

  /**
   * Subdomain the webapp will be served from
   *
   * @example "www"
   */
  subdomain?: string;
};

export type WebappInputs =
  | BuildImage
  | (BuildImage & {
    /**
     * Command used to compile the webapp
     *
     * @example ["npm", "run", "build"]
     */
    build: string[];

    /**
     * Command used to boot the webapp in dev mode
     *
     * @example ["npm", "run", "dev"]
     */
    dev?: string[];

    /**
     * Command to run inside the `outdir` to start the webapp
     *
     * @example ["node", "server.js"]
     */
    start?: string[];

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

export default WebappInputs;
