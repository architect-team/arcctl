import { prepareVirtualFile } from 'https://deno.land/x/mock_file@v1.1.2/mod.ts';
import yaml from 'js-yaml';
import { assertArrayIncludes, assertEquals } from 'std/testing/asserts.ts';
import { describe, it } from 'std/testing/bdd.ts';
import { GraphEdge } from '../../../graphs/edge.ts';
import { AppGraphNode } from '../../../graphs/index.ts';
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
import ComponentV2 from '../index.ts';

describe('Component Schema: v2', () => {
  it('should generate deployments', () =>
    testDeploymentGeneration(
      `
      version: v2
      deployments:
        api:
          image: nginx:1.14.2
    `,
      ComponentV2,
      {
        deployment_name: 'api',
      },
    ));

  it('should generate services', () =>
    testServiceGeneration(
      `
      version: v2
      deployments:
        api:
          image: nginx:1.14.2
      services:
        api:
          deployment: api
          port: 80
      `,
      ComponentV2,
      { deployment_name: 'api', service_name: 'api' },
    ));

  it('should generate ingresses', () =>
    testIngressGeneration(
      `
      version: v2
      deployments:
        api:
          image: nginx:1.14.2
      services:
        api:
          deployment: api
          port: 80
      ingresses:
        api:
          service: api
      `,
      ComponentV2,
      { deployment_name: 'api', service_name: 'api', ingress_name: 'api' },
    ));

  it('should connect deployments to services', () =>
    testServiceIntegration(
      `
      version: v2
      deployments:
        first:
          image: nginx:1.14.2
        second:
          image: nginx:1.14.2
          environment:
            FIRST_ADDR: \${{ services.first.url }}

      services:
        first:
          deployment: first
          port: 80
    `,
      ComponentV2,
      {
        deployment_name: 'second',
        service_name: 'first',
      },
    ));

  it('should support build steps', () => {
    const component = new ComponentV2(
      yaml.load(`
        name: test
        builds:
          test:
            context: ./
      `) as ComponentSchema,
    );

    const graph = component.getGraph({
      component: {
        name: 'component',
        source: 'fake/source',
      },
      environment: 'environment',
    });

    const build_node = new AppGraphNode({
      name: 'test',
      type: 'dockerBuild',
      component: 'component',
      inputs: {
        repository: 'component',
        context: './',
        args: {},
        component_source: 'fake/source',
        dockerfile: 'Dockerfile',
      },
    });

    assertArrayIncludes(graph.nodes, [build_node]);
  });

  it('should generate variables', () =>
    testSecretGeneration(
      `
        variables:
          DB_HOST:
            description: The host for the database
      `,
      ComponentV2,
      {
        secret_name: 'DB_HOST',
        data: '',
      },
    ));

  it('should connect deployments to variables', () =>
    testSecretIntegration(
      `
      variables:
        DB_HOST:
          description: The host for the database
      deployments:
        main:
          image: nginx:1.14.2
          environment:
            DB_DSN: \${{ variables.DB_HOST }}
      `,
      ComponentV2,
      {
        secret_name: 'DB_HOST',
        deployment_name: 'main',
      },
    ));

  it('should generate databases', () =>
    testDatabaseGeneration(
      `
        databases:
          main:
            type: postgres:13
      `,
      ComponentV2,
      {
        database_name: 'main',
        database_type: 'postgres',
        database_version: '13',
      },
    ));

  it('should connect deployments to databases', () =>
    testDatabaseIntegration(
      `
      databases:
        main:
          type: postgres:13
      deployments:
        main:
          image: nginx:1.14.2
          environment:
            DB_DSN: \${{ databases.main.dsn }}
      `,
      ComponentV2,
      {
        database_name: 'main',
        deployment_name: 'main',
      },
    ));

  it('should create debug volumes', () => {
    const component = new ComponentV2(yaml.load(`
      deployments:
        main:
          image: nginx:latest
          debug:
            volumes:
              src:
                host_path: ./src
                mount_path: /app/src
    `) as ComponentSchema);
    prepareVirtualFile('/fake/source/architect.yml');
    const graph = component.getGraph({
      component: {
        name: 'component',
        source: '/fake/source/architect.yml',
        debug: true,
      },
      environment: 'environment',
    });

    const volume_node = new AppGraphNode({
      name: 'main-src',
      type: 'volume',
      component: 'component',
      inputs: {
        name: 'component/main-src',
        hostPath: '/fake/source/src',
      },
    });

    const deployment_node = new AppGraphNode({
      name: 'main',
      type: 'deployment',
      component: 'component',
      inputs: {
        name: 'component--main',
        replicas: 1,
        image: 'nginx:latest',
        volume_mounts: [{
          mount_path: '/app/src',
          volume: `\${{ ${volume_node.getId()}.id }}`,
          readonly: false,
        }],
      },
    });

    assertArrayIncludes(graph.nodes, [volume_node, deployment_node]);
    assertArrayIncludes(graph.edges, [
      new GraphEdge({
        from: deployment_node.getId(),
        to: volume_node.getId(),
      }),
    ]);
  });

  it('should ignore debug volumes when not debugging', () => {
    const component = new ComponentV2(yaml.load(`
      deployments:
        main:
          image: nginx:latest
          debug:
            volumes:
              src:
                host_path: ./src
                mount_path: /app/src
    `) as ComponentSchema);
    const graph = component.getGraph({
      component: {
        name: 'component',
        source: 'fake/source',
      },
      environment: 'environment',
    });

    const deployment_node = new AppGraphNode({
      name: 'main',
      type: 'deployment',
      component: 'component',
      inputs: {
        name: 'component--main',
        replicas: 1,
        image: 'nginx:latest',
        volume_mounts: [],
      },
    });

    assertEquals(graph.nodes, [deployment_node]);
    assertEquals(graph.edges, []);
  });

  it('should inject environment name', () => {
    const component = new ComponentV2(yaml.load(`
      deployments:
        main:
          image: nginx:latest
          environment:
            NAME: \${{ environment.name }}
    `) as ComponentSchema);
    prepareVirtualFile('/fake/source/architect.yml');
    const graph = component.getGraph({
      component: {
        name: 'component',
        source: '/fake/source/architect.yml',
        debug: true,
      },
      environment: 'environment',
    });
    const deployment_node = new AppGraphNode({
      name: 'main',
      type: 'deployment',
      component: 'component',
      inputs: {
        name: 'component--main',
        replicas: 1,
        image: 'nginx:latest',
        volume_mounts: [],
        environment: {
          NAME: 'environment',
        },
      },
    });

    assertArrayIncludes(graph.nodes, [deployment_node]);
  });

  it('should replace references with hyphens', () => {
    const component = new ComponentV2(yaml.load(`
      deployments:
        kratos-main:
          image: nginx:latest
          environment:
            CONFIG: |
              version: v0.13.0
              serve:
                public:
                  base_url: \${{ ingresses.kratos-main.dns_zone }}
      services:
        kratos-main:
          deployment: kratos-main
          port: 8080
      ingresses:
        kratos-main:
          service: kratos-main
    `) as ComponentSchema);
    prepareVirtualFile('/fake/source/architect.yml');

    const graph = component.getGraph({
      component: {
        name: 'component',
        source: '/fake/source/architect.yml',
        debug: true,
      },
      environment: 'environment',
    });

    const svc_node = new AppGraphNode({
      name: 'kratos-main',
      type: 'service',
      component: 'component',
      inputs: {
        port: 8080,
        protocol: 'http',
        deployment: `component--kratos-main`,
      },
    });

    const ing_node = new AppGraphNode({
      name: 'kratos-main',
      type: 'ingress',
      component: 'component',
      inputs: {
        port: `\${{ ${svc_node.getId()}.port }}`,
        username: `\${{ ${svc_node.getId()}.username }}`,
        password: `\${{ ${svc_node.getId()}.password }}`,
        protocol: `\${{ ${svc_node.getId()}.protocol }}`,
        service: {
          name: `\${{ ${svc_node.getId()}.name }}`,
          host: `\${{ ${svc_node.getId()}.host }}`,
          port: `\${{ ${svc_node.getId()}.port }}`,
          protocol: `\${{ ${svc_node.getId()}.protocol }}`,
        },
        internal: false,
        path: '/',
      },
    });

    const dep_node = new AppGraphNode({
      name: 'kratos-main',
      component: 'component',
      type: 'deployment',
      inputs: {
        name: 'component--kratos-main',
        replicas: 1,
        image: 'nginx:latest',
        volume_mounts: [],
        environment: {
          CONFIG: `version: v0.13.0
serve:
  public:
    base_url: \${{ ${ing_node.getId()}.dns_zone }}\n`,
        },
        services: [
          {
            name: `\${{ ${svc_node.getId()}.name }}`,
            host: `\${{ ${svc_node.getId()}.host }}`,
            port: `\${{ ${svc_node.getId()}.port }}`,
            protocol: `\${{ ${svc_node.getId()}.protocol }}`,
          },
        ],
        ingresses: [
          {
            service: `\${{ ${svc_node.getId()}.name }}`,
            host: `\${{ ${ing_node.getId()}.host }}`,
            port: `\${{ ${ing_node.getId()}.port }}`,
            protocol: `\${{ ${ing_node.getId()}.protocol }}`,
            path: `\${{ ${ing_node.getId()}.path }}`,
            subdomain: `\${{ ${ing_node.getId()}.subdomain }}`,
            dns_zone: `\${{ ${ing_node.getId()}.dns_zone }}`,
          },
        ],
      },
    });

    assertArrayIncludes(graph.nodes, [dep_node, svc_node, ing_node]);
  });
});
