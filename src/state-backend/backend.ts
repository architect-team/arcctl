import * as crypto from 'https://deno.land/std@0.177.0/node/crypto.ts';
import * as path from 'std/path/mod.ts';
import { pathExistsSync } from '../utils/filesystem.ts';

export abstract class StateBackend<T, C = Record<string, unknown>> {
  constructor(
    protected name: string,
    protected credentials: C,
  ) {}

  protected replaceHashesWithFileReferences(directory: string, record: any, lookupTable: Record<string, string>): void {
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

  protected replaceFileReferencesWithHashes(record: any): Record<string, string> {
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

  /**
   * Throws an error if credentials are invalid
   */
  abstract testCredentials(): Promise<void>;

  abstract getAll(): Promise<T[]>;

  abstract saveAll(records: T[]): Promise<void>;
}
