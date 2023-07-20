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
  get(name: string): Promise<Provider | undefined>;

  /**
   * Return a list of the available providers
   */
  list(): Promise<Provider[]>;

  /**
   * Save the specified provider to the store
   */
  save(provider: Provider): Promise<void>;

  /**
   * Remove the specified provider from the store. Throws an error if the provider doesn't exist.
   */
  delete(name: string): Promise<void>;

  /**
   * Retrieve the service for the specified account and resource type. Error if not found.
   */
  getService<T extends ResourceType>(accountName: string, type: T): Promise<ResourceService<T, any>>;

  /**
   * Same as getService, but checks to ensure the service can apply changes.
   */
  getWritableService<T extends ResourceType>(accountName: string, type: T): Promise<WritableResourceService<T, any>>;
}

export class EmptyProviderStore implements ProviderStore {
  get storageDir(): string {
    return '';
  }

  /**
   * Saves a file with the given filename and contents and returns the fully resolvable path
   */
  saveFile(name: string, content: string): string {
    return '';
  }

  /**
   * Retrieve the provider matching the specified name. Otherwise, returns undefined.
   */
  get(name: string): Promise<Provider | undefined> {
    return Promise.resolve(undefined);
  }

  /**
   * Return a list of the available providers
   */
  list(): Promise<Provider[]> {
    return Promise.resolve([]);
  }

  /**
   * Save the specified provider to the store
   */
  save(provider: Provider): Promise<void> {
    return Promise.resolve();
  }

  /**
   * Remove the specified provider from the store. Throws an error if the provider doesn't exist.
   */
  delete(name: string): Promise<void> {
    return Promise.resolve();
  }

  getService<T extends ResourceType>(accountName: string, type: T): Promise<ResourceService<T, any>> {
    throw new Error('Method not implemented.');
  }
  getWritableService<T extends ResourceType>(accountName: string, type: T): Promise<WritableResourceService<T, any>> {
    throw new Error('Method not implemented.');
  }
}
