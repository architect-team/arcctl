import { Construct } from 'constructs';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule, ResourceModuleOptions } from '../../module.ts';
import { ComputeBackendService } from '../.gen/providers/google/compute-backend-service/index.ts';
import { ComputeGlobalForwardingRule } from '../.gen/providers/google/compute-global-forwarding-rule/index.ts';
import { ComputeRegionNetworkEndpointGroup } from '../.gen/providers/google/compute-region-network-endpoint-group/index.ts';
import { ComputeTargetHttpProxy } from '../.gen/providers/google/compute-target-http-proxy/index.ts';
import { ComputeUrlMap } from '../.gen/providers/google/compute-url-map/index.ts';
import { GoogleCloudCredentials } from '../credentials.ts';

export class GoogleCloudIngressRuleModule extends ResourceModule<'ingressRule', GoogleCloudCredentials> {
  outputs: ResourceOutputs['ingressRule'];
  ingress: ComputeGlobalForwardingRule;

  constructor(scope: Construct, options: ResourceModuleOptions<'ingressRule', GoogleCloudCredentials>) {
    super(scope, options);

    const function_name = this.inputs?.service || '';

    let region = '';
    if (this.inputs?.namespace) {
      region = this.inputs.namespace.split('-').slice(0, -1).join('-');
    }

    const serverless_neg = new ComputeRegionNetworkEndpointGroup(this, 'serverless-neg', {
      name: `${function_name}--neg`,
      networkEndpointType: 'SERVERLESS',
      region,
      cloudRun: {
        service: function_name,
      },
    });

    const backend_service = new ComputeBackendService(this, 'backend-neg', {
      name: `${function_name}--backend`,
      backend: [{
        group: serverless_neg.id,
      }],
      loadBalancingScheme: 'EXTERNAL_MANAGED',
      localityLbPolicy: 'ROUND_ROBIN',
    });

    const url_map = new ComputeUrlMap(this, 'url-map', {
      name: `${function_name}--lb`,
      defaultService: backend_service.id,
    });

    const http_proxy = new ComputeTargetHttpProxy(this, 'backend-proxy', {
      name: `${function_name}--target-proxy`,
      urlMap: url_map.id,
    });

    this.ingress = new ComputeGlobalForwardingRule(this, 'fwd-rule', {
      name: `${function_name}--frontend`,
      loadBalancingScheme: 'EXTERNAL_MANAGED',
      target: http_proxy.id,
      portRange: '80',
    });

    this.outputs = {
      id: this.ingress.id,
      host: 'main', // TODO: Hardcoded
      port: this.inputs?.port || 80,
      path: this.inputs?.path || '/',
      url: '',
      loadBalancerHostname: this.ingress.ipAddress,
    };
  }

  genImports(_resourceId: string): Promise<Record<string, string>> {
    return Promise.resolve({
      [this.getResourceRef(this.ingress)]: 'Ingress Rule',
    });
  }

  getDisplayNames(): Record<string, string> {
    return {
      [this.getResourceRef(this.ingress)]: 'Ingress Rule',
    };
  }
}
