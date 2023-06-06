import { ResourceInputs, ResourceOutputs, ResourceType } from '../@resources/index.ts';
import { DeepPartial } from '../utils/types.ts';
import { BaseService } from './service.ts';

export abstract class CrudResourceService<T extends ResourceType> extends BaseService<T> {
  abstract create(inputs: ResourceInputs[T]): Promise<ResourceOutputs[T]>;

  abstract update(inputs: ResourceInputs[T]): Promise<DeepPartial<ResourceOutputs[T]>>;

  abstract delete(id: string): Promise<void>;
}
