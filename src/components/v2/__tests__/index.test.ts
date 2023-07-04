import { prepareVirtualFile } from 'https://deno.land/x/mock_file@v1.1.2/mod.ts';
import yaml from 'js-yaml';
import { assertArrayIncludes, assertEquals } from 'std/testing/asserts.ts';
import { describe, it } from 'std/testing/bdd.ts';
import { CloudEdge, CloudNode } from '../../../cloud-graph/index.ts';
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

    const build_node = new CloudNode({
      name: 'test',
      component: 'component',
      environment: 'environment',
      inputs: {
        type: 'dockerBuild',
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

    const volume_node = new CloudNode({
      name: 'main-src',
      component: 'component',
      environment: 'environment',
      inputs: {
        type: 'volume',
        name: CloudNode.genResourceId({
          name: 'main-src',
          component: 'component',
          environment: 'environment',
        }),
        hostPath: '/fake/source/src',
      },
    });

    const deployment_node = new CloudNode({
      name: 'main',
      component: 'component',
      environment: 'environment',
      inputs: {
        type: 'deployment',
        name: CloudNode.genResourceId({
          name: 'main',
          component: 'component',
          environment: 'environment',
        }),
        replicas: 1,
        image: 'nginx:latest',
        volume_mounts: [{
          mount_path: '/app/src',
          volume: `\${{ ${volume_node.id}.id }}`,
          readonly: false,
        }],
      },
    });

    assertArrayIncludes(graph.nodes, [volume_node, deployment_node]);
    assertArrayIncludes(graph.edges, [
      new CloudEdge({
        from: deployment_node.id,
        to: volume_node.id,
        required: true,
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

    const deployment_node = new CloudNode({
      name: 'main',
      component: 'component',
      environment: 'environment',
      inputs: {
        type: 'deployment',
        name: CloudNode.genResourceId({
          name: 'main',
          component: 'component',
          environment: 'environment',
        }),
        replicas: 1,
        image: 'nginx:latest',
        volume_mounts: [],
      },
    });

    assertEquals(graph.nodes, [deployment_node]);
    assertEquals(graph.edges, []);
  });
});
