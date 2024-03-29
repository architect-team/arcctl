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
  /**
   * Type of probe to perform
   */
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

type ProbeSchema = CommonProbeSettings & (ExecProbe | HttpProbe);

export type DeploymentInputs = {
  /**
   * Unique name of the deployment used by services to address each replica
   *
   * @example "component--auth-api"
   */
  name: string;

  /**
   * Labels for the deployment
   *
   * @example
   * {
   *   "app.kubernetes.io/name": "auth-api",
   * }
   */
  labels?: Record<string, string>;

  /**
   * Number of replicas of the deployment to run
   * @default 1
   */
  replicas?: number;

  /**
   * Target platform the deployment will run on
   *
   * @example "linux/amd64"
   */
  platform?: string;

  /**
   * Autoscaling rules for the deployment
   */
  autoscaling?: {
    /**
     * Minimum number of replicas of the deployment to run
     * @minimum 0
     * @example 1
     */
    min_replicas: number;

    /**
     * Maximum number of replicas of the deployment to run
     * @minimum 1
     * @example 1
     */
    max_replicas: number;
  };

  /**
   * Services this deployment should register itself with
   */
  services?: Array<{
    /**
     * The name of the service
     * @example "my-service"
     */
    name: string;

    /**
     * The hostname the service is listening on
     * @example "my-service"
     */
    host: string;

    /**
     * The port the service deployment is listening on
     * @example 8080
     */
    port: string;

    /**
     * The port the service forwards traffic to
     * @example 8080
     */
    target_port: string;

    /**
     * The protocol the service is listening on
     * @example "http"
     */
    protocol: string;
  }>;

  /**
   * Ingresses this deployment should register itself with
   */
  ingresses?: Array<{
    /**
     * The name of the service this ingress points to
     * @example "my-service"
     */
    service: string;

    /**
     * The hostname the ingress is listening on
     * @example "my-service.example.com"
     */
    host: string;

    /**
     * The port the ingress is listening on
     * @example 80
     */
    port: string;

    /**
     * The protocol the ingress is listening on
     * @example "http"
     */
    protocol: string;

    /**
     * The path the ingress is listening on
     * @example "/api"
     */
    path: string;

    /**
     * The subdomain the ingress rule listens on
     * @example "my-service"
     */
    subdomain: string;

    /**
     * The DNS zone the ingress rule listens on
     * @example "example.com"
     */
    dns_zone: string;
  }>;

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
    volume: string;
    mount_path: string;
    image?: string;
    readonly: boolean;
  }>;

  /**
   * Probes used to determine if each replica is healthy and/or ready for traffic
   */
  probes?: {
    /**
     * Probe used to determine if the container is ready to receive traffic
     */
    liveness?: ProbeSchema;
  };
};

export default DeploymentInputs;
