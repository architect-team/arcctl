import { Construct } from 'constructs';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule, ResourceModuleOptions } from '../../module.ts';
import { ComputeBackendService } from '../.gen/providers/google/compute-backend-service/index.ts';
import { ComputeFirewall } from '../.gen/providers/google/compute-firewall/index.ts';
import { ComputeRegionNetworkEndpointGroup } from '../.gen/providers/google/compute-region-network-endpoint-group/index.ts';
import { GoogleCloudCredentials } from '../credentials.ts';
import GcpUtils from '../utils.ts';

export class GoogleCloudServiceModule extends ResourceModule<'service', GoogleCloudCredentials> {
  outputs: ResourceOutputs['service'];
  backend: ComputeBackendService | ComputeFirewall;

  constructor(scope: Construct, options: ResourceModuleOptions<'service', GoogleCloudCredentials>) {
    super(scope, options);

    GcpUtils.configureProvider(this);

    const namespace = this.inputs?.namespace || 'ns';
    // Max length for resource names is ~60 characters
    const service_name = (namespace + '--' + this.inputs?.name.replaceAll('/', '-') || 'deleting').substring(0, 50);
    const service_port = this.inputs?.target_port || 80;
    const deployment_name = this.inputs?.target_deployment?.replaceAll('/', '-') || 'deleting';
    let protocol = this.inputs?.target_protocol;
    if (!protocol) {
      if (service_port === 80) {
        protocol = 'http';
      } else {
        protocol = 'https';
      }
    }

    let region = '';
    let zone = '';
    if (this.inputs?.labels?.region) {
      zone = this.inputs?.labels?.region;
      region = zone.split('-').slice(0, -1).join('-');
    }

    if (this.inputs?.strategy === 'gce') {
      // This deployment is a GCE instance, so we need to set firewall rules that allow routing to it
      const gce_name = `${namespace.substring(0, 20)}-${deployment_name.substring(0, 40)}`;

      const vpc_name = this.inputs?.labels?.vpc || 'deleting';

      this.backend = new ComputeFirewall(this, 'service-firewall', {
        name: `${gce_name}-firewall-${service_port}`,
        allow: [{ protocol: 'tcp', ports: [`${service_port}`] }],
        network: vpc_name,
        targetTags: [gce_name],
        sourceRanges: ['10.0.0.0/8'],
      });

      // Internal host names: https://cloud.google.com/compute/docs/internal-dns#about_internal_dns
      const host = `${gce_name}.${zone}.c.${this.credentials.project}.internal`;
      let url = '';
      if (this.inputs?.username && this.inputs.password) {
        url = `${protocol}://${this.inputs?.username}:${this.inputs?.password}@${host}:${service_port}`;
      } else {
        url = `${protocol}://${host}:${service_port}`;
      }

      this.outputs = {
        id: `${gce_name}--${service_port}`,
        protocol,
        host,
        port: service_port,
        url,
        username: this.inputs?.username || '',
        password: this.inputs?.password || '',
        account: this.inputs?.account || '',
        name: service_name,
        target_port: service_port,
      };
    } else {
      const function_name = `${namespace.substring(0, 20)}-${deployment_name.substring(0, 20)}-${service_port}`;

      const serverless_neg = new ComputeRegionNetworkEndpointGroup(this, 'serverless-neg', {
        name: `${service_name}--neg`,
        networkEndpointType: 'SERVERLESS',
        region,
        cloudRun: {
          service: function_name,
        },
      });

      this.backend = new ComputeBackendService(this, 'backend-neg', {
        name: `${service_name}--backend`,
        backend: [{
          group: serverless_neg.id,
        }],
        loadBalancingScheme: 'EXTERNAL_MANAGED',
        localityLbPolicy: 'ROUND_ROBIN',
      });

      this.outputs = {
        id: this.backend.id,
        protocol: (this.backend as ComputeBackendService).protocol,
        host: function_name,
        port: service_port,
        url: '',
        username: this.inputs?.username || '',
        password: this.inputs?.password || '',
        account: this.inputs?.account || '',
        name: service_name,
        target_port: service_port,
      };
    }
  }

  genImports(_resourceId: string): Promise<Record<string, string>> {
    return Promise.resolve({});
  }

  getDisplayNames(): Record<string, string> {
    return {};
  }
}
