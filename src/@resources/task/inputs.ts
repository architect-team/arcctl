export type TaskInputs = {
  /**
   * Image the container runs from
   *
   * @example "registry.architect.io/my-image:latest"
   */
  image: string;

  /**
   * Command to execute in the container
   *
   * @example ["node", "index.js"]
   */
  command?: string | string[];

  /**
   * Entrypoint of the container
   *
   * @default [""]
   */
  entrypoint?: string | string[];

  /**
   * Target platform the deployment will run on
   *
   * @example "linux/amd64"
   */
  platform?: string;

  /**
   * Environment variables to pass to the container
   *
   * @example
   * {
   *   "NODE_ENV": "production"
   * }
   */
  environment?: Record<string, string | number | boolean | null | undefined>;

  /**
   * Number of CPUs to allocate to the container
   * @minimum 0.1
   */
  cpu?: number;

  /**
   * Amount of memory to allocate to the container
   *
   * @example "512Mi"
   * @example "1Gi"
   */
  memory?: string;

  /**
   * A set of volumes to mount to the container
   */
  volume_mounts?: Array<{
    /**
     * Name of the volume to mount
     * @example "my-volume"
     */
    volume: string;

    /**
     * Path in the container to mount the volume to
     *
     * @example "/var/lib/my-volume"
     */
    mount_path: string;

    /**
     * Whether or not the volume should be mounted as read-only
     * @default false
     */
    readonly: boolean;
  }>;
};

export default TaskInputs;
