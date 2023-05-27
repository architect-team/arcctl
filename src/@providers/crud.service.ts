import {
  ResourceInputs,
  ResourceOutputs,
  ResourceType,
} from '../@resources/index.js';
import { DeepPartial } from '../utils/types.js';
import { BaseService } from './service.js';

export abstract class CrudResourceService<
  T extends ResourceType,
> extends BaseService<T> {
  abstract create(inputs: ResourceInputs[T]): Promise<ResourceOutputs[T]>;

  abstract update(
    inputs: ResourceInputs[T],
  ): Promise<DeepPartial<ResourceOutputs[T]>>;

  abstract delete(id: string): Promise<void>;
}
