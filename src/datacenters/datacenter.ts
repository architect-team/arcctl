import { AppGraph, InfraGraph } from '../graphs/index.ts';
import { DatacenterVariablesSchema } from './variables.ts';

export type ModuleBuildFn = (options: {
  context: string;
}) => Promise<string>;

export type ModuleTagFn = (
  sourceRef: string,
  targetName: string,
) => Promise<string>;

export type ModulePushFn = (image: string) => Promise<void>;

export type GetGraphOptions = {
  /**
   * Name of an environment to enrich resources for
   */
  environmentName?: string;

  /**
   * Name of the datacenter itself
   */
  datacenterName: string;

  /**
   * Values for variables supported by the datacenter
   */
  variables?: Record<string, any>;
};

export abstract class Datacenter {
  public abstract getGraph(appGraph: AppGraph, options: GetGraphOptions): InfraGraph;
  public abstract getVariablesSchema(): DatacenterVariablesSchema;

  public abstract build(buildFn: ModuleBuildFn): Promise<Datacenter>;
  public abstract tag(tagFn: ModuleTagFn): Promise<Datacenter>;
  public abstract push(pushFn: ModulePushFn): Promise<Datacenter>;
}
