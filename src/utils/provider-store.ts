import * as path from 'std/path/mod.ts';
import { ResourceService, WritableResourceService } from '../@providers/index.ts';
import { Provider } from '../@providers/provider.ts';
import { ProviderStore } from '../@providers/store.ts';
import { SupportedProviders } from '../@providers/supported-providers.ts';
import { ResourceType } from '../@resources/index.ts';

export class ArcctlProviderStore implements ProviderStore {
  private _providers?: Provider[];

  constructor(
    private config_dir: string = Deno.makeTempDirSync(),
    private provider_filename: string = 'providers.json',
  ) {
    this.list();
  }

  private get providers_config_file() {
    return path.join(this.config_dir, this.provider_filename);
  }

  get storageDir() {
    return this.config_dir;
  }

  saveFile(name: string, content: string): string {
    const file_path = path.join(this.config_dir, name);
    Deno.mkdirSync(path.dirname(file_path), { recursive: true });
    Deno.writeTextFileSync(file_path, content);
    return file_path;
  }

  get(name: string): Provider | undefined {
    if (this._providers) {
      return this._providers.find((item) => item.name === name);
    }

    try {
      const fileContents = Deno.readTextFileSync(this.providers_config_file);
      const raw = JSON.parse(fileContents) as any[];
      const rawProvider = raw.find((item) => item.name === name);
      if (rawProvider) {
        const type = rawProvider.type as keyof typeof SupportedProviders;
        return new SupportedProviders[type](rawProvider.name, rawProvider.credentials, this);
      }
    } catch {
      // Intentionally left blank
    }

    return undefined;
  }

  list(): Provider[] {
    if (this._providers) {
      return this._providers;
    }

    const providers: Provider[] = [];
    try {
      const fileContents = Deno.readTextFileSync(this.providers_config_file);
      const rawProviders = JSON.parse(fileContents);

      for (const raw of rawProviders) {
        const type = raw.type as keyof typeof SupportedProviders;
        providers.push(new SupportedProviders[type](raw.name, raw.credentials, this));
      }
    } catch {
      // Intentionally left empty
    }

    this._providers = providers;
    return this._providers;
  }

  save(provider: Provider): void {
    const allProviders = this.list();
    const foundIndex = allProviders.findIndex((p) => p.name === provider.name);
    if (foundIndex >= 0) {
      allProviders[foundIndex] = provider;
    } else {
      allProviders.push(provider);
    }
    this.saveProviders(allProviders);
  }

  delete(name: string): void {
    const allProviders = this.list();
    const foundIndex = allProviders.findIndex((p) => p.name === name);
    if (foundIndex < 0) {
      throw new Error(`The ${name} provider was not found`);
    }

    allProviders.splice(foundIndex, 1);
    this.saveProviders(allProviders);
  }

  getService<T extends ResourceType>(accountName: string, type: T): ResourceService<T, any> {
    const account = this.get(accountName);
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

  getWritableService<T extends ResourceType>(accountName: string, type: T): WritableResourceService<T, any> {
    const account = this.get(accountName);
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

  private saveProviders(providers: Provider[]): void {
    Deno.mkdirSync(path.dirname(this.providers_config_file), {
      recursive: true,
    });
    Deno.writeTextFileSync(this.providers_config_file, JSON.stringify(providers, null, 2));
  }
}
