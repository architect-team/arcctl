import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule } from '../../module.ts';
import { Deployment } from '../.gen/providers/kubernetes/deployment/index.ts';
import { KubernetesCredentials } from '../credentials.ts';
import { Construct } from 'npm:constructs';

export class KubernetesDeploymentModule extends ResourceModule<
  'deployment',
  KubernetesCredentials
> {
  private deployment: Deployment;
  outputs: ResourceOutputs['deployment'];

  constructor(
    scope: Construct,
    id: string,
    inputs: ResourceInputs['deployment'],
  ) {
    super(scope, id, inputs);

    const normalizedName = inputs.name.replace(/\//g, '--');

    this.deployment = new Deployment(this, inputs.name, {
      metadata: {
        name: normalizedName,
        namespace: inputs.namespace,
        labels: inputs.labels,
      },
      spec: {
        replicas: String(inputs.replicas),
        selector: {
          matchLabels: {
            'architect.io/name': normalizedName,
          },
        },
        template: {
          metadata: {
            name: inputs.name.replace(/\//g, '.'),
            namespace: inputs.namespace,
            labels: {
              'architect.io/name': normalizedName,
              ...inputs.labels,
            },
          },
          spec: {
            container: [
              {
                name: normalizedName,
                image: inputs.image,
                command:
                  typeof inputs.command === 'string'
                    ? inputs.command.split(' ')
                    : inputs.command,
                env: Object.entries(inputs.environment || {}).map(
                  ([key, value]) => ({
                    name: key,
                    value: String(value),
                  }),
                ),
                volumeMount: inputs.volume_mounts?.map((mount) => ({
                  name: mount.volume,
                  mountPath: mount.mount_path,
                })),
                resources: {
                  requests: {
                    ...(inputs.cpu ? { cpu: String(inputs.cpu) } : {}),
                    ...(inputs.memory ? { memory: inputs.memory } : {}),
                  },
                  limits: {
                    ...(inputs.cpu ? { cpu: String(inputs.cpu) } : {}),
                    ...(inputs.memory ? { memory: inputs.memory } : {}),
                  },
                },
              },
              ...(inputs.sidecars?.map((container, index) => ({
                name: `${normalizedName}-sidecar-${index}`,
                command:
                  typeof container.command === 'string'
                    ? container.command.split(' ')
                    : container.command,
                image: container.image,
                env: Object.entries(container.environment || {}).map(
                  ([key, value]) => ({
                    name: key,
                    value: String(value),
                  }),
                ),
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
      id: `${inputs.namespace}/${inputs.name}`,
    };
  }

  async genImports(
    credentials: KubernetesCredentials,
    resourceId: string,
  ): Promise<Record<string, string>> {
    return {
      [this.getResourceRef(this.deployment)]: resourceId,
    };
  }

  getDisplayNames(): Record<string, string> {
    return {
      [this.getResourceRef(this.deployment)]: 'Deployment',
    };
  }
}
