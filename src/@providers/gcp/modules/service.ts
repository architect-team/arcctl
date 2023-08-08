import { Construct } from 'constructs';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule, ResourceModuleOptions } from '../../module.ts';
import { ComputeBackendService } from '../.gen/providers/google/compute-backend-service/index.ts';
import { ComputeRegionNetworkEndpointGroup } from '../.gen/providers/google/compute-region-network-endpoint-group/index.ts';
import { GoogleCloudCredentials } from '../credentials.ts';
import GcpUtils from '../utils.ts';

export class GoogleCloudServiceModule extends ResourceModule<'service', GoogleCloudCredentials> {
  outputs: ResourceOutputs['service'];
  backend_service: ComputeBackendService;

  constructor(scope: Construct, options: ResourceModuleOptions<'service', GoogleCloudCredentials>) {
    super(scope, options);

    GcpUtils.configureProvider(this);

    const namespace = this.inputs?.namespace || 'ns';
    // Max length for resource names is ~60 characters
    const service_name = (namespace + '--' + this.inputs?.name.replaceAll('/', '-') || 'deleting').substring(0, 50);
    const service_port = this.inputs?.target_port || 80;
    const deployment_name = this.inputs?.target_deployment?.replaceAll('/', '-') || 'deleting';
    const function_name = `${namespace.substring(0, 20)}-${deployment_name.substring(0, 20)}-${service_port}`;

    let region = '';
    if (this.inputs?.labels?.region) {
      region = this.inputs?.labels?.region.split('-').slice(0, -1).join('-');
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
      host: function_name,
      port: service_port,
      url: '',
      username: '',
      password: '',
      account: this.inputs?.account || '',
      name: service_name,
      target_port: service_port,
    };
  }

  genImports(_resourceId: string): Promise<Record<string, string>> {
    return Promise.resolve({});
  }

  getDisplayNames(): Record<string, string> {
    return {};
  }
}
