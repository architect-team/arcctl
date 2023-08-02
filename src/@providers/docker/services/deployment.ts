import { lastValueFrom, Subscriber } from 'rxjs';
import { mergeReadableStreams } from 'std/streams/mod.ts';
import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.ts';
import { exec } from '../../../utils/command.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { DeepPartial } from '../../../utils/types.ts';
import { LogsOptions } from '../../base.service.ts';
import { CrudResourceService } from '../../crud.service.ts';
import { ProviderStore } from '../../store.ts';
import { DockerCredentials } from '../credentials.ts';
import { DockerInspectionResults, DockerPsItem } from '../types.ts';

export class DockerDeploymentService extends CrudResourceService<'deployment', DockerCredentials> {
  public constructor(accountName: string, credentials: DockerCredentials, providerStore: ProviderStore) {
    super(accountName, credentials, providerStore);
  }

  public async inspect(id: string): Promise<DockerInspectionResults | undefined> {
    const { stdout } = await exec('docker', { args: ['inspect', id.replaceAll('/', '--')] });
    const rawContents: DockerInspectionResults[] = JSON.parse(stdout);
    return rawContents.length > 0 ? rawContents[0] : undefined;
  }

  async get(id: string): Promise<ResourceOutputs['deployment'] | undefined> {
    const listRes = await this.list();
    return listRes.rows.find((row) => row.id === id);
  }

  private async getPods(
    labels: Record<string, string>,
  ): Promise<DockerInspectionResults[]> {
    const args = ['ps', '--format', 'json'];

    labels['io.architect'] = 'arcctl';
    for (const [key, value] of Object.entries(labels)) {
      let contents = key;
      if (value) {
        contents += `=${value}`;
      }

      args.push('--filter', `label=${contents}`);
    }

    const { stdout } = await exec('docker', { args });
    const rows = stdout.includes('\n') ? stdout.split('\n').filter((row) => Boolean(row)) : [stdout];
    const rawOutput: DockerPsItem[] = JSON.parse(`[${rows.join(',')}]`);

    return Promise.all(rawOutput.map(async (row) => {
      const res = await this.inspect(row.Names);
      return res!;
    }));
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['deployment']> | undefined,
    _pagingOptions?: Partial<PagingOptions> | undefined,
  ): Promise<PagingResponse<ResourceOutputs['deployment']>> {
    const res = await this.getPods({
      ...filterOptions?.labels,
      'io.architect': 'arcctl',
      'io.architect.arcctl.deployment': '',
    });

    return {
      total: res.length,
      rows: res.map((row) => ({
        id: row.Config?.Labels?.['io.architect.arcctl.deployment'] || 'unknown',
        labels: row.Config?.Labels,
      })),
    };
  }

  logs(id: string, options?: LogsOptions): ReadableStream<Uint8Array> {
    const args = ['logs', id.replaceAll('/', '--')];

    if (options?.follow) {
      args.push('-f');
    }

    if (options?.tail) {
      args.push('--tail', options.tail.toString());
    }

    const cmd = new Deno.Command('docker', {
      stdout: 'piped',
      stderr: 'piped',
      args,
    });
    const child = cmd.spawn();
    return mergeReadableStreams(child.stdout, child.stderr);
  }

  async create(
    _subscriber: Subscriber<string>,
    inputs: ResourceInputs['deployment'],
  ): Promise<ResourceOutputs['deployment']> {
    let containerName = inputs.name.replaceAll('/', '--');
    if (inputs.namespace) {
      containerName = `${inputs.namespace}--` + containerName;
    }
    const args = ['run', '--detach', '--quiet', '--name', containerName];

    if (inputs.environment) {
      for (const [key, value] of Object.entries(inputs.environment)) {
        args.push('--env', `${key}=${String(value)}`);
      }
    }

    if (inputs.platform) {
      args.push('--platform', inputs.platform);
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

    for (const port of inputs.exposed_ports || []) {
      let value = String(port.target_port);
      if (port.port) {
        value = `${port.port}:${value}`;
      }

      args.push('-p', value);
    }

    let labels = inputs.labels || {};
    labels = {
      ...labels,
      'io.architect': 'arcctl',
      'io.architect.arcctl.deployment': containerName,
    };

    for (const [key, value] of Object.entries(labels)) {
      args.push('--label', `${key}=${value}`);
    }

    args.push(inputs.image);

    if (inputs.command) {
      args.push(...(typeof inputs.command === 'string' ? [inputs.command] : inputs.command));
    }

    const { code, stderr } = await exec('docker', { args });
    if (code !== 0) {
      throw new Error(stderr || 'Deployment failed');
    }

    // Deployment successful. Report back to the server.
    const inspectionRes = await this.inspect(containerName);
    const networks = Object.keys(inspectionRes?.NetworkSettings.Networks || {});
    const ipAddress = inspectionRes?.NetworkSettings.Networks[networks[0]].IPAddress;

    for (const serviceConfig of inputs.services || []) {
      const writableService = await this.providerStore.getWritableService(serviceConfig.account, 'service');
      const existingService = await writableService.get(serviceConfig.id);
      if (existingService?.target_servers) {
        const newUrl = `http://${ipAddress}:${serviceConfig.port}`;

        const target_servers = existingService.target_servers;
        if (!target_servers.includes(newUrl)) {
          target_servers.push(newUrl);
        }

        await lastValueFrom(writableService.apply({
          ...existingService,
          type: 'service',
          target_servers,
        }, {
          id: serviceConfig.id,
          providerStore: this.providerStore,
        }));
      }
    }

    return {
      id: containerName,
      labels,
    };
  }

  async update(
    subscriber: Subscriber<string>,
    id: string,
    inputs: DeepPartial<ResourceInputs['deployment']>,
  ): Promise<ResourceOutputs['deployment']> {
    const inspection = await this.inspect(id);
    if (!inspection) {
      throw new Error(`No deployment with ID ${id}`);
    }

    subscriber.next(`Stopping old container: ${inspection.Id}`);

    const { code: stopCode, stderr: stopStderr } = await exec('docker', { args: ['stop', inspection.Id] });
    if (stopCode !== 0) {
      throw new Error(stopStderr);
    }

    const { code: rmCode, stderr: rmStderr } = await exec('docker', { args: ['rm', inspection.Id] });
    if (rmCode !== 0) {
      throw new Error(rmStderr);
    }

    subscriber.next(`Starting new container`);

    return this.create(subscriber, inputs as ResourceInputs['deployment']);
  }

  async delete(subscriber: Subscriber<string>, id: string): Promise<void> {
    const match = await this.get(id);
    if (!match) {
      subscriber.next('No matching deployment. Skipping.');
      return Promise.resolve();
    }

    const { code, stderr } = await exec('docker', { args: ['stop', match.id] });
    if (code !== 0) {
      throw new Error(stderr || 'Failed to stop deployment');
    }

    const { code: rmCode, stderr: rmStderr } = await exec('docker', { args: ['rm', match.id] });
    if (rmCode !== 0) {
      throw new Error(rmStderr || 'Failed to remove deployment');
    }
  }
}
