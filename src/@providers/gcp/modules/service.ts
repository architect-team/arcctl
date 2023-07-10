import { Construct } from 'constructs';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule, ResourceModuleOptions } from '../../module.ts';
import { ComputeBackendService } from '../.gen/providers/google/compute-backend-service/index.ts';
import { ComputeRegionNetworkEndpointGroup } from '../.gen/providers/google/compute-region-network-endpoint-group/index.ts';
import { GoogleCloudCredentials } from '../credentials.ts';

export class GoogleCloudServiceModule extends ResourceModule<'service', GoogleCloudCredentials> {
  outputs: ResourceOutputs['service'];
  backend_service: ComputeBackendService;

  constructor(scope: Construct, options: ResourceModuleOptions<'service', GoogleCloudCredentials>) {
    super(scope, options);

    const service_name = this.inputs?.name.replaceAll('/', '--') || 'deleting';
    const function_name = (this.inputs?.target_deployment.replaceAll('/', '--') || 'deleting') +
      `--${this.inputs?.target_port}`;

    let region = '';
    if (this.inputs?.namespace) {
      region = this.inputs.namespace.split('-').slice(0, -1).join('-');
    }

    const serverless_neg = new ComputeRegionNetworkEndpointGroup(this, 'serverless-neg', {
      name: `${service_name}--neg`,
      networkEndpointType: 'SERVERLESS',
      region,
      cloudRun: {
        service: function_name,
      },
    });

    this.backend_service = new ComputeBackendService(this, 'backend-neg', {
      name: `${service_name}--backend`,
      backend: [{
        group: serverless_neg.id,
      }],
      loadBalancingScheme: 'EXTERNAL_MANAGED',
      localityLbPolicy: 'ROUND_ROBIN',
    });

    this.outputs = {
      id: this.backend_service.id,
      protocol: this.backend_service.protocol,
      host: '',
      port: 80,
      url: '',
      username: '',
      password: '',
      account: this.inputs?.account || '',
    };
  }

  genImports(_resourceId: string): Promise<Record<string, string>> {
    return Promise.resolve({});
  }

  getDisplayNames(): Record<string, string> {
    return {};
  }
}
