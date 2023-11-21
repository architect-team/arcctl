import { ProbeSchema } from './probe.ts';

export type DeploymentSchemaV2 = {
  /**
   * Human readable description of the deployment
   *
   * @example "Runs the frontend web application"
   */
  description?: string;

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
   * The labels to apply to the deployment
   */
  labels?: Record<string, string>;

  /**
   * Configuration details for probes that check each replicas status
   */
  probes?: {
    /**
     * Configuration settings to determine if the deployment is ready to receive traffic
     */
    liveness?: ProbeSchema;
  };

  /**
   * Configuration settings for how to automatically scale the application up and down
   */
  autoscaling?: {
    /**
     * Maximum number of CPUs to allocate to each replica
     *
     * @example "0.5"
     * @example "1"
     */
    cpu?: number | string;

    /**
     * Maximum memory usage per replica before scaling up
     *
     * @example "200Mi"
     * @example "2Gi"
     */
    memory?: string;
  };

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

export type DebuggableDeploymentSchemaV2 = DeploymentSchemaV2 & {
  /**
   * Debugging options for the deployment
   */
  debug?: Partial<DeploymentSchemaV2>;
};
