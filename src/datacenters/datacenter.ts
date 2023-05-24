import { CloudGraph } from '../cloud-graph/index.ts';
import { Construct } from 'npm:constructs';

export abstract class Datacenter {
  public abstract enrichGraph(
    /**
     * Graph of resources the environment defines
     */
    graph: CloudGraph,

    /**
     * Name of the environment so that resources can be named correctly
     */
    environmentName: string,

    /**
     * Whether or not to build the graph using debug features
     */
    debug?: boolean,
  ): Promise<CloudGraph>;

  public abstract configureBackend(scope: Construct, filename: string): void;
}
