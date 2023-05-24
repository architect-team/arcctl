import {
  ResourceInputs,
  ResourceOutputs,
  ResourceType,
} from '../@resources/index.js';
import { PagingOptions, PagingResponse } from '../utils/paging.js';
import { ProviderStore } from './store.js';
import { SaveFileFn } from './types.js';

export type InputValidators<T extends ResourceType> = {
  [P in keyof ResourceInputs[T]]?: (
    value: ResourceInputs[T][P],
  ) => string | true;
};

export type ResourcePresets<T extends ResourceType> = Array<{
  display: string;
  values: Partial<ResourceInputs[T]>;
}>;

export interface ResourceLifecycleHooks<T extends ResourceType> {
  afterCreate?: (
    providerStore: ProviderStore,
    inputs: ResourceInputs[T],
    outputs: ResourceOutputs[T] & Record<string, any>,
  ) => Promise<void>;
  afterDelete?: () => Promise<void>;
  afterImport?: () => Promise<void>;
}

export abstract class BaseService<T extends ResourceType> {
  hooks: ResourceLifecycleHooks<T> = {};

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
}
