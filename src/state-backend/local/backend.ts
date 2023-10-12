import { StateBackend } from '../backend.ts';
import { LocalCredentials } from './credentials.ts';

export default class LocalStateBackend<T> extends StateBackend<T, LocalCredentials> {
  get directory(): string {
    return (this.credentials.directory ?? (Deno.env.get('HOME') + '/.arcctl/')).replace(/\/*$/, '');
  }

  testCredentials(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async getAll(): Promise<T[]> {
    const contents = await Deno.readTextFile(this.directory + `/architect-${this.name}-state.json`);
    return JSON.parse(contents);
  }

  async saveAll(records: T[]): Promise<void> {
    await Deno.writeTextFile(this.directory + `/architect-${this.name}-state.json`, JSON.stringify(records));
  }
}
