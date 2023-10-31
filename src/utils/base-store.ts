export interface BaseStore<T> {
  find(): Promise<T[]>;
  get(id: string): Promise<T | undefined>;
  save(input: T): Promise<void>;
  remove(id: string): Promise<void>;
}
