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
  getProvider(name: string): Promise<Provider | undefined>;

  /**
   * Return a list of the available providers
   */
  getProviders(): Promise<Provider[]>;

  /**
   * Save the specified provider to the store
   */
  saveProvider(provider: Provider): Promise<void>;

  /**
   * Remove the specified provider from the store. Throws an error if the provider doesn't exist.
   */
  deleteProvider(name: string): Promise<void>;
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
  getProvider(name: string): Promise<Provider | undefined> {
    return Promise.resolve(undefined);
  }

  /**
   * Return a list of the available providers
   */
  getProviders(): Promise<Provider[]> {
    return Promise.resolve([]);
  }

  /**
   * Save the specified provider to the store
   */
  saveProvider(provider: Provider): Promise<void> {
    return Promise.resolve();
  }

  /**
   * Remove the specified provider from the store. Throws an error if the provider doesn't exist.
   */
  deleteProvider(name: string): Promise<void> {
    return Promise.resolve();
  }
}
