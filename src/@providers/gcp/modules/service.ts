import { Construct } from 'constructs';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule, ResourceModuleOptions } from '../../module.ts';
import { GoogleCloudCredentials } from '../credentials.ts';

// TODO: This is currently a no-op, the work is being done in the ingressRule
export class GoogleCloudServiceModule extends ResourceModule<'service', GoogleCloudCredentials> {
  outputs: ResourceOutputs['service'];

  constructor(scope: Construct, options: ResourceModuleOptions<'service', GoogleCloudCredentials>) {
    super(scope, options);

    this.outputs = {
      id: '',
      protocol: '',
      host: '',
      port: 80,
      url: '',
      username: '',
      password: '',
    };
  }

  genImports(_resourceId: string): Promise<Record<string, string>> {
    return Promise.resolve({});
  }

  getDisplayNames(): Record<string, string> {
    return {};
  }
}
