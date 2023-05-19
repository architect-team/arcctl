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
