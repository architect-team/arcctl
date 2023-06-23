import k8s from '@kubernetes/client-node';
import { Construct } from 'constructs';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule, ResourceModuleOptions } from '../../module.ts';
import { Deployment } from '../.gen/providers/kubernetes/deployment/index.ts';
import { PersistentVolumeClaim } from '../.gen/providers/kubernetes/persistent-volume-claim/index.ts';
import { KubernetesCredentials } from '../credentials.ts';
import KubernetesUtils from '../utils.ts';

export class KubernetesDeploymentModule extends ResourceModule<'deployment', KubernetesCredentials> {
  private deployment: Deployment;
  private volumeClaims: Record<string, PersistentVolumeClaim>;
  outputs: ResourceOutputs['deployment'];

  constructor(scope: Construct, options: ResourceModuleOptions<'deployment', KubernetesCredentials>) {
    super(scope, options);

    const normalizedName = this.inputs?.name.replace(/\//g, '--') || 'unknown';

    this.volumeClaims = {};
    for (const volume_mount of this.inputs?.volume_mounts || []) {
      const name = `volume-${volume_mount.volume.split('-').pop()}`;
      this.volumeClaims[volume_mount.volume] = new PersistentVolumeClaim(this, `${name}-claim`, {
        metadata: {
          name: volume_mount.volume,
          namespace: this.inputs?.namespace,
        },
        waitUntilBound: false,
        spec: {
          accessModes: ['ReadWriteOnce'],
          resources: {
            requests: {
              storage: '500Mi',
            },
          },
        },
      });
    }

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
            initContainer: this.inputs?.volume_mounts?.map((volume) => {
              const [repo, tag] = (volume.remote_image || '').split(':');
              const repoParts = repo.split('/');
              repoParts.splice(1, 0, 'v2');
              const fullRepo = repoParts.join('/');

              const manifest_url = `${fullRepo}/manifests/${tag}`;
              return {
                name: `${normalizedName}-volume-${volume.volume.split('-').pop()}`,
                image: 'cydrive/volume:latest',
                env: [
                  {
                    name: 'MANIFEST_URL',
                    value: manifest_url,
                  },
                  {
                    name: 'OUTPUT_DIR',
                    value: volume.mount_path,
                  },
                ],
                volumeMount: [
                  {
                    name: volume.volume,
                    mountPath: volume.mount_path,
                  },
                ],
              };
            }),
            volume: this.inputs?.volume_mounts?.map((volume) => {
              return {
                name: volume.volume,
                persistentVolumeClaim: {
                  claimName: this.volumeClaims[volume.volume].metadata.name,
                },
              };
            }),
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
                volumeMount: (this.inputs?.volume_mounts || []).map((volume) => {
                  return {
                    name: volume.volume,
                    mountPath: volume.mount_path,
                  };
                }),
              },
              ...(this.inputs?.sidecars?.map((container, index) => ({
                name: `${normalizedName}-sidecar-${index}`,
                command: typeof container.command === 'string' ? container.command.split(' ') : container.command,
                image: container.image,
                env: Object.entries(container.environment || {}).map(([key, value]) => ({
                  name: key,
                  value: String(value),
                })),
                volumeMount: container.volume_mounts.map((volume) => ({
                  name: volume.volume,
                  mountPath: volume.mount_path,
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

  async genImports(resourceId: string): Promise<Record<string, string>> {
    const [namespace, name] = resourceId.split('/');
    const client = KubernetesUtils.getClient(this.credentials, k8s.CoreV1Api);
    const pods = await client.listNamespacedPod(namespace);
    const normalizedName = name.replace(/\//g, '--') || 'unknown';
    const currentPod = pods.body.items.find((pod) => pod.metadata?.labels?.['architect.io/name'] === normalizedName);
    const volumeIds: Record<string, string> = {};
    if (currentPod) {
      currentPod.spec?.volumes?.forEach((volume) => {
        volumeIds[this.getResourceRef(this.volumeClaims[volume.persistentVolumeClaim?.claimName || ''])] = volume.name;
      });
    }
    return Promise.resolve({
      ...volumeIds,
      [this.getResourceRef(this.deployment)]: resourceId,
    });
  }

  getDisplayNames(): Record<string, string> {
    return {
      [this.getResourceRef(this.deployment)]: 'Deployment',
    };
  }
}
