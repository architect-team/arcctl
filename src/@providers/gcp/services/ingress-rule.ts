import { Auth, google } from 'googleapis';
import { Subscriber } from 'rxjs';
import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { DeepPartial } from '../../../utils/types.ts';
import { CrudResourceService } from '../../crud.service.ts';
import { ProviderStore } from '../../store.ts';
import { GoogleCloudCredentials } from '../credentials.ts';

export class GoogleCloudIngressRuleService extends CrudResourceService<'ingressRule', GoogleCloudCredentials> {
  private auth: Auth.GoogleAuth;

  constructor(accountName: string, credentials: GoogleCloudCredentials, providerStore: ProviderStore) {
    super(accountName, credentials, providerStore);
    this.auth = new Auth.GoogleAuth({
      keyFile: credentials.serviceAccountCredentialsFile,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
  }

  requestAuth(): {
    auth: Auth.GoogleAuth;
    project: string;
  } {
    return {
      auth: this.auth,
      project: this.credentials.project,
    };
  }

  async create(
    subscriber: Subscriber<string>,
    inputs: ResourceInputs['ingressRule'],
  ): Promise<ResourceOutputs['ingressRule']> {
    const url_map_name = `${inputs.namespace}-lb`;

    // The input service name is the NetworkEndpointGroup and looks like:
    // `projects/{proj_name}/global/backendServices/{service_name}--backend`
    const neg_name = inputs.service.substring(inputs.service.lastIndexOf('/') + 1);
    const service_name = neg_name.substring(0, neg_name.length - '--backend'.length);

    const backend_service_name = `global/backendServices/${service_name}--backend`;
    const host_name = `${inputs.subdomain}.${inputs.dnsZone}`;
    const ssl_cert_name = `${inputs.namespace}-${inputs.subdomain}-${service_name}`;
    const target_proxy_name = `${url_map_name}--target-proxy`;
    const loadbalancer_frontend_name = `${url_map_name}--frontend`;

    // Step 1: Create the URLMap. If a URLMap already exists, we patch the existing
    // URL map to add the subdomain matching rule.
    let url_map;
    try {
      url_map = await google.compute('v1').urlMaps.get({
        ...this.requestAuth(),
        urlMap: url_map_name,
      });
    } catch (e) {
      if (e.code !== 404) {
        throw e;
      }
    }
    if (!url_map) {
      subscriber.next('Creating URL Map');
      url_map = await google.compute('v1').urlMaps.insert({
        ...this.requestAuth(),
        requestBody: {
          name: url_map_name,
          defaultService: backend_service_name,
          hostRules: [{
            hosts: [host_name],
            pathMatcher: 'path-matcher-1',
          }],
          pathMatchers: [{
            defaultService: backend_service_name,
            name: 'path-matcher-1',
          }],
        },
      });
    } else {
      const host_rules = url_map.data.hostRules || [];
      const path_matchers = url_map.data.pathMatchers || [];

      const existing_rule = host_rules.find((rule) => rule.hosts && rule.hosts[0] === host_name);
      if (!existing_rule) {
        const next_rule_number = (url_map.data.hostRules?.length || 0) + 1;
        const patch_matcher_name = `path-matcher-${next_rule_number}`;

        host_rules.push({
          hosts: [host_name],
          pathMatcher: patch_matcher_name,
        });
        path_matchers.push({
          defaultService: backend_service_name,
          name: patch_matcher_name,
        });
      }

      subscriber.next('Updating URL Map');
      url_map = await google.compute('v1').urlMaps.patch({
        ...this.requestAuth(),
        urlMap: url_map_name,
        requestBody: {
          defaultService: backend_service_name,
          hostRules: host_rules,
          pathMatchers: path_matchers,
        },
      });
    }

    // Step 2: Create the SSLCert if one does not already exist for this subdomain.
    let ssl_cert;
    try {
      ssl_cert = await google.compute('v1').sslCertificates.get({
        ...this.requestAuth(),
        sslCertificate: ssl_cert_name,
      });
    } catch (e) {
      if (e.code !== 404) {
        throw e;
      }

      subscriber.next('Generating SSL Cert');
      ssl_cert = await google.compute('v1').sslCertificates.insert({
        ...this.requestAuth(),
        requestBody: {
          name: ssl_cert_name,
          type: 'MANAGED',
          managed: {
            domains: [host_name],
          },
        },
      });
    }

    // Need to wait a little bit after creating the SSL cert for it to be
    // usable in the HttpsProxy
    await new Promise((f) => setTimeout(f, 5000));

    // Step 3: Create the TargetHttpsProxies resource if it doesn't already exist.
    // If it does exist, patch the existing proxy to add the cert for this service.
    subscriber.next('Updating Target Proxy');
    let https_proxies;
    try {
      https_proxies = await google.compute('v1').targetHttpsProxies.insert({
        ...this.requestAuth(),
        requestBody: {
          name: target_proxy_name,
          sslCertificates: [`global/sslCertificates/${ssl_cert_name}`],
          urlMap: `global/urlMaps/${url_map_name}`,
        },
      });
    } catch (e) {
      // 409 indicates the resource already exists and we can patch it instead
      if (e.code !== 409) {
        throw e;
      }

      const existing_proxy = await google.compute('v1').targetHttpsProxies.get({
        ...this.requestAuth(),
        targetHttpsProxy: target_proxy_name,
      });

      const existing_certs = existing_proxy.data.sslCertificates || [];
      const sslCertificates = [...existing_certs];
      if (!existing_certs.find((cert) => cert.includes(ssl_cert_name))) {
        // Cert isn't included yet, needs to be added to the proxy
        sslCertificates.push(`global/sslCertificates/${ssl_cert_name}`);
      }
      https_proxies = await google.compute('v1').targetHttpsProxies.patch({
        ...this.requestAuth(),
        targetHttpsProxy: target_proxy_name,
        requestBody: {
          sslCertificates,
          fingerprint: existing_proxy.data.fingerprint,
        },
      });
    }

    // Need to wait again so that the resource is ready before using it.
    await new Promise((f) => setTimeout(f, 5000));

    // Step 4: Create the ForwardingRules. This doesn't need to be updated, so if
    // it already exists there is nothing that needs to be done.
    subscriber.next('Updating GlobalForwardingRule');
    try {
      await google.compute('v1').globalForwardingRules.insert({
        ...this.requestAuth(),
        requestBody: {
          loadBalancingScheme: 'EXTERNAL_MANAGED',
          name: loadbalancer_frontend_name,
          target: `global/targetHttpsProxies/${target_proxy_name}`,
          portRange: '443',
        },
      });

      // Wait after creation so the GET request afterwards returns the IP address
      await new Promise((f) => setTimeout(f, 5000));
    } catch (e) {
      // 409 indicates the ForwardingRules resource already exists.
      // Any other error should be raised to the user.
      if (e.code !== 409) {
        throw e;
      }
    }

    subscriber.next('');

    const forwarding_rule = await google.compute('v1').globalForwardingRules.get({
      ...this.requestAuth(),
      forwardingRule: loadbalancer_frontend_name,
    });

    // ID is the service name so that it can be distinguished in the URL map later for get/update
    return {
      id: service_name,
      host: forwarding_rule.data.IPAddress || '',
      port: inputs.port || 80,
      path: inputs.path || '/',
      url: `https://${inputs.subdomain}.${inputs.dnsZone}/`,
      loadBalancerHostname: forwarding_rule.data.IPAddress || '',
    };
  }

  async update(
    subscriber: Subscriber<string>,
    id: string,
    inputs: DeepPartial<ResourceInputs['ingressRule']>,
  ): Promise<ResourceOutputs['ingressRule']> {
    const res = await this.get(id);
    if (!res) {
      throw new Error(`No ingressRule with ID: ${id}`);
    }

    // TODO: If the inputs are different, we should actually update it instead of doing nothing.
    // For now though, do nothing on update and make sure it works.

    return res;
  }

  async delete(subscriber: Subscriber<string>, id: string): Promise<void> {
    const res = await this.get(id);
    if (!res) {
      return Promise.resolve();
    }
  }

  async get(
    id: string,
  ): Promise<ResourceOutputs['ingressRule'] | undefined> {
    const service_name = id;
    const neg_name = `${service_name}--backend`;

    const url_maps = await google.compute('v1').urlMaps.list({ ...this.requestAuth() });

    let target_url_map;
    let url;
    for (const url_map of url_maps.data.items || []) {
      let path_matcher_name;
      for (const path_matcher of url_map.pathMatchers || []) {
        if (path_matcher.defaultService && path_matcher.defaultService.endsWith(neg_name)) {
          target_url_map = url_map;
          path_matcher_name = path_matcher.name || '';
          break;
        }
      }

      if (path_matcher_name) {
        for (const host_rule of url_map.hostRules || []) {
          if (host_rule.hosts && host_rule.hosts.length > 0 && host_rule.pathMatcher === path_matcher_name) {
            url = host_rule.hosts[0];
          }
        }
      }

      if (target_url_map && url) {
        break;
      }
    }

    if (!target_url_map || !target_url_map.name) {
      throw Error(`Unable to find a URLMap containing the service: ${id}`);
    }

    const target_proxies = await google.compute('v1').targetHttpsProxies.list({
      ...this.requestAuth(),
    });

    let rule;
    for (const target_proxy of target_proxies.data.items || []) {
      if (target_proxy.urlMap?.endsWith(target_url_map.name)) {
        const forwarding_rules = await google.compute('v1').globalForwardingRules.list({
          ...this.requestAuth(),
        });

        for (const forwarding_rule of forwarding_rules.data.items || []) {
          if (target_proxy.name && forwarding_rule.target?.endsWith(target_proxy.name)) {
            rule = forwarding_rule;
            break;
          }
        }

        break;
      }
    }

    return {
      id: id,
      loadBalancerHostname: rule?.IPAddress || '',
      host: rule?.IPAddress || '',
      port: rule?.portRange || 80,
      path: '/',
      url: `https://${url}` || '',
    };
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['ingressRule']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['ingressRule']>> {
    const forwarding_rules = await google.compute('v1').globalForwardingRules.list({
      ...this.requestAuth(),
    });

    const ingress_rules = [];
    for (const rule of forwarding_rules.data.items || []) {
      if (rule.target) {
        const targetHttpsProxy = rule.target.substring(rule.target.lastIndexOf('/') + 1);
        const target_proxy = await google.compute('v1').targetHttpsProxies.get({
          ...this.requestAuth(),
          targetHttpsProxy,
        });

        if (target_proxy.data.urlMap) {
          const url_map_name = target_proxy.data.urlMap.substring(target_proxy.data.urlMap.lastIndexOf('/') + 1);
          const url_map = await google.compute('v1').urlMaps.get({
            ...this.requestAuth(),
            urlMap: url_map_name,
          });

          const path_services: Record<string, string> = {};
          for (const path_matchers of url_map.data.pathMatchers || []) {
            if (path_matchers.name && path_matchers.defaultService) {
              path_services[path_matchers.name] = path_matchers.defaultService.substring(
                path_matchers.defaultService.lastIndexOf('/') + 1,
              );
            }
          }

          for (const host_rule of url_map.data.hostRules || []) {
            if (host_rule.hosts && host_rule.hosts.length > 0 && host_rule.pathMatcher) {
              const neg_name = path_services[host_rule.pathMatcher];
              const service_name = neg_name.substring(0, neg_name.length - '--backend'.length);

              ingress_rules.push({
                id: service_name || '',
                loadBalancerHostname: rule.IPAddress || '',
                host: rule.IPAddress || '',
                port: rule.portRange || 80,
                path: '/',
                url: `https://${host_rule.hosts[0]}`,
              });
            }
          }
        }
      }
    }

    return {
      total: ingress_rules.length,
      rows: ingress_rules,
    };
  }
}
