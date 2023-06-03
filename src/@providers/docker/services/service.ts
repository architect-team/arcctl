import { ResourceInputs, ResourceOutputs } from '../../../@resources/types.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { CrudResourceService } from '../../crud.service.ts';
import { DockerCredentials } from '../credentials.ts';
import { ApplyOutputs } from '../../base.service.ts';
import { Observable } from 'rxjs';

export class DockerServiceService extends CrudResourceService<'service', DockerCredentials> {
  get(_id: string): Promise<ResourceOutputs['service'] | undefined> {
    throw new Error('Method not implemented.');
  }

  list(
    _filterOptions?: Partial<ResourceOutputs['service']> | undefined,
    _pagingOptions?: Partial<PagingOptions> | undefined,
  ): Promise<PagingResponse<ResourceOutputs['service']>> {
    throw new Error('Method not implemented.');
  }

  create(inputs: ResourceInputs['service']): Observable<ApplyOutputs<'service'>> {
    return new Observable((subscriber) => {
      const startTime = Date.now();
      subscriber.next({
        status: {
          state: 'applying',
          message: 'Creating service',
          startTime,
        },
      });

      const protocol = inputs.protocol || 'http';
      const host = inputs.selector || '';
      const url = `${protocol}://${host}:${inputs.target_port}`;

      subscriber.next({
        status: {
          state: 'complete',
          message: '',
          startTime,
          endTime: Date.now(),
        },
        outputs: {
          host,
          id: inputs.name,
          port: inputs.target_port,
          protocol,
          url,
        },
        state: {
          host,
          id: inputs.name,
          port: inputs.target_port,
          protocol,
          url,
        },
      });

      subscriber.complete();
    });
  }

  update(_id: string, _inputs: ResourceInputs['service']): Observable<ApplyOutputs<'service'>> {
    throw new Error('Method not implemented');
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  delete(_id: string): Observable<ApplyOutputs<'service'>> {
    throw new Error('Method not implemented');
  }
}
