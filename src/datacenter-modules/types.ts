import { Logger } from 'winston';

export type Plugin = 'pulumi' | 'opentofu';

export type BuildRequest = {
  directory: string;
};

export type BuildOptions = {
  logger?: Logger;
};

export type BuildResponse = {
  image: string;
};

export type ApplyRequest = {
  datacenterid: string;
  image: string;
  inputs: Record<string, any>;
  environment?: Record<string, string>;
  volumes?: {
    host_path: string;
    mount_path: string;
  }[];
  state?: string;
  destroy?: boolean;
};

export type ApplyResponse = {
  state: string;
  outputs: Record<string, string>;
};

export type ApplyOptions = {
  logger?: Logger;
};
