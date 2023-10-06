import yaml from 'js-yaml';
import { assertArrayIncludes } from 'std/testing/asserts.ts';
import { describe, it } from 'std/testing/bdd.ts';
import { AppEdge, AppNode } from '../../../app-graph/index.ts';
import {
  testDatabaseGeneration,
  testDatabaseIntegration,
  testDeploymentGeneration,
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

    const build_node = new AppNode({
      name: 'api',
      component: 'account/component',
      environment: 'account/environment',
      inputs: {
        type: 'dockerBuild',
        context: './',
        component_source: 'fake/source',
        repository: 'account/component',
      },
    });

    const deployment_node = new AppNode({
      name: 'api',
      component: 'account/component',
      environment: 'account/environment',
      inputs: {
        type: 'deployment',
        name: AppNode.genResourceId({
          name: 'api',
          component: 'account/component',
          environment: 'account/environment',
        }),
        replicas: 1,
        image: `\${{ ${build_node.id}.id }}`,
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

    const api_node = new AppNode({
      name: 'api',
      component: 'account/component',
      environment: 'account/environment',
      inputs: {
        type: 'deployment',
        name: AppNode.genResourceId({
          name: 'api',
          component: 'account/component',
          environment: 'account/environment',
        }),
        replicas: 1,
        image: 'nginx:latest',
        volume_mounts: [],
      },
    });

    const app_node = new AppNode({
      name: 'app',
      component: 'account/component',
      environment: 'account/environment',
      inputs: {
        type: 'deployment',
        name: AppNode.genResourceId({
          name: 'app',
          component: 'account/component',
          environment: 'account/environment',
        }),
        replicas: 1,
        image: 'nginx:latest',
        volume_mounts: [],
      },
    });

    assertArrayIncludes(graph.nodes, [api_node, app_node]);
    assertArrayIncludes(graph.edges, [
      new AppEdge({
        from: app_node.id,
        to: api_node.id,
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

    const deployment_node = new AppNode({
      name: 'api',
      component: 'account/component',
      environment: 'account/environment',
      inputs: {
        type: 'deployment',
        name: AppNode.genResourceId({
          name: 'api',
          component: 'account/component',
          environment: 'account/environment',
        }),
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

    const build_node = new AppNode({
      name: 'api',
      component: 'account/component',
      environment: 'account/environment',
      inputs: {
        type: 'dockerBuild',
        context: './',
        component_source: 'fake/source',
        repository: 'account/component',
      },
    });

    const deployment_node = new AppNode({
      name: 'api',
      component: 'account/component',
      environment: 'account/environment',
      inputs: {
        type: 'deployment',
        name: AppNode.genResourceId({
          name: 'api',
          component: 'account/component',
          environment: 'account/environment',
        }),
        replicas: 1,
        image: `\${{ ${build_node.id}.id }}`,
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

    const deployment_node_id = AppNode.genId({
      type: 'deployment',
      name: 'api',
      component: 'test',
      environment: 'test',
    });

    const interface_node = new AppNode({
      name: 'api',
      component: 'test',
      environment: 'test',
      inputs: {
        type: 'service',
        name: AppNode.genResourceId({
          name: 'api',
          component: 'test',
          environment: 'test',
        }),
        target_protocol: 'http',
        target_deployment: AppNode.genResourceId({
          name: 'api',
          component: 'test',
          environment: 'test',
        }),
        target_port: 80,
      },
    });

    assertArrayIncludes(graph.nodes, [interface_node]);
    assertArrayIncludes(graph.edges, [
      new AppEdge({
        from: interface_node.id,
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

    const interface_node = new AppNode({
      name: 'api',
      component: 'test',
      environment: 'test',
      inputs: {
        type: 'service',
        name: AppNode.genResourceId({
          name: 'api',
          component: 'test',
          environment: 'test',
        }),
        target_protocol: 'http',
        target_deployment: AppNode.genResourceId({
          name: 'api',
          component: 'test',
          environment: 'test',
        }),
        target_port: 80,
      },
    });

    const ingress_node = new AppNode({
      name: 'api',
      component: 'test',
      environment: 'test',
      inputs: {
        type: 'ingressRule',
        registry: '',
        subdomain: 'app',
        path: '/',
        protocol: `\${{ ${interface_node.id}.protocol }}`,
        service: `\${{ ${interface_node.id}.id }}`,
        port: 80,
        internal: false,
        name: AppNode.genResourceId({
          name: 'api',
          component: 'test',
          environment: 'test',
        }),
      },
    });

    assertArrayIncludes(graph.nodes, [interface_node, ingress_node]);

    assertArrayIncludes(graph.edges, [
      new AppEdge({
        from: ingress_node.id,
        to: interface_node.id,
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

    const service_node = new AppNode({
      name: `api-main`,
      component: 'test',
      environment: 'test',
      inputs: {
        type: 'service',
        name: AppNode.genResourceId({
          name: 'api-main',
          component: 'test',
          environment: 'test',
        }),
        target_protocol: 'http',
        target_deployment: AppNode.genResourceId({
          name: 'api',
          component: 'test',
          environment: 'test',
        }),
        target_port: 80,
      },
    });

    const ingress_node = new AppNode({
      name: 'api-main',
      component: 'test',
      environment: 'test',
      inputs: {
        type: 'ingressRule',
        registry: '',
        subdomain: 'app',
        path: '/',
        username: `\${{ ${service_node.id}.username }}`,
        password: `\${{ ${service_node.id}.password }}`,
        protocol: `\${{ ${service_node.id}.protocol }}`,
        service: `\${{ ${service_node.id}.id }}`,
        port: 80,
        internal: false,
        name: AppNode.genResourceId({
          name: 'api-main',
          component: 'test',
          environment: 'test',
        }),
      },
    });

    assertArrayIncludes(graph.nodes, [service_node, ingress_node]);

    assertArrayIncludes(graph.edges, [
      new AppEdge({
        from: ingress_node.id,
        to: service_node.id,
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
