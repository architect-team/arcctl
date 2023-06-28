import { Subscriber } from 'rxjs';
import { parseSpecificResourceInputs, ResourceInputs, ResourceOutputs } from '../../../@resources/index.ts';
import { exec } from '../../../utils/command.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { DeepPartial } from '../../../utils/types.ts';
import { CrudResourceService } from '../../crud.service.ts';
import { DockerCredentials } from '../credentials.ts';

export class DockerTaskService extends CrudResourceService<'task', DockerCredentials> {
  get(_id: string): Promise<ResourceOutputs['task'] | undefined> {
    return Promise.resolve(undefined);
  }

  list(
    _filterOptions?: Partial<ResourceOutputs['task']> | undefined,
    _pagingOptions?: Partial<PagingOptions> | undefined,
  ): Promise<PagingResponse<ResourceOutputs['task']>> {
    return Promise.resolve({
      total: 0,
      rows: [],
    });
  }

  async create(_subscriber: Subscriber<string>, inputs: ResourceInputs['task']): Promise<ResourceOutputs['task']> {
    const args = ['run', '--detach'];
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
        typeof inputs.entrypoint === 'string' ? `${inputs.entrypoint}` : `${inputs.entrypoint.join(' ')}`,
      );
    }

    const labels = inputs.labels || {};
    for (const [key, value] of Object.entries(labels)) {
      args.push('--label', `${key}=${value}`);
    }

    args.push(inputs.image);

    if (inputs.command) {
      args.push(...(typeof inputs.command === 'string' ? [inputs.command] : inputs.command));
    }

    const { code, stdout, stderr } = await exec('docker', { args });
    if (code !== 0) {
      throw new Error(stderr || 'Task failed to run');
    }

    const id = stdout.trim();
    const { code: logsCode, stdout: logsStdout, stderr: logsStderr } = await exec('docker', { args: ['logs', id] });
    if (logsCode !== 0) {
      throw new Error(logsStderr || 'Failed to retrieve logs');
    }

    await exec('docker', { args: ['stop', id] });
    await exec('docker', { args: ['rm', id] });

    return {
      id,
      stdout: logsStdout,
      stderr: logsStderr,
    };
  }

  async update(
    subscriber: Subscriber<string>,
    id: string,
    inputs: DeepPartial<ResourceInputs['task']>,
  ): Promise<ResourceOutputs['task']> {
    try {
      const fullInputs = await parseSpecificResourceInputs('task', inputs);
      return this.create(subscriber, fullInputs);
    } catch (errors: any) {
      subscriber.next('Cannot re-run tasks with an incomplete input schema. Skipping.');

      return {
        id,
        stdout: '',
        stderr: '',
      };
    }
  }

  delete(subscriber: Subscriber<string>, _id: string): Promise<void> {
    subscriber.next('Tasks cannot be deleted. No action was taken.');
    return Promise.resolve();
  }
}
