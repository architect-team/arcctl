import * as crypto from 'https://deno.land/std@0.177.0/node/crypto.ts';
import { Observable } from 'rxjs';
import { Logger } from 'winston';
import { GraphNode, GraphNodeOptions } from '../node.ts';
import { ModuleServer } from './modules/server.ts';
import { Plugin } from './types.ts';

type NodeAction = 'no-op' | 'create' | 'update' | 'delete';

type NodeColor = 'blue' | 'green';

type NodeStatus = {
  state: 'pending' | 'starting' | 'applying' | 'destroying' | 'complete' | 'unknown' | 'error';
  message?: string;
  startTime?: number;
  endTime?: number;
};

export type InfraGraphNodeOptions<P extends Plugin> = GraphNodeOptions<Record<string, unknown>> & {
  plugin: P;
  action?: NodeAction;
  image: string;
  color?: NodeColor;
  status?: NodeStatus;
  outputs?: Record<string, unknown>;
  state?: any;
};

export class InfraGraphNode<P extends Plugin = Plugin> extends GraphNode<Record<string, unknown>> {
  plugin: P;
  action: NodeAction;
  color: NodeColor;
  status: NodeStatus;
  image: string;
  outputs?: Record<string, unknown>;
  state?: any;

  constructor(options: InfraGraphNodeOptions<P>) {
    super(options);
    this.plugin = options.plugin;
    this.action = options.action || 'create';
    this.color = options.color || 'blue';
    this.outputs = options.outputs;
    this.state = options.state;
    this.image = options.image;
    this.status = options.status || { state: 'pending' };
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
      }))
      .digest('hex')
      .toString();
  }

  public getId(): string {
    return GraphNode.genResourceId({
      name: this.name,
      component: this.component,
      environment: this.environment,
    }) + '-' + this.color;
  }

  public equals(node: InfraGraphNode<P>): boolean {
    return this.name === node.name && this.plugin === node.plugin &&
      this.color === node.color && this.component === node.component &&
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
          const res = await client.apply({
            datacenterid: 'datacenter',
            inputs: Object.entries(this.inputs) as [string, string][],
            image: this.image,
            state: this.state,
            destroy: this.action === 'delete',
          }, { logger: options?.logger });

          this.state = this.action === 'delete' ? undefined : res.state;
          this.outputs = res.outputs || {};
          this.status.state = 'complete';
          this.status.endTime = Date.now();
          subscriber.next(this);
          await server.stop();
          subscriber.complete();
        } catch (err) {
          this.status.state = 'error';
          this.status.message = err.message;
          this.status.endTime = Date.now();
          subscriber.next(this);
          await server.stop();
          subscriber.error(err);
        }
      });
    });
  }
}
