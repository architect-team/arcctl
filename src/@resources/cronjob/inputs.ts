type Container = {
  /**
   * The container image to run
   *
   * @example "nginx:latest"
   */
  image: string;

  /**
   * The target platform to run the container on
   *
   * @example "linux/amd64"
   */
  platform?: string;

  /**
   * The command to run when booting the container
   *
   * @example ["npm", "start"]
   */
  command?: string | string[];

  /**
   * The entrypoint of the command to run
   *
   * @default [""]
   */
  entrypoint?: string | string[];

  /**
   * The environment variables to apply to the running instances
   *
   * @example { "NODE_ENV": "production" }
   */
  environment?: Record<string, string>;

  /**
   * The number of CPUs to allocate to each instance
   *
   * @example 0.5
   */
  cpu?: number;

  /**
   * The amount of memory to allocate to each instance
   *
   * @example "512Mi"
   * @example "2Gi"
   */
  memory?: string;

  /**
   * The volumes to mount into the container
   */
  volume_mounts?: Array<{
    /**
     * The name of the volume to mount
     *
     * @example "my-volume"
     */
    volume: string;

    /**
     * The path within the container environment to mount the volume to
     *
     * @example "/app/data"
     */
    mount_path: string;

    /**
     * True if the volume should be mounted as read-only
     *
     * @default false
     */
    readonly?: boolean;
  }>;
};

export type CronjobInputs = Container & {
  /**
   * The schedule in Cron format, see https://en.wikipedia.org/wiki/Cron.
   *
   * @example "0 0 * * *"
   */
  schedule: string;

  /**
   * Labels to apply to related cloud resources
   *
   * @example
   * {
   *   "app.kubernetes.io/name": "my-app"
   * }
   */
  labels?: Record<string, string>;
};

export default CronjobInputs;
