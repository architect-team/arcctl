import { SupportedProviders } from '../@providers/index.ts';
import { Provider } from '../@providers/provider.ts';
import { EmptyProviderStore } from '../@providers/store.ts';
import { PipelineStep } from '../pipeline/step.ts';
import { StateBackend } from '../utils/config.ts';

export class BaseStore<T> {
  protected _records?: T[];

  constructor(
    private name: string,
    private stateBackend: StateBackend,
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
          namespace: this.stateBackend.namespace,
          account: '',
          data: JSON.stringify(records),
        },
      });
      secretStep
        .apply({
          providerStore: {
            get: (name: string): Promise<Provider> => {
              return Promise.resolve(
                new SupportedProviders[this.stateBackend.provider](
                  name,
                  this.stateBackend.credentials,
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
  }

  protected async load(convertor: (raw: any) => Promise<T>): Promise<T[]> {
    if (this._records) {
      return this._records;
    }

    const provider = new SupportedProviders[this.stateBackend.provider](
      'secret',
      this.stateBackend.credentials,
      new EmptyProviderStore(),
      {},
    );

    if (!(provider.resources as any).secret) {
      console.error(`The ${this.stateBackend.provider} provider doesn't support secrets`);
      Deno.exit(1);
    }

    const service = (provider.resources as any).secret;
    if (!service) {
      console.error(`The ${this.stateBackend.provider} provider doesn't support secrets`);
      Deno.exit(1);
    }

    let secret;
    try {
      secret = await service.get(`${this.stateBackend.namespace}/${this.name}`);
    } catch {
      // handled by downstream code
    }
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
