import { Construct } from 'constructs';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule, ResourceModuleOptions } from '../../module.ts';
import { CloudRunV2Service } from '../.gen/providers/google/cloud-run-v2-service/index.ts';
import { ProjectService } from '../.gen/providers/google/project-service/index.ts';
import { GoogleCloudCredentials } from '../credentials.ts';

export class GoogleCloudFunctionModule extends ResourceModule<
  'function',
  GoogleCloudCredentials
> {
  private function: CloudRunV2Service;
  outputs: ResourceOutputs['function'];

  constructor(scope: Construct, options: ResourceModuleOptions<'function', GoogleCloudCredentials>) {
    super(scope, options);

    const depends_on = this.inputs?.name
      ? [
        new ProjectService(this, 'cloud-run-service', {
          service: 'run.googleapis.com',
        }),
      ]
      : [];

    let region = 'deleting';
    if (this.inputs?.region) {
      region = this.inputs.region.split('-').slice(0, -1).join('-');
    }

    this.function = new CloudRunV2Service(this, 'function', {
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
      id: this.function.uid,
      name: this.function.name,
    };
  }

  async genImports(resourceId: string): Promise<Record<string, string>> {
    return {
      [this.getResourceRef(this.function)]: resourceId,
    };
  }

  getDisplayNames(): Record<string, string> {
    return {
      [this.getResourceRef(this.function)]: 'Cloud Run Function',
    };
  }
}
