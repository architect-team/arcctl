export type Dictionary<T> = { [key: string]: T };

// deno-lint-ignore ban-types
export type DeepPartial<T> = T extends object ? {
    [P in keyof T]?: DeepPartial<T[P]>;
  }
  : T;
