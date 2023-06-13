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
  getProvider(name: string): Provider | undefined;

  /**
   * Return a list of the available providers
   */
  getProviders(): Provider[];

  /**
   * Save the specified provider to the store
   */
  saveProvider(provider: Provider): void;

  /**
   * Remove the specified provider from the store. Throws an error if the provider doesn't exist.
   */
  deleteProvider(name: string): void;
}
