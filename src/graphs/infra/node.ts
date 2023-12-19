import * as crypto from 'https://deno.land/std@0.177.0/node/crypto.ts';
import { Observable } from 'rxjs';
import * as path from 'std/path/mod.ts';
import { Logger } from 'winston';
import { DatacenterModule } from '../../modules/index.ts';
import { exec } from '../../utils/command.ts';
import { getImageLabels } from '../../utils/docker.ts';
import { GraphNode, GraphNodeOptions } from '../node.ts';

export type NodeAction = 'no-op' | 'create' | 'update' | 'delete';

export type NodeColor = 'blue' | 'green';

export type NodeStatus = {
  state: NodeStatusState;
  message?: string;
  startTime?: number;
  endTime?: number;
  lastUpdated?: number;
};

export type NodeStatusState = 'pending' | 'starting' | 'applying' | 'destroying' | 'complete' | 'unknown' | 'error';

export type InfraGraphNodeOptions = GraphNodeOptions<Record<string, unknown> | string> & {
  action?: NodeAction;
  image: string;
  appNodeId?: string;
  component?: string;
  environment?: string;
  color?: NodeColor;
  status?: NodeStatus;
  outputs?: Record<string, unknown>;
  state?: any;
  volumes?: {
    mount_path: string;
    host_path: string;
  }[];
  environment_vars?: Record<string, string>;
  ttl?: number;
};

function replaceSeparators(value: string): string {
  // Note: The seperator here must be a valid javascript identifier
  // because this ID gets passed through the AST parser to be replaced
  // by the appropriate value.
  return value.replaceAll('/', '__').replaceAll('-', '__');
}

export class InfraGraphNode extends GraphNode<Record<string, unknown> | string> {
  action: NodeAction;
  color: NodeColor;
  status: NodeStatus;
  image: string;
  appNodeId?: string;
  component?: string;
  environment?: string;
  outputs?: Record<string, unknown>;
  state?: any;
  volumes?: {
    mount_path: string;
    host_path: string;
  }[];
  environment_vars?: Record<string, string>;
  ttl?: number;

  constructor(options: InfraGraphNodeOptions) {
    super(options);
    this.action = options.action || 'create';
    this.color = options.color || 'blue';
    this.component = options.component;
    this.appNodeId = options.appNodeId;
    this.environment = options.environment;
    this.outputs = options.outputs;
    this.state = options.state;
    this.image = options.image;
    this.status = options.status || { state: 'pending' };
    this.volumes = options.volumes;
    this.environment_vars = options.environment_vars;
    this.ttl = options.ttl;
  }

  public async getHash(): Promise<string> {
    // NOTE: This uses .RootFS as the string to compare because the ID field is not a reliable hash

    // Try to find the image locally first
    const dockerImages = new Deno.Command('docker', {
      args: ['image', 'inspect', '--format', '{{.RootFS}}', this.image],
    });
    const { code: firstCode, stdout: firstStdout } = await dockerImages.output();

    // This can happen if the image doesn't exist locally. We'll try to pull it.
    let dockerImageId: string | undefined;
    if (firstCode !== 0) {
      const dockerPull = new Deno.Command('docker', {
        args: ['pull', this.image],
      });
      await dockerPull.output();

      // Check if the pull was successful and get the ID
      const dockerImages2 = new Deno.Command('docker', {
        args: ['images', '--no-trunc', '--format', '{{.RootFS}}', this.image],
      });
      const { code, stdout, stderr } = await dockerImages2.output();
      if (code !== 0) {
        throw new Error(new TextDecoder().decode(stderr));
      }

      dockerImageId = new TextDecoder().decode(stdout);
    } else {
      dockerImageId = new TextDecoder().decode(firstStdout);
    }

    return crypto
      .createHash('sha256')
      .update(JSON.stringify({
        image: dockerImageId,
        inputs: this.inputs,
        volumes: this.volumes,
        environment_vars: this.environment_vars,
      }))
      .digest('hex')
      .toString();
  }

  public getId(): string {
    const parts = [replaceSeparators(this.name), this.color];
    if (this.appNodeId) {
      parts.unshift(replaceSeparators(this.appNodeId));
    }
    return parts.join('__');
  }

  public equals(node: InfraGraphNode): boolean {
    return this.name === node.name &&
      this.color === node.color &&
      this.appNodeId === node.appNodeId &&
      this.component === node.component &&
      this.environment === node.environment &&
      JSON.stringify(this.inputs) === JSON.stringify(node.inputs);
  }

  public isTTLExpired(previousCompleteNode: InfraGraphNode): boolean {
    // If TTL is not set, it is never expired.
    if (!this.ttl) {
      return false;
    }

    const expirationThreshold = Date.now() - (this.ttl * 1000);
    return Boolean(
      previousCompleteNode.status.lastUpdated && previousCompleteNode.status.lastUpdated < expirationThreshold,
    );
  }

  public apply(options?: { cwd?: string; logger?: Logger }): Observable<InfraGraphNode> {
    if (this.status.state !== 'pending') {
      throw new Error(`Cannot apply node ${this.getId()} in state: ${this.status.state}`);
    }

    return new Observable((subscriber) => {
      this.status.state = this.action === 'delete' ? 'destroying' : 'applying';
      this.status.startTime = Date.now();

      // Escape hatch for no-op nodes
      if (this.action === 'no-op') {
        this.status.state = 'complete';
        this.status.endTime = Date.now();
        subscriber.complete();
        return;
      }

      getImageLabels(this.image).then(async (labels) => {
        const commands = DatacenterModule.fromLabels(labels);

        // Values will be joined with && to be run inside the docker image
        const command_array: string[] = [];

        // Initialize the state file
        const tmpDir = await Deno.makeTempDir({ prefix: this.getId() + '_' });
        const stateFile = path.join(tmpDir, 'state.json');
        const outputFile = path.join(tmpDir, 'output.json');
        await Deno.writeTextFile(stateFile, this.state);
        await Deno.writeTextFile(outputFile, '{}');

        // Run init
        if (commands.init) {
          command_array.push(commands.init.join(' '));
        }

        // Run import if necessary
        if (commands.import && this.state) {
          command_array.push(commands.import.join(' '));
        }

        if (this.action === 'delete') {
          command_array.push(commands.destroy.join(' '));
        } else if (this.action === 'create' || this.action === 'update') {
          command_array.push(
            commands.apply.join(' '),
            commands.outputs.join(' '),
          );

          if (commands.export) {
            command_array.push(commands.export.join(' '));
          }
        }

        const environment_vars = { ...(this.environment_vars ?? {}) };
        environment_vars.STATE_FILE = '/module/state.json';
        environment_vars.OUTPUT_FILE = '/module/output.json';
        environment_vars.INPUTS = JSON.stringify(this.inputs);

        const volume_mounts = [...(this.volumes ?? [])];
        volume_mounts.push({
          host_path: tmpDir,
          mount_path: '/module',
        });

        const flags = ['run'];
        Object.values(volume_mounts).forEach((value) => {
          flags.push('-v', `${value.host_path}:${value.mount_path}`);
        });
        Object.entries(environment_vars).forEach(([key, value]) => {
          flags.push('-e', `${key}=${value}`);
        });

        const args = [
          ...flags,
          this.image,
          'sh',
          '-c',
          command_array.join(' && '),
        ];

        const { code, stdout, stderr } = await exec('docker', {
          args,
          logger: options?.logger,
        });

        if (code !== 0) {
          throw new Error(stderr);
        }

        const stateContents = await Deno.readTextFile(stateFile);
        const outputContents = await Deno.readTextFile(outputFile);

        this.state = stateContents;
        this.outputs = JSON.parse(outputContents);
        this.status.state = 'complete';
        this.status.endTime = Date.now();
        this.status.lastUpdated = Date.now();
        subscriber.next(this);
        subscriber.complete();
      })
        .catch((err) => {
          console.error(err);
          this.status.state = 'error';
          this.status.message = err.message;
          this.status.endTime = Date.now();
          this.status.lastUpdated = Date.now();
          subscriber.next(this);
          subscriber.error(err);
        });
    });
  }
}
