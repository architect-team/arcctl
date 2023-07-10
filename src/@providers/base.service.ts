import { Observable, ReadableStream } from 'rxjs';
import { Logger } from 'winston';
import { ResourceInputs, ResourceOutputs, ResourceType } from '../@resources/index.ts';
import { ArchitectPlugin } from '../index.ts';
import { PagingOptions, PagingResponse } from '../utils/paging.ts';
import { ProviderCredentials } from './credentials.ts';
import { ProviderStore } from './store.ts';

export type InputValidators<T extends ResourceType> = {
  [P in keyof ResourceInputs[T]]?: (
    value: ResourceInputs[T][P],
  ) => string | true;
};

export type ResourcePresets<T extends ResourceType> = Array<{
  display: string;
  values: Partial<ResourceInputs[T]>;
}>;

export type ApplyOptions<S = any> = {
  id: string;
  providerStore: ProviderStore;
  cwd?: string;
  logger?: Logger;
  state?: S;
};

export type ApplyOutputs<T extends ResourceType> = {
  state?: any;
  status: {
    state:
      | 'pending'
      | 'starting'
      | 'applying'
      | 'destroying'
      | 'complete'
      | 'unknown'
      | 'error';
    message?: string;
    startTime?: number;
    endTime?: number;
  };
  outputs?: ResourceOutputs[T];
};

export type LogsOptions = {
  follow?: boolean;
  tail?: number;
};

export abstract class ResourceService<
  T extends ResourceType,
  C extends ProviderCredentials,
> {
  public constructor(
    protected accountName: string,
    protected credentials: C,
    protected providerStore: ProviderStore,
  ) {}

  /**
   * Retrieve the details of an existing resource
   */
  abstract get(id: string): Promise<ResourceOutputs[T] | undefined>;

  /**
   * Search for resources matching the specified options
   */
  abstract list(
    filterOptions?: Partial<ResourceOutputs[T]>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs[T]>>;

  public logs(
    _id: string,
    _options?: LogsOptions,
  ): ReadableStream<Uint8Array> | undefined {
    return undefined;
  }
}

export abstract class WritableResourceService<
  T extends ResourceType,
  C extends ProviderCredentials,
> extends ResourceService<T, C> {
  /**
   * A set of simple preset input packages for the resource that
   * may be helpful to accelerate developer testing
   */
  get presets(): ResourcePresets<T> {
    return [];
  }

  /**
   * Returns a set of functions that take input field values and determines if
   * the values are allowed
   */
  get validators(): InputValidators<T> {
    return {};
  }

  abstract apply(
    inputs: ResourceInputs[T],
    options: ApplyOptions,
  ): Observable<ApplyOutputs<T>>;

  abstract destroy(options: ApplyOptions, inputs?: ResourceInputs[T]): Observable<ApplyOutputs<T>>;

  abstract getHash(inputs: ResourceInputs[T], options: ApplyOptions): string;
}
