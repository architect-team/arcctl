export type Dictionary<T> = { [key: string]: T };

// Note: This must extend 'object' and not a 'Record<string, unknown>' in order for
// the schema generation from types that use DeepPartial to be correct.
export type DeepPartial<T> = T extends object ? {
    [P in keyof T]?: DeepPartial<T[P]>;
  }
  : T;
