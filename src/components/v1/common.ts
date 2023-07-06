type BuildSchemaV1 = {
  context: string;
  dockerfile?: string;
  target?: string;
  args?: Record<string, string>;
};

type DockerSchemaV1 =
  | {
    image: string;
  }
  | {
    build: BuildSchemaV1;
  }
  | {
    image: string;
    build: BuildSchemaV1;
  };

export type RuntimeSchemaV1 = DockerSchemaV1 & {
  /**
   * @deprecated
   */
  language?: string;
  command?: string | string[];
  entrypoint?: string | string[];
  environment?: Record<string, string | number>;
  cpu?: number | string;
  memory?: string;
  labels?: Record<string, string>;
  volumes?: Record<
    string,
    {
      description?: string;
      mount_path: string;
      host_path?: string;
      readonly?: boolean | string;
    }
  >;
};
