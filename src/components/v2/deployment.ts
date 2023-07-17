import { DeepPartial } from '../../utils/types.ts';
import { ProbeSchema } from './probe.ts';

export type DeploymentSchemaV2 = {
  /**
   * Human readable description of the deployment
   */
  description?: string;

  /**
   * Docker image to use for the deployment
   */
  image: string;

  /**
   * Set platform if server is multi-platform capable
   */
  platform?: string;

  /**
   * Command to use when the container is booted up
   */
  command?: string | string[];

  /**
   * The executable to run every time the container is booted up
   */
  entrypoint?: string | string[];

  /**
   * Environment variables to pass to the service
   */
  environment?: Record<string, string>;
  cpu?: number | string;
  memory?: string;
  labels?: Record<string, string>;
  probes?: {
    liveness?: ProbeSchema;
  };
  autoscaling?: {
    cpu?: number | string;
    memory?: string;
  };
  volumes?: Record<string, {
    host_path?: string;
    mount_path: string;
    image?: string;
  }>;
};

export type DebuggableDeploymentSchemaV2 = DeploymentSchemaV2 & {
  debug?: DeepPartial<DeploymentSchemaV2>;
};
