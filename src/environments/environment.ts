import { CloudGraph } from '../cloud-graph/index.js';
import { ComponentStore } from '../component-store/store.js';

export abstract class Environment {
  public abstract getGraph(
    /**
     * Name of the environment
     */
    environment_name: string,

    /**
     * Store used to pull component artifacts
     */
    componentStore: ComponentStore,

    /**
     * Whether or not to build the graph using debug features
     */
    debug?: boolean,
  ): Promise<CloudGraph>;
}
