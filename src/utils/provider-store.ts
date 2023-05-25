import { Provider } from '../@providers/provider.ts';
import { ProviderStore } from '../@providers/store.ts';
import { SupportedProviders } from '../@providers/supported-providers.ts';
import * as path from 'std/path/mod.ts';
import tmpDir from 'https://deno.land/x/tmp_dir@v0.1.0/mod.ts';

export class CldCtlProviderStore implements ProviderStore {
  private _providers?: Provider[];

  constructor(
    private config_dir: string = tmpDir() || '/tmp',
    private provider_filename: string = 'providers.json',
  ) {
    this.getProviders();
  }

  private get providers_config_file() {
    return path.join(this.config_dir, this.provider_filename);
  }

  saveFile(name: string, content: string): string {
    const file_path = path.join(this.config_dir, name);
    Deno.mkdirSync(path.dirname(file_path), { recursive: true });
    Deno.writeTextFileSync(file_path, content);
    return file_path;
  }

  getProvider(name: string): Provider | undefined {
    return this.getProviders().find((provider) => provider.name === name);
  }

  getProviders(): Provider[] {
    if (this._providers) {
      return this._providers;
    }

    try {
      const fileContents = Deno.readTextFileSync(this.providers_config_file);
      const rawProviders = JSON.parse(fileContents);

      const providers: Provider[] = [];
      for (const raw of rawProviders) {
        const type = raw.type as keyof typeof SupportedProviders;
        providers.push(
          new SupportedProviders[type](
            raw.name,
            raw.credentials,
            (name: string, content: string) => this.saveFile(name, content),
          ),
        );
      }

      this._providers = providers;
    } catch {
      this._providers = [];
    }

    return this._providers;
  }

  saveProvider(provider: Provider): void {
    const allProviders = this.getProviders();
    const foundIndex = allProviders.findIndex((p) => p.name === provider.name);
    if (foundIndex >= 0) {
      allProviders[foundIndex] = provider;
    } else {
      allProviders.push(provider);
    }
    this.saveProviders(allProviders);
  }

  deleteProvider(name: string): void {
    const allProviders = this.getProviders();
    const foundIndex = allProviders.findIndex((p) => p.name === name);
    if (foundIndex < 0) {
      throw new Error(`The ${name} provider was not found`);
    }

    allProviders.splice(foundIndex, 1);
    this.saveProviders(allProviders);
  }

  saveProviders(providers: Provider[]): void {
    Deno.mkdirSync(path.dirname(this.providers_config_file), {
      recursive: true,
    });
    Deno.writeTextFileSync(
      this.providers_config_file,
      JSON.stringify(providers, null, 2),
    );
  }
}
