import { AppGraph } from '../graphs/index.ts';

export type GraphContext = {
  environment: string;
  component: {
    name: string;
    source: string;
    debug?: boolean;
  };
};

export type VolumeBuildFn = (options: {
  deployment_name: string;
  volume_name: string;
  host_path: string;
}) => Promise<string>;

export type DockerBuildFn = (options: {
  context: string;
  dockerfile?: string;
  args?: Record<string, string>;
  target?: string;
}) => Promise<string>;

export type DockerTagFn = (
  sourceRef: string,
  targetName: string,
) => Promise<string>;

export type VolumeTagFn = (
  digest: string,
  deploymentName: string,
  volumeName: string,
) => Promise<string>;

export type DockerPushFn = (image: string) => Promise<void>;

export type ComponentDependencies = Array<{
  component: string;
  inputs?: Record<string, string[]>;
}>;

export abstract class Component {
  public abstract getDependencies(graph: AppGraph, context: GraphContext): ComponentDependencies;

  public abstract getGraph(context: GraphContext): AppGraph;

  public abstract build(buildFn: DockerBuildFn, volumeFn: VolumeBuildFn): Promise<Component>;

  public abstract tag(tagFn: DockerTagFn, volumeTagFn: VolumeTagFn): Promise<Component>;

  public abstract push(pushFn: DockerPushFn): Promise<Component>;
}
