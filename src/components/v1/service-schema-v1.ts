import { DeepPartial } from '../../utils/types.js';
import { RuntimeSchemaV1 } from './common.js';

export type ServiceSchemaV1 = RuntimeSchemaV1 & {
  replicas?: number | string;
  scaling?: {
    min_replicas: number | string;
    max_replicas: number | string;
    metrics: {
      cpu?: number | string;
      memory?: string;
    };
  };
  liveness_probe?: {
    /**
     * The number of times to retry a health check before the container is considered healthy
     * @default 1
     */
    success_threshold?: number | string;

    /**
     * The number of times to retry a failed health check before the container is considered unhealthy
     * @default 3
     */
    failure_threshold?: number | string;

    /**
     * The time period to wait for a health check to succeed before it is considered a failure. You may specify any value between 2s and 60s.
     * @default 5s
     */
    timeout?: string;

    /**
     * The time period in seconds between each health check execution. You may specify any value between: 5s and 300s
     * @default 30s
     */
    interval?: string;

    /**
     * Delays the check from running for the specified amount of time
     * @default 0s
     */
    initial_delay?: string;

    /**
     * Command that runs the http check. This field is disjunctive with `path` and `port` (only one of `command` or `path`/`port` can be set).
     */
    command?: string | string[];

    /**
     * @deprecated
     */
    path?: string;

    /**
     * @deprecated
     */
    port?: number | string;
  };

  interfaces?: Record<
    string,
    | number
    | string
    | {
        host?: string;
        port: number | string;
        protocol?: string;
        username?: string;
        password?: string;
        url?: string;
        ingress?: {
          subdomain?: string;
          path?: string;
          internal?: boolean;
        };
      }
  >;
};

export type DebuggableServiceSchemaV1 = ServiceSchemaV1 & {
  debug?: DeepPartial<ServiceSchemaV1>;
};
