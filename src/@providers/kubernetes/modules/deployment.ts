import { Construct } from 'constructs';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule, ResourceModuleOptions } from '../../module.ts';
import { Deployment } from '../.gen/providers/kubernetes/deployment/index.ts';
import { KubernetesCredentials } from '../credentials.ts';

export class KubernetesDeploymentModule extends ResourceModule<'deployment', KubernetesCredentials> {
  private deployment: Deployment;
  outputs: ResourceOutputs['deployment'];

  constructor(scope: Construct, options: ResourceModuleOptions<'deployment', KubernetesCredentials>) {
    super(scope, options);

    const normalizedName = this.inputs?.name.replace(/\//g, '--') || 'unknown';

    this.deployment = new Deployment(this, 'deployment', {
      metadata: {
        name: normalizedName,
        namespace: this.inputs?.namespace,
        labels: this.inputs?.labels,
      },
      spec: {
        replicas: String(this.inputs?.replicas || 1),
        selector: {
          matchLabels: {
            'architect.io/name': normalizedName,
          },
        },
        template: {
          metadata: {
            name: normalizedName,
            namespace: this.inputs?.namespace,
            labels: {
              'architect.io/name': normalizedName,
              ...this.inputs?.labels,
            },
          },
          spec: {
            container: [
              {
                name: normalizedName,
                image: this.inputs?.image || 'unknown',
                command: typeof this.inputs?.command === 'string'
                  ? this.inputs.command.split(' ')
                  : this.inputs?.command,
                env: Object.entries(this.inputs?.environment || {}).map(([key, value]) => ({
                  name: key,
                  value: String(value),
                })),
                volumeMount: this.inputs?.volume_mounts?.map((mount) => ({
                  name: mount.volume,
                  mountPath: mount.mount_path,
                })),
                resources: {
                  requests: {
                    ...(this.inputs?.cpu ? { cpu: String(this.inputs.cpu) } : {}),
                    ...(this.inputs?.memory ? { memory: this.inputs.memory } : {}),
                  },
                  limits: {
                    ...(this.inputs?.cpu ? { cpu: String(this.inputs.cpu) } : {}),
                    ...(this.inputs?.memory ? { memory: this.inputs.memory } : {}),
                  },
                },
              },
              ...(this.inputs?.sidecars?.map((container, index) => ({
                name: `${normalizedName}-sidecar-${index}`,
                command: typeof container.command === 'string' ? container.command.split(' ') : container.command,
                image: container.image,
                env: Object.entries(container.environment || {}).map(([key, value]) => ({
                  name: key,
                  value: String(value),
                })),
                volumeMount: container.volume_mounts.map((mount) => ({
                  name: mount.volume,
                  mountPath: mount.mount_path,
                })),
                resources: {
                  requests: {
                    ...(container.cpu ? { cpu: String(container.cpu) } : {}),
                    ...(container.memory ? { memory: container.memory } : {}),
                  },
                  limits: {
                    ...(container.cpu ? { cpu: String(container.cpu) } : {}),
                    ...(container.memory ? { memory: container.memory } : {}),
                  },
                },
              })) || []),
            ],
          },
        },
      },
    });

    this.outputs = {
      id: `${this.inputs?.namespace}/${this.inputs?.name}`,
    };
  }

  genImports(resourceId: string): Promise<Record<string, string>> {
    return Promise.resolve({
      [this.getResourceRef(this.deployment)]: resourceId,
    });
  }

  getDisplayNames(): Record<string, string> {
    return {
      [this.getResourceRef(this.deployment)]: 'Deployment',
    };
  }
}
