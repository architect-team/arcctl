import * as crypto from 'https://deno.land/std@0.177.0/node/crypto.ts';
import * as path from 'std/path/mod.ts';
import ArcCtlConfig from '../utils/config.ts';
import { pathExistsSync } from '../utils/filesystem.ts';

const tmpDir = Deno.makeTempDirSync();

export class Storage {
  records?: any[];
  files: Record<string, string> = {};
}

export class BaseStore<T> {
  protected _records?: T[];

  constructor(
    private name: string,
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
        if (pathExistsSync(value.toString()) && Deno.statSync(value.toString()).isFile) {
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
    const stringifiedRecords = JSON.parse(JSON.stringify(records));
    const storage: Storage = {
      records: stringifiedRecords,
      files: this.replaceFileReferencesWithHashes(stringifiedRecords),
    };
    const file = path.join(ArcCtlConfig.getConfigDirectory(), `${this.name}.json`);
    Deno.mkdirSync(path.dirname(file), { recursive: true });
    Deno.writeTextFileSync(file, JSON.stringify(storage, null, 2));
  }

  protected async load(convertor: (raw: any) => Promise<T>): Promise<T[]> {
    if (this._records) {
      return this._records;
    }

    const file = path.join(ArcCtlConfig.getConfigDirectory(), `${this.name}.json`);
    try {
      const storage = JSON.parse(Deno.readTextFileSync(file));
      this.replaceHashesWithFileReferences(tmpDir, storage.records, storage.files);
      const records = [];
      for (const record of storage.records) {
        records.push(await convertor(record));
      }
      this._records = records;
    } catch {
      this._records = [];
    }
    return this._records;
  }
}
