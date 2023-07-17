export type Dictionary<T> = { [key: string]: T };

export type DeepPartial<T> = T extends Record<string, unknown> ? {
    [P in keyof T]?: DeepPartial<T[P]>;
  }
  : T;
