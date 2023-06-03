import { DeepPartial } from '../utils/types.ts';
import {
  ResourceType,
  ResourceInputs,
  ResourceOutputs,
} from '../@resources/index.ts';
import {
  WritableResourceService,
  ApplyOptions,
  ApplyOutputs,
} from './base.service.ts';
import { Observable } from 'rxjs';
import { ProviderCredentials } from './credentials.ts';

export abstract class CrudResourceService<
  T extends ResourceType,
  C extends ProviderCredentials,
> extends WritableResourceService<T, C> {
  abstract create(inputs: ResourceInputs[T]): Observable<ApplyOutputs<T>>;

  abstract update(
    id: string,
    inputs: DeepPartial<ResourceInputs[T]>,
  ): Observable<ApplyOutputs<T>>;

  abstract delete(id: string): Observable<ApplyOutputs<T>>;

  apply(
    inputs: ResourceInputs[T],
    options: ApplyOptions<ResourceOutputs[T]>,
  ): Observable<ApplyOutputs<T>> {
    return new Observable((subscriber) => {
      subscriber.next({
        status: {
          state: 'starting',
          startTime: Date.now(),
        },
      });

      if (options.state) {
        // Updating
        this.update(options.state.id, inputs).subscribe(subscriber);
      } else {
        // Creating
        this.create(inputs).subscribe(subscriber);
      }
    });
  }

  destroy(
    id: string,
    options: ApplyOptions<ResourceOutputs[T]>,
  ): Observable<ApplyOutputs<T>> {
    return this.delete(id);
  }
}
