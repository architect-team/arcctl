import { CloudGraph } from '../cloud-graph/index.ts';

export type DatacenterSecretsConfig = {
  account: string;
  namespace?: string;
};

export abstract class Datacenter {
  public abstract enrichGraph(
    /**
     * Graph of resources the environment defines
     */
    graph: CloudGraph,
    /**
     * Name of an environment to enrich resources for
     */
    environmentName?: string,
    /**
     * Whether or not to build the graph using debug features
     */
    debug?: boolean,
  ): Promise<CloudGraph>;

  public abstract getSecretsConfig(): DatacenterSecretsConfig;
}
