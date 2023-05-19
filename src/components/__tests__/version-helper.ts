import { CloudEdge, CloudNode } from '../../cloud-graph';
import { Component } from '../component';
import yaml from 'js-yaml';

export const testDatabaseGeneration = async (
  contents: string,
  constructor: new (data: object) => Component,
  options: {
    database_name: string;
    database_type: string;
    database_version: string;
  },
): Promise<void> => {
  const component = new constructor(yaml.load(contents) as any);
  const graph = component.getGraph({
    component: {
      name: 'component',
      source: 'fake/source',
    },
    environment: 'environment',
  });

  const database_schema = new CloudNode({
    name: options.database_name,
    component: 'component',
    environment: 'environment',
    inputs: {
      type: 'databaseSchema',
      name: CloudNode.genResourceId({
        name: options.database_name,
        component: 'component',
        environment: 'environment',
      }),
      database: '',
      databaseType: options.database_type,
      databaseVersion: options.database_version,
    },
  });

  expect(graph.nodes).toEqual(expect.arrayContaining([database_schema]));
};

export const testDatabaseIntegration = async (
  contents: string,
  constructor: new (data: object) => Component,
  options: { database_name: string; deployment_name: string },
): Promise<void> => {
  const component = new constructor(yaml.load(contents) as any);
  const graph = component.getGraph({
    component: {
      name: 'component',
      source: 'fake/source',
    },
    environment: 'environment',
  });

  const database_schema_node_id = CloudNode.genId({
    type: 'databaseSchema',
    name: options.database_name,
    component: 'component',
    environment: 'environment',
  });

  const database_user_node = new CloudNode({
    name: `deployment-${options.deployment_name}/${options.database_name}`,
    component: 'component',
    environment: 'environment',
    inputs: {
      type: 'databaseUser',
      username: options.deployment_name,
      databaseSchema: `\${{ ${database_schema_node_id}.id }}`,
      provider: `\${{ ${database_schema_node_id}.provider }}`,
    },
  });

  const deployment_node = new CloudNode({
    name: options.deployment_name,
    component: 'component',
    environment: 'environment',
    inputs: {
      type: 'deployment',
      name: CloudNode.genResourceId({
        name: options.deployment_name,
        component: 'component',
        environment: 'environment',
      }),
      replicas: 1,
      image: 'nginx:1.14.2',
      volume_mounts: [],
      environment: {
        DB_DSN: `\${{ ${database_user_node.id}.dsn }}`,
      },
    },
  });

  expect(graph.nodes).toEqual(
    expect.arrayContaining([database_user_node, deployment_node]),
  );
  expect(graph.edges).toEqual(
    expect.arrayContaining([
      new CloudEdge({
        from: database_user_node.id,
        to: database_schema_node_id,
        required: true,
      }),
      new CloudEdge({
        from: deployment_node.id,
        to: database_user_node.id,
        required: true,
      }),
    ]),
  );
};

export const testDeploymentGeneration = async (
  contents: string,
  constructor: new (data: object) => Component,
  options: { deployment_name: string },
): Promise<void> => {
  const component = new constructor(yaml.load(contents) as any);
  const graph = component.getGraph({
    component: {
      name: 'test',
      source: 'fake/source',
    },
    environment: 'test',
  });

  const deployment_node = new CloudNode({
    name: options.deployment_name,
    component: 'test',
    environment: 'test',
    inputs: {
      type: 'deployment',
      name: CloudNode.genResourceId({
        name: options.deployment_name,
        component: 'test',
        environment: 'test',
      }),
      replicas: 1,
      image: 'nginx:1.14.2',
      volume_mounts: [],
    },
  });

  expect(graph.nodes).toEqual([deployment_node]);
};

export const testServiceGeneration = async (
  contents: string,
  constructor: new (data: object) => Component,
  options: { deployment_name: string; service_name: string },
): Promise<void> => {
  const component = new constructor(yaml.load(contents) as any);
  const graph = component.getGraph({
    component: {
      name: 'component',
      source: 'fake/source',
    },
    environment: 'environment',
  });

  const service_node = new CloudNode({
    name: options.service_name,
    component: 'component',
    environment: 'environment',
    inputs: {
      type: 'service',
      name: CloudNode.genResourceId({
        name: options.service_name,
        component: 'component',
        environment: 'environment',
      }),
      protocol: 'http',
      selector: CloudNode.genResourceId({
        name: options.deployment_name,
        component: 'component',
        environment: 'environment',
      }),
      target_port: 80,
    },
  });

  expect(graph.nodes).toEqual(expect.arrayContaining([service_node]));
  expect(graph.edges).toEqual(
    expect.arrayContaining([
      new CloudEdge({
        from: service_node.id,
        to: CloudNode.genId({
          type: 'deployment',
          name: options.deployment_name,
          component: 'component',
          environment: 'environment',
        }),
        required: false,
      }),
    ]),
  );
};

export const testServiceIntegration = async (
  contents: string,
  constructor: new (data: object) => Component,
  options: {
    service_name: string;
    deployment_name: string;
  },
): Promise<void> => {
  const component = new constructor(yaml.load(contents) as any);
  const graph = component.getGraph({
    component: {
      name: 'component',
      source: 'fake/source',
    },
    environment: 'environment',
  });

  const first_service_node_id = CloudNode.genId({
    type: 'service',
    name: options.service_name,
    component: 'component',
    environment: 'environment',
  });

  const second_deployment_node = new CloudNode({
    name: options.deployment_name,
    component: 'component',
    environment: 'environment',
    inputs: {
      type: 'deployment',
      name: CloudNode.genResourceId({
        name: options.deployment_name,
        component: 'component',
        environment: 'environment',
      }),
      replicas: 1,
      image: 'nginx:1.14.2',
      volume_mounts: [],
      environment: {
        FIRST_ADDR: `\${{ ${first_service_node_id}.url }}`,
      },
    },
  });

  expect(graph.nodes).toEqual(expect.arrayContaining([second_deployment_node]));
  expect(graph.edges).toEqual(
    expect.arrayContaining([
      new CloudEdge({
        from: second_deployment_node.id,
        to: first_service_node_id,
        required: true,
      }),
    ]),
  );
};
