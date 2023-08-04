import * as path from 'std/path/mod.ts';
import { ResourceService, WritableResourceService } from '../@providers/index.ts';
import { Provider } from '../@providers/provider.ts';
import { ProviderStore } from '../@providers/store.ts';
import { SupportedProviders } from '../@providers/supported-providers.ts';
import { ResourceType } from '../@resources/index.ts';
import { BaseStore } from '../secrets/base-store.ts';
import { StateBackend } from './config.ts';

export class ArcctlProviderStore extends BaseStore<Provider> implements ProviderStore {
  constructor(
    stateBackend: StateBackend,
    private config_dir: string = Deno.makeTempDirSync(),
  ) {
    super('providers', stateBackend);
    this.list();
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

  async get(name: string): Promise<Provider | undefined> {
    if (this._records) {
      return this._records.find((item) => item.name === name);
    }

    await this.load(async (raw) => {
      const type = raw.type as keyof typeof SupportedProviders;
      return new SupportedProviders[type](raw.name, raw.credentials, this);
    });

    return this._records!.find((item) => item.name === name);
  }

  list(): Promise<Provider[]> {
    return this.load(async (raw) => {
      const type = raw.type as keyof typeof SupportedProviders;
      return new SupportedProviders[type](raw.name, raw.credentials, this);
    });
  }

  async save(provider: Provider): Promise<void> {
    const allProviders = await this.list();
    const foundIndex = allProviders.findIndex((p) => p.name === provider.name);
    if (foundIndex >= 0) {
      this._records![foundIndex] = provider;
    } else {
      this._records?.push(provider);
    }
    await this.saveProviders();
  }

  async delete(name: string): Promise<void> {
    const allProviders = await this.list();
    const foundIndex = allProviders.findIndex((p) => p.name === name);
    if (foundIndex < 0) {
      return;
      // TODO: if this isn't found, it's already deleted, so why do we need to throw an error?
      // throw new Error(`The ${name} provider was not found`); // TODO: should this throw an error? if the provider data is already deleted, this keeps the store in an unrecoverable bad state because it's called during pipeline execution
    }

    this._records?.splice(foundIndex, 1);
    await this.saveProviders();
  }

  async saveProviders(): Promise<void> {
    await this.saveAll(this._records!);
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
