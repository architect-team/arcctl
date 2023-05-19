type Container = {
  image: string;
  command?: string | string[];
  entrypoint?: string | string[];
  environment?: Record<string, string>;
  cpu?: number;
  memory?: string;
  volume_mounts?: Array<{
    volume: string;
    mount_path: string;
    readonly?: boolean;
  }>;
};

export type CronjobInputs = Container & {
  namespace?: string;
  schedule: string;
  labels?: Record<string, string>;
  sidecars?: Array<Container>;
};

export default CronjobInputs;
