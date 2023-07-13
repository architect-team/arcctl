import * as path from 'std/path/mod.ts';
import { Provider } from '../@providers/provider.ts';
import { ProviderStore } from '../@providers/store.ts';
import { SupportedProviders } from '../@providers/supported-providers.ts';
import { BaseStore } from '../secrets/base-store.ts';
import { SecretStore } from '../secrets/store.ts';

export class CldCtlProviderStore extends BaseStore<Provider> implements ProviderStore {
  constructor(
    secretStore: SecretStore,
    private config_dir: string = Deno.makeTempDirSync(),
  ) {
    super('providers', secretStore);
    this.getProviders();
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

  async getProvider(name: string): Promise<Provider | undefined> {
    if (this._records) {
      return this._records.find((item) => item.name === name);
    }

    await this.load(async (raw) => {
      const type = raw.type as keyof typeof SupportedProviders;
      return new SupportedProviders[type](raw.name, raw.credentials, this);
    });

    return this._records!.find((item) => item.name === name);
  }

  getProviders(): Promise<Provider[]> {
    return this.load(async (raw) => {
      const type = raw.type as keyof typeof SupportedProviders;
      return new SupportedProviders[type](raw.name, raw.credentials, this);
    });
  }

  async saveProvider(provider: Provider): Promise<void> {
    const allProviders = await this.getProviders();
    const foundIndex = allProviders.findIndex((p) => p.name === provider.name);
    if (foundIndex >= 0) {
      this._records![foundIndex] = provider;
    } else {
      this._records?.push(provider);
    }
    await this.saveProviders();
  }

  async deleteProvider(name: string): Promise<void> {
    const allProviders = await this.getProviders();
    const foundIndex = allProviders.findIndex((p) => p.name === name);
    if (foundIndex < 0) {
      throw new Error(`The ${name} provider was not found`);
    }

    this._records?.splice(foundIndex, 1);
    await this.saveProviders();
  }

  async saveProviders(): Promise<void> {
    await this.saveAll(this._records!);
  }
}
