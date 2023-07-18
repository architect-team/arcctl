import { Subscriber } from 'rxjs';
import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { DeepPartial } from '../../../utils/types.ts';
import { LogsOptions } from '../../base.service.ts';
import { CrudResourceService } from '../../crud.service.ts';
import { ProviderStore } from '../../store.ts';
import { DockerCredentials } from '../credentials.ts';
import { DockerDeploymentService } from './deployment.ts';
import { DockerVolumeService } from './volume.ts';

export class DockerDatabaseService extends CrudResourceService<'database', DockerCredentials> {
  volumeService: DockerVolumeService;
  deploymentService: DockerDeploymentService;

  public constructor(accountName: string, credentials: DockerCredentials, providerStore: ProviderStore) {
    super(accountName, credentials, providerStore);
    this.volumeService = new DockerVolumeService(accountName, credentials, providerStore);
    this.deploymentService = new DockerDeploymentService(accountName, credentials, providerStore);
  }

  private async createPostgresDb(
    subscriber: Subscriber<string>,
    inputs: ResourceInputs['database'],
  ): Promise<ResourceOutputs['database']> {
    const normalizedName = inputs.name.replaceAll('/', '--');

    const volumeRes = await this.volumeService.create(subscriber, {
      type: 'volume',
      name: normalizedName,
      account: this.accountName,
    });

    subscriber.next('Starting database server');

    const volume_mounts = [];
    if (inputs.databaseType === 'postgres' && volumeRes.id) {
      volume_mounts.push({
        volume: volumeRes.id,
        mount_path: '/var/lib/postgresql',
        readonly: false,
      });
    }

    const { id } = await this.deploymentService.create(subscriber, {
      type: 'deployment',
      account: this.accountName,
      name: normalizedName,
      image: `${inputs.databaseType}:${inputs.databaseVersion}`,
      volume_mounts,
      environment: {
        POSTGRES_USER: 'architect',
        POSTGRES_PASSWORD: 'architect',
        POSTGRES_DB: 'architect',
      },
      labels: {
        'io.architect': 'arcctl',
        'io.architect.arcctl.database': inputs.name,
        'io.architect.arcctl.volume': volumeRes.id,
        'io.architect.arcctl.databaseType': inputs.databaseType,
        'io.architect.arcctl.databaseVersion': inputs.databaseVersion,
      },
      exposed_ports: [{
        target_port: 5432,
      }],
    });

    const inspectionRes = await this.deploymentService.inspect(id);
    if (!inspectionRes) {
      throw new Error(`Database failed to start`);
    }

    const hostPort = inspectionRes.NetworkSettings.Ports?.['5432/tcp']?.[0].HostPort;
    if (!hostPort) {
      throw new Error('Failed to allocate a port to listen on');
    }

    return {
      id: inputs.name,
      host: 'host.docker.internal',
      port: Number(hostPort),
      username: 'architect',
      password: 'architect',
      protocol: 'postgresql',
    };
  }

  private async createRedisDb(
    subscriber: Subscriber<string>,
    inputs: ResourceInputs['database'],
  ): Promise<ResourceOutputs['database']> {
    const normalizedName = inputs.name.replaceAll('/', '--');

    const { id } = await this.deploymentService.create(subscriber, {
      type: 'deployment',
      account: this.accountName,
      name: normalizedName,
      image: `${inputs.databaseType}:${inputs.databaseVersion}`,
      volume_mounts: [],
      environment: {
        REDIS_PASSWORD: 'architect',
      },
      labels: {
        'io.architect': 'arcctl',
        'io.architect.arcctl.database': inputs.name,
        'io.architect.arcctl.databaseType': inputs.databaseType,
        'io.architect.arcctl.databaseVersion': inputs.databaseVersion,
      },
      exposed_ports: [{
        target_port: 6379,
      }],
    });

    const inspectionRes = await this.deploymentService.inspect(id);
    if (!inspectionRes) {
      throw new Error(`Database failed to start`);
    }

    const hostPort = inspectionRes.NetworkSettings.Ports?.['6379/tcp']?.[0].HostPort;
    if (!hostPort) {
      throw new Error('Failed to allocate a port to listen on');
    }

    return {
      id: inputs.name,
      host: 'host.docker.internal',
      port: Number(hostPort),
      username: '',
      password: 'architect',
      protocol: 'redis',
    };
  }

  async get(id: string): Promise<ResourceOutputs['database'] | undefined> {
    const listRes = await this.list();
    return listRes.rows.find((row) => row.id === id);
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['database']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['database']>> {
    const res = await this.deploymentService.list({
      labels: {
        'io.architect': 'arcctl',
        'io.architect.arcctl.database': '',
      },
    });

    return {
      total: res.total,
      rows: res.rows.map((row) => ({
        id: row.labels?.['io.architect.arcctl.database'] || 'unknown',
        host: 'localhost',
        port: 5432,
        username: 'architect',
        password: 'architect',
        protocol: 'postgresql',
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

    return child.stdout;
  }

  async create(
    subscriber: Subscriber<string>,
    inputs: ResourceInputs['database'],
  ): Promise<ResourceOutputs['database']> {
    if (inputs.databaseType === 'postgres') {
      return this.createPostgresDb(subscriber, inputs);
    } else if (inputs.databaseType === 'redis') {
      return this.createRedisDb(subscriber, inputs);
    }

    throw new Error(`Unsupported database type: ${inputs.databaseType}`);
  }

  async update(
    subscriber: Subscriber<string>,
    id: string,
    inputs: DeepPartial<ResourceInputs['database']>,
  ): Promise<ResourceOutputs['database']> {
    const deployments = await this.deploymentService.list({
      id,
      labels: {
        'io.architect': 'arcctl',
        'io.architect.arcctl.database': id,
      },
    });
    const existingDeployment = deployments.rows.find((db) => db.id === id);
    if (!existingDeployment) {
      throw new Error(`No databases matching ID: ${id}`);
    }

    const databaseType = inputs.databaseType || existingDeployment.labels?.['io.architect.arcctl.databaseType'];
    switch (databaseType) {
      case 'postgres': {
        return this.createPostgresDb(subscriber, {
          type: 'database',
          name: inputs.name || existingDeployment.labels?.['io.architect.arcctl.database'] || 'unknown',
          databaseType,
          databaseVersion: inputs.databaseVersion ||
            existingDeployment.labels?.['io.architect.arcctl.databaseVersion'] || 'unknown',
          databaseSize: inputs.databaseSize || 'unknown',
          region: inputs.region || 'unknown',
          vpc: inputs.vpc || 'unknown',
          account: this.accountName,
          description: inputs.description,
        });
      }
      case 'redis': {
        return this.createRedisDb(subscriber, {
          type: 'database',
          name: inputs.name || existingDeployment.labels?.['io.architect.arcctl.database'] || 'unknown',
          databaseType,
          databaseVersion: inputs.databaseVersion ||
            existingDeployment.labels?.['io.architect.arcctl.databaseVersion'] || 'unknown',
          databaseSize: inputs.databaseSize || 'unknown',
          region: inputs.region || 'unknown',
          vpc: inputs.vpc || 'unknown',
          account: this.accountName,
          description: inputs.description,
        });
      }
    }

    throw new Error(`Unsupported database type: ${inputs.databaseType}`);
  }

  async delete(subscriber: Subscriber<string>, id: string): Promise<void> {
    const res = await this.get(id);
    if (!res) {
      subscriber.next('Database not found. Skipping.');
      return Promise.resolve();
    }

    const deployment = await this.deploymentService.get(res.id);
    if (!deployment?.labels?.['io.architect.arcctl.volume']) {
      throw new Error(`Database is missing metadata needed to clean up its volume`);
    }

    const volumeId = deployment.labels['io.architect.arcctl.volume'];
    await this.deploymentService.delete(subscriber, res.id);
    subscriber.next('Cleaning up database volume');
    await this.volumeService.delete(subscriber, volumeId);
  }
}
