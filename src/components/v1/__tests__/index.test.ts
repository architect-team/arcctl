import yaml from 'js-yaml';
import { assertArrayIncludes } from 'std/testing/asserts.ts';
import { describe, it } from 'std/testing/bdd.ts';
import { AppGraphNode, GraphEdge } from '../../../graphs/index.ts';
import {
  testDatabaseGeneration,
  testDatabaseIntegration,
  testDeploymentGeneration,
  testIngressGeneration,
  testSecretGeneration,
  testSecretIntegration,
  testServiceGeneration,
  testServiceIntegration,
} from '../../__tests__/version-helper.ts';
import { ComponentSchema } from '../../schema.ts';
import ComponentV1 from '../index.ts';

describe('Component Schema: v1', () => {
  it('should generate deployments', () =>
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

  it('should generate build steps', () => {
    const component = new ComponentV1(yaml.load(
      `
      name: account/component
      services:
        api:
          build:
            context: ./
    `,
    ) as ComponentSchema);
    const graph = component.getGraph({
      component: {
        name: 'account/component',
        source: 'fake/source',
      },
      environment: 'account/environment',
    });

    const build_node = new AppGraphNode({
      name: 'api',
      type: 'dockerBuild',
      component: 'account/component',
      inputs: {
        context: './',
        component_source: 'fake/source',
        repository: 'account/component',
      },
    });

    const deployment_node = new AppGraphNode({
      name: 'api',
      component: 'account/component',
      type: 'deployment',
      inputs: {
        name: `account--component--api`,
        replicas: 1,
        image: `\${{ ${build_node.getId()}.id }}`,
        volume_mounts: [],
      },
    });

    assertArrayIncludes(graph.nodes, [deployment_node]);
  });

  it('should create edge for explicit depends_on', () => {
    const component = new ComponentV1(yaml.load(
      `
      name: account/component
      services:
        api:
          image: nginx:latest
        app:
          image: nginx:latest
          depends_on:
            - api
    `,
    ) as ComponentSchema);
    const graph = component.getGraph({
      component: {
        name: 'account/component',
        source: 'fake/source',
      },
      environment: 'account/environment',
    });

    const api_node = new AppGraphNode({
      name: 'api',
      type: 'deployment',
      component: 'account/component',
      inputs: {
        name: `account--component--api`,
        replicas: 1,
        image: 'nginx:latest',
        volume_mounts: [],
      },
    });

    const app_node = new AppGraphNode({
      name: 'app',
      type: 'deployment',
      component: 'account/component',
      inputs: {
        name: `account--component--app`,
        replicas: 1,
        image: 'nginx:latest',
        volume_mounts: [],
      },
    });

    assertArrayIncludes(graph.nodes, [api_node, app_node]);
    assertArrayIncludes(graph.edges, [
      new GraphEdge({
        from: app_node.getId(),
        to: api_node.getId(),
      }),
    ]);
  });

  it('should inject environment name', () => {
    const component = new ComponentV1(yaml.load(
      `
      name: account/component
      services:
        api:
          image: nginx:latest
          environment:
            NAME: \${{ environment.name }}
    `,
    ) as ComponentSchema);
    const graph = component.getGraph({
      component: {
        name: 'account/component',
        source: 'fake/source',
      },
      environment: 'account/environment',
    });

    const deployment_node = new AppGraphNode({
      name: 'api',
      type: 'deployment',
      component: 'account/component',
      inputs: {
        name: `account--component--api`,
        replicas: 1,
        image: 'nginx:latest',
        volume_mounts: [],
        environment: {
          NAME: `account/environment`,
        },
      },
    });

    assertArrayIncludes(graph.nodes, [deployment_node]);
  });

  it('should generate build steps', () => {
    const component = new ComponentV1(yaml.load(
      `
      name: account/component
      services:
        api:
          build:
            context: ./
    `,
    ) as ComponentSchema);
    const graph = component.getGraph({
      component: {
        name: 'account/component',
        source: 'fake/source',
      },
      environment: 'account/environment',
    });

    const build_node = new AppGraphNode({
      name: 'api',
      type: 'dockerBuild',
      component: 'account/component',
      inputs: {
        context: './',
        component_source: 'fake/source',
        repository: 'account/component',
      },
    });

    const deployment_node = new AppGraphNode({
      name: 'api',
      type: 'deployment',
      component: 'account/component',
      inputs: {
        name: 'account--component--api',
        replicas: 1,
        image: `\${{ ${build_node.getId()}.id }}`,
        volume_mounts: [],
      },
    });

    assertArrayIncludes(graph.nodes, [deployment_node]);
  });

  it('should generate services', () =>
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

  it('should generate ingresses', () =>
    testIngressGeneration(
      `
      name: test
      services:
        api:
          image: nginx:1.14.2
          interfaces:
            main:
              port: 80
              ingress: {}
      `,
      ComponentV1,
      { deployment_name: 'api', service_name: 'api-main', ingress_name: 'api-main' },
    ));

  it('should connect deployments to services', () =>
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

  it('should create interface nodes', () => {
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

    const deployment_node_id = 'test--api';

    const interface_node = new AppGraphNode({
      name: 'api',
      type: 'service',
      component: 'test',
      inputs: {
        protocol: 'http',
        deployment: 'test--api',
        port: 80,
      },
    });

    assertArrayIncludes(graph.nodes, [interface_node]);
    assertArrayIncludes(graph.edges, [
      new GraphEdge({
        from: interface_node.getId(),
        to: deployment_node_id,
      }),
    ]);
  });

  it('should generate variables', () =>
    testSecretGeneration(
      `
        name: test
        variables:
          DB_HOST:
            description: The host for the database
      `,
      ComponentV1,
      {
        secret_name: 'DB_HOST',
        data: '',
      },
    ));

  it('should connect services to variables', () =>
    testSecretIntegration(
      `
      name: test
      variables:
        DB_HOST:
          description: The host for the database
      services:
        main:
          image: nginx:1.14.2
          environment:
            DB_DSN: \${{ variables.DB_HOST }}
      `,
      ComponentV1,
      {
        secret_name: 'DB_HOST',
        deployment_name: 'main',
      },
    ));

  it('should create ingress nodes for root interfaces', () => {
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
      `) as ComponentSchema,
    );

    const graph = component.getGraph({
      component: {
        name: 'test',
        source: 'fake/repo',
      },
      environment: 'test',
    });

    const interface_node = new AppGraphNode({
      name: 'api',
      type: 'service',
      component: 'test',
      inputs: {
        protocol: 'http',
        deployment: 'test--api',
        port: 80,
      },
    });

    const ingress_node = new AppGraphNode({
      name: 'api',
      type: 'ingress',
      component: 'test',
      inputs: {
        subdomain: 'app',
        protocol: `\${{ ${interface_node.getId()}.protocol }}`,
        service: {
          host: `\${{ ${interface_node.getId()}.host }}`,
          port: `\${{ ${interface_node.getId()}.port }}`,
          protocol: `\${{ ${interface_node.getId()}.protocol }}`,
        },
        port: `\${{ ${interface_node.getId()}.port }}`,
        internal: false,
        path: '/',
      },
    });

    assertArrayIncludes(graph.nodes, [interface_node, ingress_node]);

    assertArrayIncludes(graph.edges, [
      new GraphEdge({
        from: ingress_node.getId(),
        to: interface_node.getId(),
      }),
    ]);
  });

  it('should create ingress nodes for service interfaces', () => {
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
      `) as ComponentSchema,
    );

    const graph = component.getGraph({
      component: {
        name: 'test',
        source: 'fake/repo',
      },
      environment: 'test',
    });

    const service_node = new AppGraphNode({
      name: `api-main`,
      type: 'service',
      component: 'test',
      inputs: {
        protocol: 'http',
        deployment: 'test--api',
        port: 80,
      },
    });

    const ingress_node = new AppGraphNode({
      name: 'api-main',
      component: 'test',
      type: 'ingress',
      inputs: {
        subdomain: 'app',
        username: `\${{ ${service_node.getId()}.username }}`,
        password: `\${{ ${service_node.getId()}.password }}`,
        protocol: `\${{ ${service_node.getId()}.protocol }}`,
        service: {
          host: `\${{ ${service_node.getId()}.host }}`,
          port: `\${{ ${service_node.getId()}.port }}`,
          protocol: `\${{ ${service_node.getId()}.protocol }}`,
        },
        port: `\${{ ${service_node.getId()}.port }}`,
        internal: false,
        path: '/',
      },
    });

    assertArrayIncludes(graph.nodes, [service_node, ingress_node]);

    assertArrayIncludes(graph.edges, [
      new GraphEdge({
        from: ingress_node.getId(),
        to: service_node.getId(),
      }),
    ]);
  });

  it('should generate databases', () =>
    testDatabaseGeneration(
      `
        databases:
          main:
            type: postgres:13
      `,
      ComponentV1,
      {
        database_name: 'main',
        database_type: 'postgres',
        database_version: '13',
      },
    ));

  it('should connect services to databases', () =>
    testDatabaseIntegration(
      `
      databases:
        main:
          type: postgres:13
      services:
        main:
          image: nginx:1.14.2
          environment:
            DB_DSN: \${{ databases.main.dsn }}
      `,
      ComponentV1,
      {
        database_name: 'main',
        deployment_name: 'main',
      },
    ));
});
