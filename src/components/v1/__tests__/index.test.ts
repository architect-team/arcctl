import { CloudEdge, CloudNode } from '../../../cloud-graph.ts';
import {
  testDeploymentGeneration,
  testServiceGeneration,
  testServiceIntegration,
} from '../../__tests__/version-helper.ts';
import ComponentV1 from '../index.ts';
import yaml from 'npm:js-yaml';

describe('Component Schema: v1', () => {
  it('should generate deployments', async () =>
    testDeploymentGeneration(
      `
      name: test

      services:
        api:
          image: nginx:1.14.2
    `,
      ComponentV1,
      {
        deployment_name: 'api',
      },
    ));

  it('should generate services', async () =>
    testServiceGeneration(
      `
      name: test

      services:
        api:
          image: nginx:1.14.2
          interfaces:
            main: 80
      `,
      ComponentV1,
      { deployment_name: 'api', service_name: 'api-main' },
    ));

  it('should connect deployments to services', async () =>
    testServiceIntegration(
      `
      name: test

      services:
        first:
          image: nginx:1.14.2
          interfaces:
            main: 80
        second:
          image: nginx:1.14.2
          environment:
            FIRST_ADDR: \${{ services.first.interfaces.main.url }}
    `,
      ComponentV1,
      {
        deployment_name: 'second',
        service_name: 'first-main',
      },
    ));

  it('should create interface nodes', async () => {
    const component = new ComponentV1(
      yaml.load(`
        name: test
        services:
          api:
            image: nginx:1.14.2
            interfaces:
              main: 80
        interfaces:
          api: \${{ services.api.interfaces.main.url }}
      `) as any,
    );

    const graph = component.getGraph({
      component: {
        name: 'test',
        source: 'fake/repo',
      },
      environment: 'test',
    });

    const deployment_node_id = CloudNode.genId({
      type: 'deployment',
      name: 'api',
      component: 'test',
      environment: 'test',
    });

    const interface_node = new CloudNode({
      name: 'api',
      component: 'test',
      environment: 'test',
      inputs: {
        type: 'service',
        name: CloudNode.genResourceId({
          name: 'api',
          component: 'test',
          environment: 'test',
        }),
        protocol: 'http',
        selector: CloudNode.genResourceId({
          name: 'api',
          component: 'test',
          environment: 'test',
        }),
        target_port: 80,
      },
    });

    expect(graph.nodes).toEqual(expect.arrayContaining([interface_node]));

    expect(graph.edges).toEqual(
      expect.arrayContaining([
        new CloudEdge({
          from: interface_node.id,
          to: deployment_node_id,
          required: false,
        }),
      ]),
    );
  });

  it('should create ingress nodes for root interfaces', async () => {
    const component = new ComponentV1(
      yaml.load(`
        name: test
        services:
          api:
            image: nginx:1.14.2
            interfaces:
              main: 80
        interfaces:
          api:
            url: \${{ services.api.interfaces.main.url }}
            ingress:
              subdomain: app
      `) as any,
    );

    const graph = component.getGraph({
      component: {
        name: 'test',
        source: 'fake/repo',
      },
      environment: 'test',
    });

    const interface_node = new CloudNode({
      name: 'api',
      component: 'test',
      environment: 'test',
      inputs: {
        type: 'service',
        name: CloudNode.genResourceId({
          name: 'api',
          component: 'test',
          environment: 'test',
        }),
        protocol: 'http',
        selector: CloudNode.genResourceId({
          name: 'api',
          component: 'test',
          environment: 'test',
        }),
        target_port: 80,
      },
    });

    const ingress_node = new CloudNode({
      name: 'api',
      component: 'test',
      environment: 'test',
      inputs: {
        type: 'ingressRule',
        loadBalancer: '',
        listener: {
          subdomain: 'app',
          path: '/',
          protocol: `\${{ ${interface_node.id}.protocol }}`,
        },
        service: `\${{ ${interface_node.id}.id }}`,
        port: 80,
        internal: false,
      },
    });

    expect(graph.nodes).toEqual(
      expect.arrayContaining([interface_node, ingress_node]),
    );

    expect(graph.edges).toEqual(
      expect.arrayContaining([
        new CloudEdge({
          from: ingress_node.id,
          to: interface_node.id,
          required: true,
        }),
      ]),
    );
  });

  it('should create ingress nodes for service interfaces', async () => {
    const component = new ComponentV1(
      yaml.load(`
        name: test
        services:
          api:
            image: nginx:1.14.2
            interfaces:
              main:
                port: 80
                ingress:
                  subdomain: app
      `) as any,
    );

    const graph = component.getGraph({
      component: {
        name: 'test',
        source: 'fake/repo',
      },
      environment: 'test',
    });

    const service_node = new CloudNode({
      name: `api-main`,
      component: 'test',
      environment: 'test',
      inputs: {
        type: 'service',
        name: CloudNode.genResourceId({
          name: 'api-main',
          component: 'test',
          environment: 'test',
        }),
        protocol: 'http',
        selector: CloudNode.genResourceId({
          name: 'api',
          component: 'test',
          environment: 'test',
        }),
        target_port: 80,
      },
    });

    const ingress_node = new CloudNode({
      name: 'api-main',
      component: 'test',
      environment: 'test',
      inputs: {
        type: 'ingressRule',
        loadBalancer: '',
        listener: {
          subdomain: 'app',
          path: '/',
          protocol: `\${{ ${service_node.id}.protocol }}`,
        },
        service: `\${{ ${service_node.id}.id }}`,
        port: 80,
        internal: false,
      },
    });

    expect(graph.nodes).toEqual(
      expect.arrayContaining([service_node, ingress_node]),
    );

    expect(graph.edges).toEqual(
      expect.arrayContaining([
        new CloudEdge({
          from: ingress_node.id,
          to: service_node.id,
          required: true,
        }),
      ]),
    );
  });
});
