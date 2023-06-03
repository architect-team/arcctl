import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.ts';
import { exec } from '../../../utils/command.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { ApplyOutputs } from '../../base.service.ts';
import { CrudResourceService } from '../../crud.service.ts';
import { DockerCredentials } from '../credentials.ts';
import { Observable } from 'rxjs';

type DockerPsItem = {
  Command: string;
  ID: string;
  Names: string;
  Networks: string;
  State: string;
};

type DockerInspectionResults = {
  Id: string;
  Created: string;
  Path: string;
  Args: string[];
  State: {
    Status: string;
    Running: boolean;
    Paused: boolean;
    Restarting: boolean;
    Dead: boolean;
  };
  Image: string;
  ResolvConfPath: string;
  Name: string;
  Driver: string;
  Platform: string;
};

export class DockerDeploymentService extends CrudResourceService<'deployment', DockerCredentials> {
  async get(id: string): Promise<ResourceOutputs['deployment'] | undefined> {
    const { stdout } = await exec('docker', { args: ['inspect', id] });
    const rawContents: DockerInspectionResults[] = JSON.parse(stdout);
    if (rawContents.length > 0) {
      return {
        id: rawContents[0].Name.replace(/^\//, ''),
      };
    }

    return undefined;
  }

  async list(
    _filterOptions?: Partial<ResourceOutputs['deployment']> | undefined,
    _pagingOptions?: Partial<PagingOptions> | undefined,
  ): Promise<PagingResponse<ResourceOutputs['deployment']>> {
    const { stdout } = await exec('docker', { args: ['ps', '--format', 'json'] });
    const rawContents = JSON.parse(stdout);
    return {
      total: rawContents.length,
      rows: rawContents.map((r: DockerPsItem) => ({
        id: r.Names,
      })),
    };
  }

  create(inputs: ResourceInputs['deployment']): Observable<ApplyOutputs<'deployment'>> {
    return new Observable((subscriber) => {
      const startTime = Date.now();
      subscriber.next({
        status: {
          state: 'applying',
          message: 'Creating deployment',
          startTime: startTime,
        },
      });

      const args = ['run', '--detach', '--name', inputs.name];
      if (inputs.namespace) {
        args.push('--network', inputs.namespace);
      }

      if (inputs.environment) {
        for (const [key, value] of Object.entries(inputs.environment)) {
          args.push('--env', `${key}="${String(value)}"`);
        }
      }

      if (inputs.volume_mounts) {
        for (const mount of inputs.volume_mounts) {
          args.push('--volume', `${mount.volume}:${mount.mount_path}`);
        }
      }

      if (inputs.entrypoint) {
        args.push(
          '--entrypoint',
          typeof inputs.entrypoint === 'string' ? `"${inputs.entrypoint}"` : `"${inputs.entrypoint.join(' ')}"`,
        );
      }

      args.push(inputs.image);

      if (inputs.command) {
        args.push(typeof inputs.command === 'string' ? `"${inputs.command}"` : `"${inputs.command.join(' ')}"`);
      }

      exec('docker', { args }).then(() => {
        subscriber.next({
          status: {
            state: 'complete',
            message: '',
            startTime,
            endTime: Date.now(),
          },
          outputs: {
            id: inputs.name,
          },
          state: {
            id: inputs.name,
          },
        });

        subscriber.complete();
      });
    });
  }

  update(_id: string, _inputs: ResourceInputs['deployment']): Observable<ApplyOutputs<'deployment'>> {
    throw new Error('Not yet implemented');
  }

  delete(id: string): Observable<ApplyOutputs<'deployment'>> {
    return new Observable((subscriber) => {
      const startTime = Date.now();
      subscriber.next({
        status: {
          state: 'destroying',
          message: 'Destroying deployment',
          startTime,
        },
      });

      exec('docker', { args: ['stop', id] }).then(() => {
        subscriber.next({
          status: {
            state: 'complete',
            message: '',
            startTime,
            endTime: Date.now(),
          },
        });

        subscriber.complete();
      });
    });
  }
}
