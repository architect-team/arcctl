import {
  ResourceInputs,
  ResourceOutputs,
  ResourceType,
} from '../@resources/index.js';
import { ReadOnlyResourceService } from './service.js';

export abstract class CrudResourceService<
  T extends ResourceType,
> extends ReadOnlyResourceService<T> {
  abstract create(inputs: ResourceInputs[T]): Promise<ResourceOutputs[T]>;

  abstract update(inputs: ResourceInputs[T]): Promise<ResourceOutputs[T]>;

  abstract delete(id: string): Promise<void>;
}
