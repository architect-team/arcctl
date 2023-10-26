import * as crypto from 'https://deno.land/std@0.177.0/node/crypto.ts';
import { Observable } from 'rxjs';
import { Logger } from 'winston';
import { ModuleServer, Plugin } from '../../datacenter-modules/index.ts';
import { GraphNode, GraphNodeOptions } from '../node.ts';

export type NodeAction = 'no-op' | 'create' | 'update' | 'delete';

export type NodeColor = 'blue' | 'green';

export type NodeStatus = {
  state: NodeStatusState;
  message?: string;
  startTime?: number;
  endTime?: number;
};

export type NodeStatusState = 'pending' | 'starting' | 'applying' | 'destroying' | 'complete' | 'unknown' | 'error';

export type InfraGraphNodeOptions<P extends Plugin> = GraphNodeOptions<Record<string, unknown> | string> & {
  plugin: P;
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
};

export class InfraGraphNode<P extends Plugin = Plugin> extends GraphNode<Record<string, unknown> | string> {
  plugin: P;
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

  constructor(options: InfraGraphNodeOptions<P>) {
    super(options);
    this.plugin = options.plugin;
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
  }

  public async getHash(): Promise<string> {
    // Try to find the image locally first
    const dockerImages = new Deno.Command('docker', {
      args: ['images', '--no-trunc', '--format', '{{.ID}}', this.image],
    });
    let { stdout: dockerImageId } = await dockerImages.output();

    // This can happen if the image doesn't exist locally. We'll try to pull it.
    if (!dockerImageId) {
      const dockerPull = new Deno.Command('docker', {
        args: ['pull', this.image],
      });
      await dockerPull.output();

      // Check if the pull was successful and get the ID
      const dockerImages2 = new Deno.Command('docker', {
        args: ['images', '--no-trunc', '--format', '{{.ID}}', this.image],
      });
      const { stdout } = await dockerImages2.output();
      if (!stdout) {
        throw new Error(`Could not find image ${this.image}`);
      }

      dockerImageId = stdout;
    }

    return crypto
      .createHash('sha256')
      .update(JSON.stringify({
        plugin: this.plugin,
        image: dockerImageId,
        inputs: this.inputs,
        volumes: this.volumes,
        environment_vars: this.environment_vars,
      }))
      .digest('hex')
      .toString();
  }

  public getId(): string {
    const parts = [this.name, this.color];
    // Note: The seperator here must be a valid javascript identifier
    // because this ID gets passed through the AST parser to be replaced
    // by the appropriate value.
    if (this.appNodeId) {
      parts.unshift(this.appNodeId.replaceAll('/', '__'));
    }
    return parts.join('__');
  }

  public equals(node: InfraGraphNode<P>): boolean {
    return this.name === node.name &&
      this.plugin === node.plugin &&
      this.color === node.color &&
      this.appNodeId === node.appNodeId &&
      this.component === node.component &&
      this.environment === node.environment &&
      JSON.stringify(this.inputs) === JSON.stringify(node.inputs);
  }

  public apply(options?: { cwd?: string; logger?: Logger }): Observable<InfraGraphNode<P>> {
    if (this.status.state !== 'pending') {
      throw new Error(`Cannot apply node in state, ${this.status.state}`);
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

      const server = new ModuleServer(this.plugin);
      server.start().then(async (client) => {
        try {
          if (typeof this.inputs !== 'object') {
            throw new Error(`Cannot apply node with inputs of type ${typeof this.inputs}`);
          }

          const res = await client.apply({
            datacenterid: 'datacenter',
            inputs: this.inputs,
            environment: this.environment_vars,
            volumes: this.volumes,
            image: this.image,
            state: this.state,
            destroy: this.action === 'delete',
          }, { logger: options?.logger });

          this.state = this.action === 'delete' ? undefined : res.state;
          this.outputs = res.outputs || {};
          this.status.state = 'complete';
          this.status.endTime = Date.now();
          client.close();
          subscriber.next(this);
          await server.stop();
          subscriber.complete();
        } catch (err) {
          this.status.state = 'error';
          this.status.message = err.message;
          this.status.endTime = Date.now();
          client.close();
          subscriber.next(this);
          await server.stop();
          subscriber.error(err);
        }
      });
    });
  }
}
