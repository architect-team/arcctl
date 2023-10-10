import { Logger } from 'winston';
import { Plugin } from '../types.ts';

export type BuildRequest = {
  directory: string;
};

export type BuildOptions = {
  plugin: Plugin;
  verbose?: boolean;
};

export type BuildResponse = {
  image: string;
};

export type ApplyRequest = {
  datacenterid: string;
  image: string;
  inputs: [string, string][];
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
