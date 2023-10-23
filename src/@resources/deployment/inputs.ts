type CommonProbeSettings = {
  /**
   * Number of seconds after the container starts before the probe is initiated.
   * @minimum 0
   * @default 0
   */
  initial_delay?: number;

  /**
   * Minimum consecutive successes for the probe to be considered successful after having failed.
   * @minimum 1
   * @default 1
   */
  success_threshold?: number;

  /**
   * Number of times the probe will tolerate failure before giving up. Giving up in the case of liveness probe means restarting the container.
   * @minimum 1
   * @default 3
   */
  failure_threshold?: number;

  /**
   * Number of seconds after which the probe times out
   * @minimum 1
   * @default 1
   */
  timeout?: number;

  /**
   * How often (in seconds) to perform the probe.
   * @minimum 1
   * @default 10
   */
  interval?: number;
};

type HttpProbe = {
  type: 'http';

  /**
   * Port to access on the container
   * @min 1
   * @max 65535
   */
  port?: number;

  /**
   * Path to access on the http server
   * @default /
   */
  path?: string;

  /**
   * Scheme to use for connecting to the host (http or https).
   * @default http
   */
  scheme?: string;

  /**
   * Custom headers to set in the request.
   */
  headers?: Array<{
    name: string;
    value: string;
  }>;
};

type ExecProbe = {
  type: 'exec';

  /**
   * Command to run inside the container to determine if its healthy
   */
  command: string[];
};

export type ProbeSchema = CommonProbeSettings & (ExecProbe | HttpProbe);

type Container = {
  /**
   * Image the container runs from
   */
  image: string;

  /**
   * Command to execute in the container
   */
  command?: string | string[];

  /**
   * Entrypoint of the container
   */
  entrypoint?: string | string[];

  /**
   * Environment variables to pass to the container
   */
  environment?: Record<string, string | number | boolean | null | undefined>;

  /**
   * Number of CPUs to allocate to the container
   * @minimum 0.1
   */
  cpu?: number;

  /**
   * Amount of memory to allocate to the container
   */
  memory?: string;

  /**
   * A set of volumes to mount to the container
   */
  volume_mounts?: Array<{
    volume: string;
    mount_path: string;
    image?: string;
    readonly: boolean;
  }>;

  probes?: {
    liveness?: ProbeSchema;
  };
};

export type DeploymentInputs = {
  /**
   * Labels for the deployment
   */
  labels?: Record<string, string>;

  /**
   * Number of replicas of the deployment to run
   * @default 1
   */
  replicas?: number;

  /**
   * Target platform the deployment will run on
   */
  platform?: string;

  /**
   * Autoscaling rules for the deployment
   */
  autoscaling?: {
    /**
     * Minimum number of replicas of the deployment to run
     * @minimum 0
     */
    min_replicas: number;

    /**
     * Maximum number of replicas of the deployment to run
     */
    max_replicas: number;
  };

  /**
   * Services this deployment should register itself with
   */
  services?: Array<{
    /**
     * The hostname the service is listening on
     */
    host: string;

    /**
     * The port the service deployment is listening on
     */
    port: string;

    /**
     * The protocol the service is listening on
     */
    protocol: string;
  }>;

  /**
   * Ingresses this deployment should register itself with
   */
  ingresses?: Array<{
    /**
     * The hostname the ingress is listening on
     */
    host: string;

    /**
     * The port the ingress is listening on
     */
    port: string;

    /**
     * The protocol the ingress is listening on
     */
    protocol: string;

    /**
     * The path the ingress is listening on
     */
    path?: string;
  }>;
} & Container;

export default DeploymentInputs;
