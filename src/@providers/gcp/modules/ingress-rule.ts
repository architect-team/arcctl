import { Construct } from 'constructs';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule, ResourceModuleOptions } from '../../module.ts';
import { ComputeGlobalForwardingRule } from '../.gen/providers/google/compute-global-forwarding-rule/index.ts';
import { ComputeTargetHttpProxy } from '../.gen/providers/google/compute-target-http-proxy/index.ts';
import { ComputeUrlMap } from '../.gen/providers/google/compute-url-map/index.ts';
import { DataGoogleComputeBackendService } from '../.gen/providers/google/data-google-compute-backend-service/index.ts';
import { GoogleCloudCredentials } from '../credentials.ts';
import GcpUtils from '../utils.ts';

export class GoogleCloudIngressRuleModule extends ResourceModule<'ingressRule', GoogleCloudCredentials> {
  outputs: ResourceOutputs['ingressRule'];
  ingress: ComputeGlobalForwardingRule;

  constructor(scope: Construct, options: ResourceModuleOptions<'ingressRule', GoogleCloudCredentials>) {
    super(scope, options);

    GcpUtils.configureProvider(this);

    const service_name = this.inputs?.name.replaceAll('/', '--') || '';

    const backend_service = new DataGoogleComputeBackendService(this, 'backend-neg', {
      name: `${service_name}--backend`,
    });

    const url_map = new ComputeUrlMap(this, 'url-map', {
      name: `${service_name}--lb`,
      defaultService: backend_service.id,
    });

    const http_proxy = new ComputeTargetHttpProxy(this, 'backend-proxy', {
      name: `${service_name}--target-proxy`,
      urlMap: url_map.id,
    });

    this.ingress = new ComputeGlobalForwardingRule(this, 'fwd-rule', {
      name: `${service_name}--frontend`,
      loadBalancingScheme: 'EXTERNAL_MANAGED',
      target: http_proxy.id,
      portRange: '80',
    });

    this.outputs = {
      id: this.ingress.id,
      host: this.ingress.ipAddress,
      port: this.inputs?.port || 80,
      path: this.inputs?.path || '/',
      url: `http://${this.inputs?.subdomain}.${this.inputs?.dnsZone}/`,
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
