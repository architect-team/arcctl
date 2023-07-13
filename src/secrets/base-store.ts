import { SupportedProviders } from '../@providers/index.ts';
import { Provider } from '../@providers/provider.ts';
import { EmptyProviderStore } from '../@providers/store.ts';
import { PipelineStep } from '../pipeline/step.ts';
import { SecretStore } from './store.ts';

export class BaseStore<T> {
  protected _records?: T[];

  constructor(
    private name: string,
    private secretStore: SecretStore,
  ) {}

  protected async saveAll(records: T[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const secretStep = new PipelineStep({
        action: 'create',
        type: 'secret',
        name: this.name,
        inputs: {
          type: 'secret',
          name: this.name,
          namespace: 'arcctl',
          account: '',
          data: JSON.stringify(records),
        },
      });

      this.secretStore.get().then((secretAccount) => {
        secretStep
          .apply({
            providerStore: {
              getProvider: (name: string): Promise<Provider> => {
                return Promise.resolve(
                  new SupportedProviders[secretAccount.provider](
                    name,
                    secretAccount.credentials,
                    new EmptyProviderStore(),
                    {},
                  ),
                );
              },
            } as any,
          })
          .subscribe({
            complete: async () => {
              if (!secretStep.outputs) {
                console.error(`Something went wrong storing the ${this.name}`);
                Deno.exit(1);
              }
              resolve();
            },
            error: (err: any) => {
              reject(err);
            },
          });
      });
    });
  }

  protected async load(convertor: (raw: any) => Promise<T>): Promise<T[]> {
    if (this._records) {
      return this._records;
    }

    const secretAccount = await this.secretStore.get();

    const provider = new SupportedProviders[secretAccount.provider](
      'secret',
      secretAccount.credentials,
      new EmptyProviderStore(),
      {},
    );

    if (!(provider.resources as any).secret) {
      console.error(`The ${secretAccount.provider} provider doesn't support secrets`);
      Deno.exit(1);
    }

    const service = (provider.resources as any).secret;
    if (!service) {
      console.error(`The ${secretAccount.provider} provider doesn't support secrets`);
      Deno.exit(1);
    }

    const secret = await service.get(`arcctl--${this.name}`);
    if (!secret) {
      this._records = [];
      return this._records;
    }

    const records = [];
    for (const record of JSON.parse(secret.data)) {
      records.push(await convertor(record));
    }
    this._records = records;

    return this._records!;
  }
}
