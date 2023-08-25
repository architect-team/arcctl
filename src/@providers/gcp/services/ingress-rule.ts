import { Auth, compute_v1, google } from 'googleapis';
import { Subscriber } from 'rxjs';
import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { DeepPartial } from '../../../utils/types.ts';
import { CrudResourceService } from '../../crud.service.ts';
import { ProviderStore } from '../../store.ts';
import { GoogleCloudCredentials } from '../credentials.ts';
import GcpUtils from '../utils.ts';

const GCE_PREFIX = 'gce/';

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
    if (inputs.strategy === 'gce') {
      return this.createGCE(subscriber, inputs);
    }

    return this.createCloudRun(subscriber, inputs);
  }

  async update(
    subscriber: Subscriber<string>,
    id: string,
    inputs: DeepPartial<ResourceInputs['ingressRule']>,
  ): Promise<ResourceOutputs['ingressRule']> {
    if (inputs.strategy === 'gce') {
      return this.updateGCE(subscriber, id, inputs);
    }
    return this.updateCloudRun(subscriber, id, inputs);
  }

  async createCloudRun(
    subscriber: Subscriber<string>,
    inputs: ResourceInputs['ingressRule'],
  ): Promise<ResourceOutputs['ingressRule']> {
    const url_map_name = `${inputs.namespace}--lb`;

    // The input service name is the NetworkEndpointGroup and looks like:
    // `projects/{proj_name}/global/backendServices/{service_name}--backend`
    const neg_name = inputs.service.substring(inputs.service.lastIndexOf('/') + 1);
    const service_name = neg_name.substring(0, neg_name.length - '--backend'.length);

    const backend_service_name = `global/backendServices/${neg_name}`;
    const host_name = `${inputs.subdomain}.${inputs.dnsZone}`;
    const ssl_cert_name = `${service_name}-cert`;
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
            pathMatcher: service_name,
          }],
          pathMatchers: [{
            defaultService: backend_service_name,
            name: service_name,
          }],
        },
      });
    } else {
      const host_rules = url_map.data.hostRules || [];
      const path_matchers = url_map.data.pathMatchers || [];

      const existing_rule = host_rules.find((rule) => rule.hosts && rule.hosts[0] === host_name);
      if (!existing_rule) {
        host_rules.push({
          hosts: [host_name],
          pathMatcher: service_name,
        });
        path_matchers.push({
          defaultService: backend_service_name,
          name: service_name,
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
    try {
      await google.compute('v1').targetHttpsProxies.insert({
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
      await google.compute('v1').targetHttpsProxies.patch({
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
          portRange: '443', // This portRange can be changed to map to various ports of GCE instance I think
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
      url: `https://${inputs.subdomain}.${inputs.dnsZone}`,
      loadBalancerHostname: forwarding_rule.data.IPAddress || '',
    };
  }

  async updateCloudRun(
    subscriber: Subscriber<string>,
    id: string,
    inputs: DeepPartial<ResourceInputs['ingressRule']>,
  ): Promise<ResourceOutputs['ingressRule']> {
    const existing_rule = await this.get(id);
    if (!existing_rule) {
      throw new Error(`No ingressRule with ID: ${id}`);
    }

    // If the required inputs exist, we can delete and re-create the resources.
    // If things like subdomain or dnsZone are missing, we're unable to change
    // anything and should not make any updates.
    if (
      inputs.namespace && inputs.subdomain && inputs.dnsZone && inputs.service &&
      (existing_rule.host !== `${inputs.subdomain}.${inputs.dnsZone}` || !inputs.service.endsWith(existing_rule.id))
    ) {
      subscriber.next('Updating ingressRule');
      await this.delete(subscriber, id);

      // Wait after potentially deleting the URLMap before it gets recreated.
      // Otherwise, the old map will be returned from the GET request and will attempt to PATCH it.
      await new Promise((f) => setTimeout(f, 10000));

      return this.create(subscriber, inputs as ResourceInputs['ingressRule']);
    }

    return existing_rule;
  }

  async delete(subscriber: Subscriber<string>, id: string): Promise<void> {
    if (id.startsWith(GCE_PREFIX)) {
      return this.deleteGCE(subscriber, id);
    }
    let url_map;
    try {
      const map = await this.getUrlMapForService(id);
      url_map = map.url_map;
    } catch (e) {
      // Resource was already deleted
      return;
    }

    // In order to delete an ingress rule, there are two possible paths:
    // 1. If the URLMap contains >= 2 rules:
    //       Remove the rule for the given ID from the URLMap
    // 2. If the URLMap contains only 1 rule:
    //       Delete the URLMap, TargetHTTPSProxy, and GlobalForwardingRules objects (i.e. the entire load balancer)
    if ((url_map.hostRules || []).length >= 2) {
      subscriber.next('Deleting URLMap rule');
      await this.deleteUrlMapRule(url_map, id);
    } else {
      subscriber.next('Deleting LoadBalancer');
      await this.deleteLB(url_map, id);
    }

    subscriber.next('');
  }

  async deleteUrlMapRule(url_map: compute_v1.Schema$UrlMap, service_name: string) {
    if (!url_map.name) {
      return;
    }

    // Remove Cert from TargetHTTPSProxy and delete the Cert
    const target_proxy_name = `${url_map.name}--target-proxy`;
    const ssl_cert_name = `${service_name}-cert`;

    const target_proxy = await google.compute('v1').targetHttpsProxies.get({
      ...this.requestAuth(),
      targetHttpsProxy: target_proxy_name,
    });

    const ssl_certs = target_proxy.data.sslCertificates;
    const updated_ssl_certs = ssl_certs?.filter((cert) => !cert.includes(ssl_cert_name));

    await google.compute('v1').targetHttpsProxies.patch({
      ...this.requestAuth(),
      targetHttpsProxy: target_proxy_name,
      requestBody: {
        sslCertificates: updated_ssl_certs,
        fingerprint: target_proxy.data.fingerprint,
      },
    });

    await new Promise((f) => setTimeout(f, 20000));

    await google.compute('v1').sslCertificates.delete({
      ...this.requestAuth(),
      sslCertificate: ssl_cert_name,
    });

    // Update the URLMap to remove this service.
    let path_matchers = [...(url_map.pathMatchers || [])];
    let host_rules = [...(url_map.hostRules || [])];
    let default_service = url_map.defaultService;
    let removed_service;

    for (const path_matcher of url_map.pathMatchers || []) {
      if (path_matcher.defaultService && path_matcher.defaultService.endsWith(`${service_name}--backend`)) {
        const path_matcher_name = path_matcher.name;
        if (path_matcher_name) {
          // Remove the hostRule/pathMatcher for this service
          path_matchers = path_matchers.filter((m) => m.name !== path_matcher_name);
          host_rules = host_rules.filter((h) => h.pathMatcher !== path_matcher_name);
          // Keep track of the removed service so that if it's the URLMap's default service,
          // the default service can be modified.
          removed_service = path_matcher.defaultService;
        }
      }
    }

    if (removed_service === default_service) {
      // There will always be at least 1 item in path_matchers because this
      // function only runs when the length of the urlmap rules >= 2
      default_service = path_matchers[0].defaultService;
    }

    await google.compute('v1').urlMaps.patch({
      ...this.requestAuth(),
      urlMap: url_map.name,
      requestBody: {
        defaultService: default_service,
        hostRules: host_rules,
        pathMatchers: path_matchers,
      },
    });
  }

  async deleteLB(url_map: compute_v1.Schema$UrlMap, service_name: string) {
    if (!url_map.name) {
      return;
    }

    // Find the TargetHttpsProxy to delete
    const target_proxies = await google.compute('v1').targetHttpsProxies.list({
      ...this.requestAuth(),
    });

    let proxy_to_delete_name;
    let forwarding_rule_to_delete_name;
    for (const target_proxy of target_proxies.data.items || []) {
      if (target_proxy.urlMap?.endsWith(url_map.name)) {
        proxy_to_delete_name = target_proxy.name;

        const forwarding_rules = await google.compute('v1').globalForwardingRules.list({
          ...this.requestAuth(),
        });

        for (const forwarding_rule of forwarding_rules.data.items || []) {
          if (target_proxy.name && forwarding_rule.target?.endsWith(target_proxy.name)) {
            forwarding_rule_to_delete_name = forwarding_rule.name;
            break;
          }
        }
        break;
      }
    }

    // Resources need to be deleted in reverse order of creation
    if (forwarding_rule_to_delete_name) {
      await google.compute('v1').globalForwardingRules.delete({
        ...this.requestAuth(),
        forwardingRule: forwarding_rule_to_delete_name,
      });

      // Need to wait otherwise attemping to delete the TargetHttpsProxy too early will error
      await new Promise((f) => setTimeout(f, 20000));
    }

    if (proxy_to_delete_name) {
      await google.compute('v1').targetHttpsProxies.delete({
        ...this.requestAuth(),
        targetHttpsProxy: proxy_to_delete_name,
      });

      // Need to wait otherwise attemping to delete the UrlMap too early will error
      await new Promise((f) => setTimeout(f, 20000));
    }

    await google.compute('v1').urlMaps.delete({
      ...this.requestAuth(),
      urlMap: url_map.name,
    });

    // Delete the ssl cert
    await google.compute('v1').sslCertificates.delete({
      ...this.requestAuth(),
      sslCertificate: `${service_name}-cert`,
    });
  }

  /**
   * Given the CloudRun Function name, return the UrlMap that directs traffic to that service
   * and it's hostname
   */
  async getUrlMapForService(service_name: string) {
    // The UrlMap's pathMatcher defaultService points to a NetworkEndpointGroup
    // which is named the same as the service with '--backend' appended.
    const neg_name = `${service_name}--backend`;
    const url_maps = await google.compute('v1').urlMaps.list({ ...this.requestAuth() });

    for (const url_map of url_maps.data.items || []) {
      for (const path_matcher of url_map.pathMatchers || []) {
        if (path_matcher.defaultService && path_matcher.defaultService.endsWith(neg_name)) {
          for (const host_rule of url_map.hostRules || []) {
            if (host_rule.hosts && host_rule.hosts.length > 0 && host_rule.pathMatcher === path_matcher.name) {
              return { url_map, hostname: host_rule.hosts[0] };
            }
          }
        }
      }
    }

    throw Error(`No URLMap exists for service: ${service_name}`);
  }

  async createGCE(
    subscriber: Subscriber<string>,
    inputs: ResourceInputs['ingressRule'],
  ): Promise<ResourceOutputs['ingressRule']> {
    const [deployment_name, _service_id_port] = inputs.service.split('--');
    const resource_name = `${deployment_name}-public`;

    const zone = inputs.region || '';
    const region = zone.split('-').slice(0, -1).join('-');

    let static_ip;
    try {
      await google.compute('v1').addresses.insert({
        ...this.requestAuth(),
        region,
        requestBody: {
          name: resource_name,
        },
      });

      await new Promise((f) => setTimeout(f, 5000));

      const result = await google.compute('v1').addresses.get({
        ...this.requestAuth(),
        region,
        address: resource_name,
      });
      static_ip = result.data;

      if (!static_ip.address) {
        throw Error('Failed to get a Static IP address for GCE instance');
      }
    } catch (e) {
      if (e.code !== 409) {
        throw e;
      }
      // Static IP already exists and is attached, so we can just return it
      const result = await google.compute('v1').addresses.get({
        ...this.requestAuth(),
        region,
        address: resource_name,
      });
      static_ip = result.data;
    }

    // Must first remove the existing accessConfig that is empty
    await google.compute('v1').instances.deleteAccessConfig({
      ...this.requestAuth(),
      instance: deployment_name,
      zone,
      networkInterface: 'nic0',
      accessConfig: 'external-nat', // default access config name
    });

    await new Promise((f) => setTimeout(f, 2000));

    // Attach this static IP to our GCE instance
    await google.compute('v1').instances.addAccessConfig({
      ...this.requestAuth(),
      instance: deployment_name,
      zone,
      networkInterface: 'nic0', // default network interface
      requestBody: {
        name: 'external-nat',
        natIP: static_ip.address,
      },
    });

    try {
      const { data: firewall } = await google.compute('v1').firewalls.get({
        ...this.requestAuth(),
        firewall: resource_name,
      });

      const allowed = firewall.allowed || [];
      if (allowed.length > 0 && allowed[0].ports && allowed[0].ports.length > 0) {
        allowed[0].ports.push(`${inputs.port}`);
      }
      await google.compute('v1').firewalls.patch({
        ...this.requestAuth(),
        firewall: resource_name,
        requestBody: {
          allowed,
        },
      });
    } catch {
      // If a firewall doesn't already exist, create it now
      await google.compute('v1').firewalls.insert({
        ...this.requestAuth(),
        requestBody: {
          name: resource_name,
          allowed: [{
            IPProtocol: 'tcp',
            ports: [`${inputs.port}`],
          }],
          targetTags: [deployment_name],
          network: `global/networks/${inputs.vpc}`,
          sourceRanges: ['0.0.0.0/0'],
        },
      });
    }

    // ID is prefixed with GCE_PREFIX so it can be differentiated from cloudrun configuration
    // for gets/deletes/updates
    return {
      id: `${GCE_PREFIX}${resource_name}--${inputs.port}`,
      host: static_ip.address || '',
      port: inputs.port,
      path: inputs.path || '/',
      url: `http://${static_ip}:${inputs.port}`,
      loadBalancerHostname: static_ip.address || '',
    };
  }

  async updateGCE(
    subscriber: Subscriber<string>,
    id: string,
    inputs: DeepPartial<ResourceInputs['ingressRule']>,
  ): Promise<ResourceOutputs['ingressRule']> {
    const existing_rule = await this.getGCE(id);
    if (!existing_rule) {
      throw new Error(`No ingressRule with ID: ${id}`);
    }
    return existing_rule;
  }

  async deleteGCE(subscriber: Subscriber<string>, id: string): Promise<void> {
    // Look for a firewall rule with the given ID - if it doesn't exist,
    // it was already deleted or it was a cloud run LB that was already deleted
    const [_, resource_name_and_port] = id.split('/');
    const [resource_name, port] = resource_name_and_port.split('--');

    let firewall;
    try {
      const result = await google.compute('v1').firewalls.get({
        ...this.requestAuth(),
        firewall: resource_name,
      });
      firewall = result.data;
    } catch {
      // Already deleted
      return;
    }

    const firewall_allowed = firewall.allowed || [];
    if (firewall_allowed.length > 0 && firewall_allowed[0].ports && firewall_allowed[0].ports.length > 1) {
      // Just need to remove the port for this resource, don't need to remove the entire rule or static IP.
      firewall_allowed[0].ports = firewall_allowed[0].ports.filter((p) => p !== port);
      await google.compute('v1').firewalls.patch({
        ...this.requestAuth(),
        firewall: resource_name,
        requestBody: {
          allowed: firewall_allowed,
        },
      });
    } else {
      await google.compute('v1').firewalls.delete({
        ...this.requestAuth(),
        firewall: resource_name,
      });

      // We don't know what region this address was created for, delete can only access the ID :(
      const regions = await GcpUtils.getProjectRegions(this.credentials, this.credentials.project);
      for (const region of regions) {
        // TODO: Maybe this will fail if it's still attached to the GCE instance
        try {
          await google.compute('v1').addresses.delete({
            ...this.requestAuth(),
            address: resource_name,
            region,
          });
        } catch {
          // wrong region, oh well
        }
      }
    }
  }

  async get(
    id: string,
  ): Promise<ResourceOutputs['ingressRule'] | undefined> {
    if (id.startsWith('gce/')) {
      return this.getGCE(id);
    } else {
      return this.getCloudRun(id);
    }
  }

  async getGCE(
    id: string,
  ): Promise<ResourceOutputs['ingressRule'] | undefined> {
    // TODO: Need to be able to list this too
    const [_, resource_name_and_port] = id.split('/');
    const [resource_name, port] = resource_name_and_port.split('--');
    const regions = await GcpUtils.getProjectRegions(this.credentials, this.credentials.project);

    const { data: firewall } = await google.compute('v1').firewalls.get({
      ...this.requestAuth(),
      firewall: resource_name,
    });

    if (firewall.allowed?.at(0)?.ports?.filter((p) => p === port).length === 0) {
      throw Error(`Unable to find firewall rule that allows port ${port}`);
    }

    for (const region of regions) {
      try {
        const { data: static_ip } = await google.compute('v1').addresses.get({
          ...this.requestAuth(),
          region,
          address: resource_name,
        });

        return {
          id: `gce/${static_ip.name}--${port}`,
          host: static_ip.address || '',
          port: firewall.allowed?.at(0)?.ports?.at(0) || '',
          path: '/',
          url: `http://${static_ip}:${port}`,
          loadBalancerHostname: static_ip.address || '',
        };
      } catch {
        // Do nothing, must not be in this region
      }
    }
  }

  async getCloudRun(
    id: string,
  ): Promise<ResourceOutputs['ingressRule'] | undefined> {
    const { url_map: target_url_map, hostname } = await this.getUrlMapForService(id);

    const target_proxies = await google.compute('v1').targetHttpsProxies.list({
      ...this.requestAuth(),
    });

    let rule;
    for (const target_proxy of target_proxies.data.items || []) {
      if (target_url_map.name && target_proxy.urlMap?.endsWith(target_url_map.name)) {
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
      host: hostname || '',
      port: rule?.portRange || 80,
      path: '/',
      url: `https://${hostname}`,
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
          const url_map_name = target_proxy.data.urlMap.substring(
            target_proxy.data.urlMap.lastIndexOf('/') + 1,
          );
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
              const hostname = host_rule.hosts[0];

              ingress_rules.push({
                id: service_name || '',
                loadBalancerHostname: rule.IPAddress || '',
                host: hostname,
                port: rule.portRange || 80,
                path: '/',
                url: `https://${hostname}`,
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
