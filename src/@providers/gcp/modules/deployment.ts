import { Construct } from 'constructs';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule, ResourceModuleOptions } from '../../module.ts';
import { CloudRunV2ServiceIamBinding } from '../.gen/providers/google/cloud-run-v2-service-iam-binding/index.ts';
import { CloudRunV2Service } from '../.gen/providers/google/cloud-run-v2-service/index.ts';
import { ProjectService } from '../.gen/providers/google/project-service/index.ts';
import { GoogleCloudCredentials } from '../credentials.ts';
export class GoogleCloudDeploymentModule extends ResourceModule<
  'deployment',
  GoogleCloudCredentials
> {
  private access_policy: CloudRunV2ServiceIamBinding;
  private deployment: CloudRunV2Service;
  outputs: ResourceOutputs['deployment'];

  constructor(scope: Construct, options: ResourceModuleOptions<'deployment', GoogleCloudCredentials>) {
    super(scope, options);

    const depends_on = this.inputs?.name
      ? [
        new ProjectService(this, 'cloud-run-service', {
          service: 'run.googleapis.com',
        }),
        new ProjectService(this, 'iam-service', {
          service: 'iam.googleapis.com',
        }),
      ]
      : [];

    let region = 'deleting';
    if (this.inputs?.namespace) {
      region = this.inputs.namespace.split('-').slice(0, -1).join('-');
    }

    this.deployment = new CloudRunV2Service(this, 'deployment', {
      dependsOn: depends_on,
      name: this.inputs?.name.replaceAll('/', '--') || 'deleting',
      location: region,

      ingress: 'INGRESS_TRAFFIC_ALL',
      template: {
        // TODO: If there are multiple exposed ports, need to create multiple containers and one port mapping each
        containers: [{
          image: this.inputs?.image || 'deleting',
          args: typeof this.inputs?.entrypoint === 'string'
            ? this.inputs.entrypoint.split(' ')
            : this.inputs?.entrypoint,
          command: typeof this.inputs?.command === 'string' ? this.inputs.command.split(' ') : this.inputs?.command,
          env: Object.entries(this.inputs?.environment || {}).map(([key, value]) => ({
            name: key,
            value: String(value),
          })),
          // TODO: service has this information currently,
          // but should be set up here i think
          ports: this.inputs?.exposed_ports
            ? this.inputs.exposed_ports.map((ports) => ({
              containerPort: ports.target_port,
            }))
            : [{ containerPort: 8080 }], // TODO(tyler): This is just for testing
          resources: {
            limits: {
              ...(this.inputs?.cpu ? { cpu: String(this.inputs.cpu) } : {}),
              ...(this.inputs?.memory ? { memory: this.inputs.memory } : {}),
            },
          },
          volumeMounts: (this.inputs?.volume_mounts || []).map((volume) => {
            return {
              name: volume.volume,
              mountPath: volume.mount_path,
            };
          }),
        }],
      },
    });

    this.access_policy = new CloudRunV2ServiceIamBinding(this, 'noauth-policy', {
      project: this.deployment.project,
      location: this.deployment.location,
      name: this.deployment.name,
      role: 'roles/run.invoker',
      members: [
        'allUsers',
      ],
    });

    this.outputs = {
      id: this.deployment.uid,
      labels: {
        'name': this.deployment.name,
        'uri': this.deployment.uri,
      },
    };
  }

  async genImports(resourceId: string): Promise<Record<string, string>> {
    return {
      [this.getResourceRef(this.deployment)]: resourceId,
    };
  }

  getDisplayNames(): Record<string, string> {
    return {
      [this.getResourceRef(this.deployment)]: 'Cloud Run Function',
    };
  }
}
