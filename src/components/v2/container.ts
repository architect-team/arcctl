export type ContainerSchemaV2 = {
  /**
   * Docker image to use for the deployment
   *
   * @example "${{ builds.frontend.image }}"
   * @example "my-registry.com/my-app:latest"
   */
  image: string;

  /**
   * Set platform if server is multi-platform capable
   *
   * @example "linux/amd64"
   */
  platform?: string;

  /**
   * Command to use when the container is booted up
   *
   * @example ["npm", "start"]
   */
  command?: string | string[];

  /**
   * The executable to run every time the container is booted up
   *
   * @default [""]
   */
  entrypoint?: string | string[];

  /**
   * Environment variables to pass to the service
   *
   * @example { "NODE_ENV": "production" }
   * @example
   * {
   *   "BACKEND_URL": "${{ ingresses.backend.url }}",
   * }
   */
  environment?: Record<string, string>;

  /**
   * The amount of CPU to allocate to each instance of the deployment
   */
  cpu?: number | string;

  /**
   * The amount of memory to allocate to each instance of the deployment
   */
  memory?: string;

  /**
   * Volumes that should be created and attached to each replica
   */
  volumes?: Record<string, {
    /**
     * Path on the host machine to sync with the volume
     *
     * @example "/Users/batman/app/src"
     */
    host_path?: string;

    /**
     * Path inside the container to mount the volume to
     *
     * @example "/app/src"
     */
    mount_path: string;

    /**
     * OCI image containing the contents to seed the volume with
     */
    image?: string;
  }>;
};
