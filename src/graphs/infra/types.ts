import { Logger } from 'winston';
import type { InfraGraph } from './graph.ts';

export type Plugin = 'pulumi' | 'opentofu';

export enum PlanContext {
  Datacenter = 1,
  Environment = 2,
  Component = 3,
}

export type PlanOptions = {
  before: InfraGraph;
  after: InfraGraph;
  context?: PlanContext;
  refresh?: boolean;
};

export type ApplyOptions = {
  cwd?: string;
  logger?: Logger;
};
