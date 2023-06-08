import { map, Observable } from 'rxjs';
import { ResourceInputs, ResourceOutputs, ResourceType } from '../@resources/index.ts';
import { DeepPartial } from '../utils/types.ts';
import { ApplyOptions, ApplyOutputs, WritableResourceService } from './base.service.ts';
import { ProviderCredentials } from './credentials.ts';

export abstract class CrudResourceService<
  T extends ResourceType,
  C extends ProviderCredentials,
> extends WritableResourceService<T, C> {
  abstract create(inputs: ResourceInputs[T]): Observable<ApplyOutputs<T>>;

  abstract update(id: string, inputs: DeepPartial<ResourceInputs[T]>): Observable<ApplyOutputs<T>>;

  abstract delete(id: string): Observable<ApplyOutputs<T>>;

  apply(inputs: ResourceInputs[T], options: ApplyOptions<ResourceOutputs[T]>): Observable<ApplyOutputs<T>> {
    return options.state?.id
      ? this.update(options.state.id, inputs).pipe(map((next) => ({
        ...next,
        state: next.outputs,
      })))
      : this.create(inputs).pipe(map((next) => ({
        ...next,
        state: next.outputs,
      })));
  }

  destroy(options: ApplyOptions<ResourceOutputs[T]>): Observable<ApplyOutputs<T>> {
    if (!options.state?.id) {
      throw new Error(`No resource ID specified`);
    }

    return this.delete(options.state.id);
  }
}
