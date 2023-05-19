import { CloudGraph } from '../cloud-graph/graph.js';

export type GraphContext = {
  environment: string;
  component: {
    name: string;
    source: string;
    debug?: boolean;
  };
};

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

export type DockerPushFn = (image: string) => Promise<void>;

export abstract class Component {
  public abstract getDependencies(): string[];

  public abstract getGraph(context: GraphContext): CloudGraph;

  public abstract build(buildFn: DockerBuildFn): Promise<Component>;

  public abstract tag(tagFn: DockerTagFn): Promise<Component>;

  public abstract push(pushFn: DockerPushFn): Promise<Component>;
}
