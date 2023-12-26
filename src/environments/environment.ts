import { ComponentStore } from '../component-store/store.ts';
import { AppGraph } from '../graphs/index.ts';
import { ImageRepository } from '../oci/index.ts';

export type ComponentMetadata = {
  image: ImageRepository;
  path?: string;
  debug?: boolean;
  ingresses?: Record<string, string>;
  variables?: Record<string, string>;
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
  ): Promise<AppGraph>;

  public abstract addComponent(metadata: ComponentMetadata): void;

  public abstract removeComponent(name: string): void;
}
