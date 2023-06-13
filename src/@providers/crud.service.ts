import { Observable, Subscriber } from 'rxjs';
import { ResourceInputs, ResourceOutputs, ResourceType } from '../@resources/index.ts';
import { DeepPartial } from '../utils/types.ts';
import { ApplyOptions, ApplyOutputs, WritableResourceService } from './base.service.ts';
import { ProviderCredentials } from './credentials.ts';

export abstract class CrudResourceService<
  T extends ResourceType,
  C extends ProviderCredentials,
> extends WritableResourceService<T, C> {
  abstract create(
    subscriber: Subscriber<string>,
    inputs: ResourceInputs[T],
  ): Promise<ResourceOutputs[T]>;

  abstract update(
    subscriber: Subscriber<string>,
    id: string,
    inputs: DeepPartial<ResourceInputs[T]>,
  ): Promise<ResourceOutputs[T]>;

  abstract delete(subscriber: Subscriber<string>, id: string): Promise<void>;

  apply(inputs: ResourceInputs[T], options: ApplyOptions<ResourceOutputs[T]>): Observable<ApplyOutputs<T>> {
    return new Observable<ApplyOutputs<T>>((res) => {
      const startTime = Date.now();
      res.next({
        status: {
          state: 'applying',
          startTime,
        },
      });

      const statusObserver = new Observable<string>((status) => {
        const promise = options.state?.id
          ? this.update(status, options.state.id, inputs as DeepPartial<ResourceInputs[T]>)
          : this.create(status, inputs);

        promise.then((outputs) => {
          status.complete();
          res.next({
            status: {
              state: 'complete',
              startTime,
              endTime: Date.now(),
            },
            outputs,
            state: outputs,
          });
          res.complete();
        }).catch((err) => {
          status.complete();
          res.next({
            status: {
              state: 'error',
              message: 'message' in err ? err.message : err,
              startTime,
              endTime: Date.now(),
            },
          });
          res.error(err);
        });
      });

      statusObserver.subscribe((status) => {
        res.next({
          status: {
            state: 'applying',
            message: status,
            startTime,
          },
        });
      });
    });
  }

  destroy(options: ApplyOptions<ResourceOutputs[T]>): Observable<ApplyOutputs<T>> {
    return new Observable<ApplyOutputs<T>>((res) => {
      const startTime = Date.now();
      res.next({
        status: {
          state: 'destroying',
          startTime,
        },
      });

      if (!options.state?.id) {
        res.next({
          status: {
            state: 'error',
            message: 'No resource ID specified',
            startTime,
          },
        });
        res.error(new Error(`No resource ID specified`));
        return;
      }

      const statusObserver = new Observable<string>((status) => {
        this.delete(status, options.state!.id).then((outputs) => {
          status.complete();
          res.next({
            status: {
              state: 'complete',
              startTime,
              endTime: Date.now(),
            },
          });
          res.complete();
        }).catch((err) => {
          status.complete();
          res.next({
            status: {
              state: 'error',
              message: 'message' in err ? err.message : err,
              startTime,
              endTime: Date.now(),
            },
          });
          res.error(err);
        });
      });

      statusObserver.subscribe((status) => {
        res.next({
          status: {
            state: 'applying',
            message: status,
            startTime,
          },
        });
      });
    });
  }
}
