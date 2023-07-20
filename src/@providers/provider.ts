import * as crypto from 'https://deno.land/std@0.177.0/node/crypto.ts';
import * as fs from 'std/fs/mod.ts';
import * as path from 'std/path/mod.ts';
import { ResourceType } from '../@resources/index.ts';
import { ResourceService } from './base.service.ts';
import { ProviderCredentials, ProviderCredentialsSchema } from './credentials.ts';
import { ProviderStore } from './store.ts';
import { CldctlTestResource } from './tests.ts';

export type ProviderResources<C extends ProviderCredentials> = {
  [T in ResourceType]?: ResourceService<T, C>;
};

type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

export abstract class Provider<
  C extends ProviderCredentials = ProviderCredentials,
> {
  /**
   * A unique name for the provider
   */
  abstract readonly type: string;

  /**
   * The schema of the credentials used to authenticate with the provider. Uses
   * JSON schema and the AJV package
   *
   * @see https://ajv.js.org/
   */
  static readonly CredentialsSchema: ProviderCredentialsSchema;

  /**
   * A set of resource types that this provider can interact with, and the
   * methods it supports
   */
  abstract readonly resources: ProviderResources<C>;

  tests: CldctlTestResource<ProviderCredentials> = [];

  constructor(
    readonly name: string,
    readonly credentials: C,
    readonly providerStore: ProviderStore,
    readonly files: Record<string, string>,
  ) {
    if (Object.entries(files).length == 0) {
      return;
    }
    const fileLookup: Record<string, string> = {};
    const folder = Deno.makeTempDirSync();
    for (const [hash, contents] of Object.entries(files)) {
      const file = path.join(folder, hash);
      Deno.writeFileSync(file, new TextEncoder().encode(contents));
      fileLookup[hash] = file;
    }
    this.replaceHashesWithFileReferences(this.credentials, fileLookup);
  }

  public abstract testCredentials(): Promise<boolean>;

  // public testCredentialsTest(): Promise<string> {
  //   return new Promise((resolve, reject) => resolve(''));
  // } // TODO: remove

  public getResourceEntries(): Entries<
    {
      [T in ResourceType]: ResourceService<T, C>;
    }
  > {
    return Object.entries(this.resources) as Entries<
      {
        [T in ResourceType]: ResourceService<T, C>;
      }
    >;
  }

  private replaceHashesWithFileReferences(record: any, lookupTable: Record<string, string>): void {
    for (const [key, value] of Object.entries(record)) {
      if (typeof value === 'object') {
        this.replaceHashesWithFileReferences(value, lookupTable);
        continue;
      }
      const file = lookupTable[value?.toString() || ''];
      if (file) {
        record[key] = file;
      }
    }
  }

  private replaceFileReferencesWithHashes(record: any): Record<string, string> {
    let results: Record<string, string> = {};
    for (const [key, value] of Object.entries(record)) {
      if (typeof value === 'object') {
        results = {
          ...results,
          ...this.replaceFileReferencesWithHashes(value),
        };
        continue;
      }

      const value_string = value as string;
      let directory_exists = false;
      try {
        if (fs.existsSync(value_string)) {
          directory_exists = true;
        }
      } catch {
        // ignore error if directory doesn't exist as existsSync will throw an error - https://github.com/denoland/deno_std/issues/1216, https://github.com/denoland/deno_std/issues/2494
      }

      if (directory_exists && Deno.statSync(value_string).isFile) {
        const fileContents = Deno.readFileSync(value_string);
        const hashSum = crypto.createHash('sha256');
        hashSum.update(fileContents);
        const hash = hashSum.setEncoding('utf-8').digest('hex') as string;
        results[hash] = new TextDecoder().decode(fileContents);
        record[key] = hash;
      }
    }
    return results;
  }

  public toJSON(): Record<string, unknown> {
    const copy = JSON.parse(JSON.stringify({
      name: this.name,
      type: this.type,
      credentials: this.credentials,
      files: this.files,
    }));
    copy.files = this.replaceFileReferencesWithHashes(copy.credentials);
    return copy;
  }
}
