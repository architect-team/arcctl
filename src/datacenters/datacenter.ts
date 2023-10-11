import { AppGraph, InfraGraph } from '../graphs/index.ts';
import { Plugin } from "../graphs/infra/types.ts";
import { DatacenterVariablesSchema } from './variables.ts';

// Docker types
export type DockerBuildFn = (options: {
  context: string;
  plugin: Plugin;
}) => Promise<string>;
export type DockerTagFn = (
  sourceRef: string,
  targetName: string,
) => Promise<string>;
export type DockerPushFn = (image: string) => Promise<void>;

export type GetGraphOptions = {
  /**
   * Name of an environment to enrich resources for
   */
  environmentName?: string;

  /**
   * Name of the datacenter itself
   */
  datacenterName: string;
};

export abstract class Datacenter {
  public abstract getGraph(appGraph: AppGraph, options: GetGraphOptions): InfraGraph;
  public abstract getVariablesSchema(): DatacenterVariablesSchema;

  public abstract build(buildFn: DockerBuildFn): Promise<Datacenter>;
  public abstract tag(tagFn: DockerTagFn): Promise<Datacenter>;
  public abstract push(pushFn: DockerPushFn): Promise<Datacenter>;
}
