import { Construct } from 'constructs';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule, ResourceModuleOptions } from '../../module.ts';
import { CloudRunV2Service } from '../.gen/providers/google/cloud-run-v2-service/index.ts';
import { ProjectService } from '../.gen/providers/google/project-service/index.ts';
import { GoogleCloudCredentials } from '../credentials.ts';

export class GoogleCloudDeploymentModule extends ResourceModule<
  'deployment',
  GoogleCloudCredentials
> {
  private deployment: CloudRunV2Service;
  outputs: ResourceOutputs['deployment'];

  constructor(scope: Construct, options: ResourceModuleOptions<'deployment', GoogleCloudCredentials>) {
    super(scope, options);

    const depends_on = this.inputs?.name
      ? [
        new ProjectService(this, 'cloud-run-service', {
          service: 'run.googleapis.com',
        }),
      ]
      : [];

    let region = 'deleting';
    if (this.inputs?.namespace) {
      region = this.inputs.namespace.split('-').slice(0, -1).join('-');
    }

    this.deployment = new CloudRunV2Service(this, 'deployment', {
      dependsOn: depends_on,
      name: this.inputs?.name || 'deleting',
      location: region,
      template: {
        containers: [{
          image: this.inputs?.image || 'deleting',
        }],
      },
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
