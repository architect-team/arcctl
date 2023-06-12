import { Subscriber } from 'rxjs';
import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { DeepPartial } from '../../../utils/types.ts';
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
        'arcctl.architect.io.type': 'database',
      },
    });

    return {
      total: res.total,
      rows: res.rows.map((row) => ({
        id: row.labels?.['arcctl.architect.io.name'] || 'unknown',
        host: 'localhost',
        port: 5432,
        username: 'architect',
        password: 'architect',
        protocol: 'postgresql',
      })),
    };
  }

  async create(
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

    await this.deploymentService.create(subscriber, {
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
        'arcctl.architect.io.type': 'database',
        'arcctl.architect.io.name': inputs.name,
        'arcctl.architect.io.volume': volumeRes.id,
        'arcctl.architect.io.databaseType': inputs.databaseType,
        'arcctl.architect.io.databaseVersion': inputs.databaseVersion,
      },
      exposed_ports: [{
        port: 5432,
        target_port: 5432,
      }],
    });

    return {
      id: inputs.name,
      host: '127.0.0.1',
      port: 5432,
      username: 'architect',
      password: 'architect',
      protocol: 'postgresql',
    };
  }

  async update(
    subscriber: Subscriber<string>,
    id: string,
    inputs: DeepPartial<ResourceInputs['database']>,
  ): Promise<ResourceOutputs['database']> {
    const allDbs = await this.deploymentService.list({
      id,
      labels: {
        'arcctl.architect.io.type': 'database',
      },
    });
    const existingDb = allDbs.rows.find((db) => db.id === id);
    if (!existingDb) {
      throw new Error(`No databases matching ID: ${id}`);
    }

    const normalizedName = inputs.name?.replaceAll('/', '--') || existingDb.id;

    const volumeId = existingDb.labels?.['arcctl.architect.io.volume'];
    const volume_mounts: ResourceInputs['deployment']['volume_mounts'] = [];
    if (volumeId) {
      subscriber.next('Updating storage volume');
      const volume = await this.volumeService.update(subscriber, volumeId, {
        type: 'volume',
        name: normalizedName,
        account: this.accountName,
      });

      switch (inputs.databaseType) {
        case 'postgres': {
          volume_mounts.push({
            volume: volume.id,
            mount_path: '/var/lib/postgresql',
            readonly: false,
          });
        }
      }
    }

    const deployment = await this.deploymentService.update(subscriber, existingDb.id, {
      type: 'deployment',
      account: this.accountName,
      name: normalizedName,
      ...(inputs.databaseType && inputs.databaseVersion
        ? { image: `${inputs.databaseType}:${inputs.databaseVersion}` }
        : {}),
      volume_mounts,
      environment: {
        POSTGRES_USER: 'architect',
        POSTGRES_PASSWORD: 'architect',
        POSTGRES_DB: 'architect',
      },
      labels: {
        'arcctl.architect.io.type': 'database',
        'arcctl.architect.io.name': inputs.name || existingDb.labels?.['arcctl.architect.io.name'],
        ...(volume_mounts.length > 0 ? { 'arcctl.architect.io.volume': volume_mounts[0].volume } : {}),
        'arcctl.architect.io.databaseType': inputs.databaseType ||
          existingDb.labels?.['arcctl.architect.io.databaseType'],
        'arcctl.architect.io.databaseVersion': inputs.databaseVersion ||
          existingDb.labels?.['arcctl.architect.io.databaseVersion'],
      },
      exposed_ports: [{
        port: 5432,
        target_port: 5432,
      }],
    });

    return {
      id: normalizedName,
      host: '127.0.0.1',
      port: 5432,
      username: 'architect',
      password: 'architect',
      protocol: 'postgresql',
    };
  }

  async delete(subscriber: Subscriber<string>, id: string): Promise<void> {
    const res = await this.get(id);
    if (!res) {
      throw new Error(`No database with ID: ${id}`);
    }

    switch (res.protocol) {
      case 'postgresql': {
        const deployment = await this.deploymentService.get(res.id);
        if (!deployment?.labels?.['arcctl.architect.io.volume']) {
          throw new Error(`Database is missing metadata needed to clean up its volume`);
        }

        const volumeId = deployment.labels['arcctl.architect.io.volume'];
        await this.deploymentService.delete(subscriber, res.id);
        subscriber.next('Cleaning up database volume');
        await this.volumeService.delete(subscriber, volumeId);
      }
    }

    new Error(`Unsupported database type: ${res.protocol}`);
  }
}
