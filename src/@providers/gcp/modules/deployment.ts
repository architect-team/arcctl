import { Construct } from 'constructs';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule, ResourceModuleOptions } from '../../module.ts';
import { CloudRunV2ServiceIamBinding } from '../.gen/providers/google/cloud-run-v2-service-iam-binding/index.ts';
import { CloudRunV2Service } from '../.gen/providers/google/cloud-run-v2-service/index.ts';
import { ProjectService } from '../.gen/providers/google/project-service/index.ts';
import { GoogleCloudCredentials } from '../credentials.ts';
import GcpUtils from '../utils.ts';

export class GoogleCloudDeploymentModule extends ResourceModule<
  'deployment',
  GoogleCloudCredentials
> {
  private deployments: CloudRunV2Service[];
  outputs: ResourceOutputs['deployment'];

  constructor(scope: Construct, options: ResourceModuleOptions<'deployment', GoogleCloudCredentials>) {
    super(scope, options);

    GcpUtils.configureProvider(this);

    const depends_on = this.inputs?.name
      ? [
        new ProjectService(this, 'cloud-run-service', {
          service: 'run.googleapis.com',
          disableOnDestroy: false,
        }),
        new ProjectService(this, 'iam-service', {
          service: 'iam.googleapis.com',
          disableOnDestroy: false,
        }),
      ]
      : [];

    let region = 'deleting';
    if (this.inputs?.labels?.region) {
      region = this.inputs.labels?.region.split('-').slice(0, -1).join('-');
    }

    const vpc_name = this.inputs?.labels?.vpc || 'deleting';
    const namespace = this.inputs?.namespace || 'ns';
    const name = this.inputs?.name.replaceAll('/', '-') || 'deleting';

    this.deployments = [];
    const labels: Record<string, string> = {};

    for (const service of this.inputs?.services || []) {
      const deployment_name = `${namespace.substring(0, 20)}-${name.substring(0, 20)}`;
      const service_port = Number(service.port || 80);
      const resource_name = `${deployment_name}-${service_port}`;

      const deployment = new CloudRunV2Service(this, `${resource_name}-deployment`, {
        dependsOn: depends_on,
        name: resource_name,
        location: region,
        ingress: 'INGRESS_TRAFFIC_ALL',
        template: {
          vpcAccess: {
            connector: `projects/${this.credentials.project}/locations/${region}/connectors/${
              vpc_name.substring(0, 15)
            }-connector`,
            egress: 'PRIVATE_RANGES_ONLY',
          },
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
            ports: [{ containerPort: service_port }],
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

      new CloudRunV2ServiceIamBinding(this, `${resource_name}-service-binding`, {
        project: deployment.project,
        location: deployment.location,
        name: resource_name,
        role: 'roles/run.invoker',
        members: [
          'allUsers',
        ],
      });

      labels[deployment.name] = deployment.uri;
      this.deployments.push(deployment);
    }

    this.outputs = {
      id: this.deployments.at(0)?.uid || '',
      labels,
    };
  }

  async genImports(resourceId: string): Promise<Record<string, string>> {
    const imports: Record<string, string> = {};
    for (const deployment of this.deployments) {
      imports[this.getResourceRef(deployment)] = deployment.id;
    }
    return imports;
  }

  getDisplayNames(): Record<string, string> {
    const display_names: Record<string, string> = {};
    for (const deployment of this.deployments) {
      display_names[this.getResourceRef(deployment)] = 'Cloud Run Function';
    }
    return display_names;
  }
}