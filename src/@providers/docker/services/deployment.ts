import { Subscriber } from 'rxjs';
import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.ts';
import { exec } from '../../../utils/command.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { DeepPartial } from '../../../utils/types.ts';
import { CrudResourceService } from '../../crud.service.ts';
import { DockerCredentials } from '../credentials.ts';

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
  HostConfig: {
    PortBindings: {
      [key: string]: [{
        HostIp: string;
        HostPort: string;
      }];
    };
  };
  Image: string;
  ResolvConfPath: string;
  Name: string;
  Driver: string;
  Platform: string;
  Config: {
    Hostname: string;
    Domainname: string;
    Tty: boolean;
    Cmd: string[];
    Labels: Record<string, string>;
    Env: string[];
    ExposedPorts: {
      [key: string]: {};
    };
    Entrypoint: string[];
  };
  NetworkSettings: {
    Networks: {
      [key: string]: {
        Aliases: string[];
        NetworkID: string;
        EndpointID: string;
        Gateway: string;
        IPAddress: string;
      };
    };
  };
};

export class DockerDeploymentService extends CrudResourceService<'deployment', DockerCredentials> {
  private async inspect(id: string): Promise<DockerInspectionResults | undefined> {
    const { stdout } = await exec('docker', { args: ['inspect', id] });
    const rawContents: DockerInspectionResults[] = JSON.parse(stdout);
    return rawContents.length > 0 ? rawContents[0] : undefined;
  }

  async get(id: string): Promise<ResourceOutputs['deployment'] | undefined> {
    const res = await this.inspect(id);
    return res
      ? {
        id: res.Id,
        labels: res.Config.Labels,
      }
      : undefined;
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['deployment']> | undefined,
    _pagingOptions?: Partial<PagingOptions> | undefined,
  ): Promise<PagingResponse<ResourceOutputs['deployment']>> {
    const args = ['ps', '--format', 'json'];

    for (const [key, value] of Object.entries(filterOptions?.labels || {})) {
      args.push('--filter', `label=${key}=${value}`);
    }

    const { stdout } = await exec('docker', { args });
    const rows = stdout.includes('\n') ? stdout.split('\n').filter((row) => Boolean(row)) : [stdout];
    const rawOutput: DockerPsItem[] = JSON.parse(`[${rows.join(',')}]`);

    const inspectedResults = await Promise.all(rawOutput.map(async (row) => {
      const res = await this.get(row.Names);
      return res!;
    }));

    return {
      total: inspectedResults.length,
      rows: inspectedResults,
    };
  }

  async create(
    _subscriber: Subscriber<string>,
    inputs: ResourceInputs['deployment'],
  ): Promise<ResourceOutputs['deployment']> {
    const containerName = inputs.name.replaceAll('/', '--');
    const args = ['run', '--detach', '--quiet', '--name', containerName];
    if (inputs.namespace) {
      args.push('--network', inputs.namespace);
    }

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
      args.push('-p', `${port.port}:${port.target_port}`);
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
      throw new Error(stderr || 'Deployment failed');
    }

    return {
      id: stdout.replace(/^\s+|\s+$/g, ''),
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

    const { code: stopCode, stderr: stopStderr } = await exec('docker', { args: ['stop', id] });
    if (stopCode !== 0) {
      throw new Error(stopStderr);
    }

    const { code: rmCode, stderr: rmStderr } = await exec('docker', { args: ['rm', id] });
    if (rmCode !== 0) {
      throw new Error(rmStderr);
    }

    const containerName = inputs.name?.replaceAll('/', '--') || inspection.Name;
    const args: string[] = ['run', '--detach', '--name', containerName];

    const existingNetwork = Object.keys(inspection.NetworkSettings.Networks)[0];
    args.push('--network', inputs.namespace || existingNetwork);

    const existingEnv: Record<string, string> = {};
    for (const item of inspection.Config.Env || []) {
      const [key, value] = item.split('=');
      existingEnv[key] = value;
    }

    if (inputs.platform) {
      args.push('--platform', inputs.platform);
    }

    for (const [key, value] of Object.entries(inputs.environment || existingEnv)) {
      args.push('--env', `${key}=${String(value)}`);
    }

    const entrypoint = inputs.entrypoint || inspection.Config.Entrypoint;
    if (entrypoint) {
      args.push(
        '--entrypoint',
        typeof entrypoint === 'string' ? `${entrypoint}` : `${entrypoint.join(' ')}`,
      );
    }

    const ports = inputs.exposed_ports || [];
    if (!inputs.exposed_ports) {
      Object.keys(inspection.HostConfig.PortBindings).forEach((existingPort) => {
        const [targetPort] = existingPort.split('/');
        const hostPort = inspection.HostConfig.PortBindings[existingPort][0].HostPort;
        ports.push({
          port: Number(hostPort),
          target_port: Number(targetPort),
        });
      });
    }

    for (const port of ports) {
      args.push('-p', `${port!.port}:${port!.target_port}`);
    }

    const labels = (inputs.labels || inspection.Config.Labels || {}) as Record<string, string>;
    for (const [key, value] of Object.entries(labels)) {
      args.push('--label', `${key}=${value}`);
    }

    args.push(inputs.image || inspection.Image);

    const command = (inputs.command || inspection.Config.Cmd) as string | string[];
    if (command) {
      args.push(...(typeof command === 'string' ? [command] : command));
    }

    const { code, stdout, stderr } = await exec('docker', { args });
    if (code !== 0) {
      throw new Error(stderr || 'Deployment failed');
    }

    return {
      id: stdout.replace(/^\s+|\s+$/g, ''),
      labels,
    };
  }

  async delete(_subscriber: Subscriber<string>, id: string): Promise<void> {
    const { code, stderr } = await exec('docker', { args: ['stop', id] });
    if (code !== 0) {
      throw new Error(stderr || 'Failed to stop deployment');
    }

    const { code: rmCode, stderr: rmStderr } = await exec('docker', { args: ['rm', id] });
    if (rmCode !== 0) {
      throw new Error(rmStderr || 'Failed to remove deployment');
    }
  }
}
