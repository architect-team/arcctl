import { ContainerSchemaV2 } from './container.ts';
import { ProbeSchema } from './probe.ts';

export type DeploymentSchemaV2 = ContainerSchemaV2 & {
  /**
   * Human readable description of the deployment
   *
   * @example "Runs the frontend web application"
   */
  description?: string;

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
};

export type DebuggableDeploymentSchemaV2 = DeploymentSchemaV2 & {
  /**
   * Debugging options for the deployment
   */
  debug?: Partial<DeploymentSchemaV2>;
};
