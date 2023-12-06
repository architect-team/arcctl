import { AppGraph } from '../graphs/index.ts';

export type GraphContext = {
  environment: string;
  component: {
    name: string;
    source: string;
    debug?: boolean;
  };
};

export type DockerBuildFn = (options: {
  name: string;
  context: string;
  dockerfile?: string;
  args?: Record<string, string>;
  target?: string;
}) => Promise<string>;

export type DockerTagFn = (
  sourceRef: string,
  targetName: string,
) => Promise<string>;

export type DockerPushFn = (image: string) => Promise<void>;

export type ComponentDependencies = Array<{
  component: string;
  inputs?: Record<string, string[]>;
}>;

export abstract class Component {
  public abstract getDependencies(graph: AppGraph, context: GraphContext): ComponentDependencies;

  public abstract getGraph(context: GraphContext): AppGraph;

  public abstract build(buildFn: DockerBuildFn): Promise<Component>;

  public abstract tag(tagFn: DockerTagFn): Promise<Component>;

  public abstract push(pushFn: DockerPushFn): Promise<Component>;
}
