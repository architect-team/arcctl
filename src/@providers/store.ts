import { ResourceType } from '../@resources/index.ts';
import { ResourceService, WritableResourceService } from './base.service.ts';
import type { Provider } from './provider.ts';

export interface ProviderStore {
  get storageDir(): string;

  /**
   * Saves a file with the given filename and contents and returns the fully resolvable path
   */
  saveFile(name: string, content: string): string;

  /**
   * Retrieve the provider matching the specified name. Otherwise, returns undefined.
   */
  get(name: string): Provider | undefined;

  /**
   * Return a list of the available providers
   */
  list(): Provider[];

  /**
   * Save the specified provider to the store
   */
  save(provider: Provider): void;

  /**
   * Remove the specified provider from the store. Throws an error if the provider doesn't exist.
   */
  delete(name: string): void;

  /**
   * Retrieve the service for the specified account and resource type. Error if not found.
   */
  getService<T extends ResourceType>(accountName: string, type: T): ResourceService<T, any>;

  /**
   * Same as getService, but checks to ensure the service can apply changes.
   */
  getWritableService<T extends ResourceType>(accountName: string, type: T): WritableResourceService<T, any>;
}
