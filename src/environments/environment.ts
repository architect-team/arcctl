import { CloudGraph } from '../cloud-graph/index.js';
import { ComponentStore } from '../component-store/store.js';
import { ImageRepository } from '@architect-io/arc-oci';

export type ComponentMetadata = {
  image: ImageRepository;
  ingresses?: Record<string, string>;
};

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

  public abstract addComponent(metadata: ComponentMetadata): void;
}
