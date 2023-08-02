import * as crypto from 'https://deno.land/std@0.177.0/node/crypto.ts';
import * as fs from 'std/fs/mod.ts';
import * as path from 'std/path/mod.ts';
import { SupportedProviders } from '../@providers/index.ts';
import { Provider } from '../@providers/provider.ts';
import { EmptyProviderStore } from '../@providers/store.ts';
import { PipelineStep } from '../pipeline/step.ts';
import { StateBackend } from '../utils/config.ts';

const tmpDir = Deno.makeTempDirSync();

export class Storage {
  records?: any[];
  files: Record<string, string> = {};
}

export class BaseStore<T> {
  protected _records?: T[];

  constructor(
    private name: string,
    private stateBackend: StateBackend,
  ) {}

  private replaceHashesWithFileReferences(directory: string, record: any, lookupTable: Record<string, string>): void {
    if (!record) {
      return;
    }
    for (const [key, value] of Object.entries(record)) {
      if (value == undefined) {
        continue;
      }
      if (typeof value === 'object' || Array.isArray(value)) {
        this.replaceHashesWithFileReferences(directory, value, lookupTable);
        continue;
      }
      const fileContents = lookupTable[value?.toString() || ''];
      if (fileContents) {
        const file = path.join(directory, value.toString());
        Deno.writeTextFileSync(file, fileContents);
        record[key] = file;
      }
    }
  }

  private replaceFileReferencesWithHashes(record: any): Record<string, string> {
    if (record === undefined) {
      return {};
    }
    let results: Record<string, string> = {};
    for (const [key, value] of Object.entries(record)) {
      if (value == undefined) {
        continue;
      }
      if (typeof value === 'object' || Array.isArray(value)) {
        results = {
          ...results,
          ...this.replaceFileReferencesWithHashes(value),
        };
        continue;
      }
      try {
        if (fs.existsSync(value.toString()) && Deno.statSync(value.toString()).isFile) {
          const fileContents = Deno.readFileSync(value as string);
          const hashSum = crypto.createHash('sha256');
          hashSum.update(fileContents);
          const hash = hashSum.setEncoding('utf-8').digest('hex') as string;
          results[hash] = new TextDecoder().decode(fileContents);
          record[key] = hash;
        }
      } catch {
        // ignore since this means the path is invalid
      }
    }
    return results;
  }

  protected async saveAll(records: T[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const stringifiedRecords = JSON.parse(JSON.stringify(records));
      const storage: Storage = {
        records: stringifiedRecords,
        files: this.replaceFileReferencesWithHashes(stringifiedRecords),
      };
      const secretStep = new PipelineStep({
        action: 'create',
        type: 'secret',
        name: this.name,
        inputs: {
          type: 'secret',
          name: this.name,
          namespace: this.stateBackend.namespace,
          account: '',
          data: JSON.stringify(storage),
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

    const storage = JSON.parse(secret.data);

    this.replaceHashesWithFileReferences(tmpDir, storage.records, storage.files);

    const records = [];
    for (const record of storage.records) {
      records.push(await convertor(record));
    }
    this._records = records;

    return this._records!;
  }
}
