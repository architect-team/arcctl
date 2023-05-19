export type PagingResponse<T> = {
  total: number;
  rows: T[];
};

export type PagingOptions = {
  limit: number;
  offset: number;
};
