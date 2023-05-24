import { CloudNode } from '../../../cloud-graph/index.ts';
import {
  testDatabaseGeneration,
  testDatabaseIntegration,
  testDeploymentGeneration,
  testServiceGeneration,
  testServiceIntegration,
} from '../../__tests__/version-helper';
import ComponentV2 from '../index.ts';
import yaml from 'js-yaml';

describe('Component Schema: v2', () => {
  it('should generate deployments', async () =>
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

  it('should generate services', async () =>
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

  it('should connect deployments to services', async () =>
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

  it('should support build steps', async () => {
    const component = new ComponentV2(
      yaml.load(`
        name: test
        builds:
          test:
            context: ./
      `) as any,
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

    expect(graph.nodes).toEqual(expect.arrayContaining([build_node]));
  });

  it('should generate databases', async () =>
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

  it('should connect deployments to databases', async () =>
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
});
