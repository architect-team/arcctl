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
  private _providers: Provider[] = [];

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
    return Promise.resolve(this._providers);
  }

  /**
   * Save the specified provider to the store
   */
  save(provider: Provider): Promise<void> {
    const existingIndex = this._providers.findIndex((p) => p.name === provider.name);
    if (existingIndex >= 0) {
      this._providers[existingIndex] = provider;
    } else {
      this._providers.push(provider);
    }

    return Promise.resolve();
  }

  /**
   * Remove the specified provider from the store. Throws an error if the provider doesn't exist.
   */
  delete(name: string): Promise<void> {
    const existingIndex = this._providers.findIndex((p) => p.name === name);
    if (existingIndex >= 0) {
      this._providers.splice(existingIndex, 1);
    }

    return Promise.resolve();
  }

  async getService<T extends ResourceType>(accountName: string, type: T): Promise<ResourceService<T, any>> {
    const account = await this.get(accountName);
    if (!account) {
      throw new Error(`Account does not exist: ${accountName}`);
    }

    const service = account.resources[type];
    if (!service) {
      throw new Error(
        `${account.name} does not support ${type} resources.`,
      );
    }

    return service;
  }

  async getWritableService<T extends ResourceType>(
    accountName: string,
    type: T,
  ): Promise<WritableResourceService<T, any>> {
    const account = await this.get(accountName);
    if (!account) {
      throw new Error(`Account does not exist: ${accountName}`);
    }

    const service = account.resources[type];
    if (!service) {
      throw new Error(
        `${account.name} does not support ${type} resources.`,
      );
    }

    if (!('construct' in service) && !('create' in service)) {
      throw new Error(`The ${account.type} provider cannot create service resources`);
    }

    return service as unknown as WritableResourceService<T, any>;
  }
}
