import { DeepPartial } from '../../utils/types.ts';
import { ProbeSchema } from './probe.ts';

export type DeploymentSchemaV2 = {
  description?: string;
  image: string;
  command?: string | string[];
  entrypoint?: string | string[];
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
