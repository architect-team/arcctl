export type StateBackends =
  | {
      type: 'local';
      path: string;
    }
  | {
      type: 'digitalocean';
      bucket: string;
      accessKey: string;
      secretKey: string;
    };
