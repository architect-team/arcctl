import yaml from 'js-yaml';
import { assertArrayIncludes } from 'std/testing/asserts.ts';
import { AppGraphNode, GraphEdge } from '../../graphs/index.ts';
import { Component } from '../component.ts';
import { ComponentSchema } from '../schema.ts';

export const testSecretGeneration = (
  contents: string,
  constructor: new (data: ComponentSchema) => Component,
  options: { secret_name: string; data: string },
): void => {
  const component = new constructor(yaml.load(contents) as any);
  const graph = component.getGraph({
    component: {
      name: 'test',
      source: 'fake/source',
    },
    environment: 'test',
  });

  const secret_node = new AppGraphNode({
    name: options.secret_name,
    type: 'secret',
    component: 'test',
    inputs: {
      data: '',
    },
  });

  assertArrayIncludes(graph.nodes, [secret_node]);
};

export const testSecretIntegration = (
  contents: string,
  constructor: new (data: ComponentSchema) => Component,
  options: { secret_name: string; deployment_name: string },
): void => {
  const component = new constructor(yaml.load(contents) as any);
  const graph = component.getGraph({
    component: {
      name: 'component',
      source: 'fake/source',
    },
    environment: 'environment',
  });

  const secret_node = new AppGraphNode({
    name: options.secret_name,
    type: 'secret',
    component: 'component',
    inputs: {
      data: '',
    },
  });

  const deployment_node = new AppGraphNode({
    name: options.deployment_name,
    type: 'deployment',
    component: 'component',
    inputs: {
      replicas: 1,
      image: 'nginx:1.14.2',
      volume_mounts: [],
      environment: {
        DB_DSN: `\${{ ${secret_node.getId()}.data }}`,
      },
    },
  });
  assertArrayIncludes(graph.nodes, [secret_node, deployment_node]);
  assertArrayIncludes(graph.edges, [
    new GraphEdge({
      from: deployment_node.getId(),
      to: secret_node.getId(),
    }),
  ]);
};

export const testDatabaseGeneration = (
  contents: string,
  constructor: new (data: ComponentSchema) => Component,
  options: {
    database_name: string;
    database_type: string;
    database_version: string;
  },
): void => {
  const component = new constructor(yaml.load(contents) as any);
  const graph = component.getGraph({
    component: {
      name: 'component',
      source: 'fake/source',
    },
    environment: 'environment',
  });

  const database_schema = new AppGraphNode({
    name: options.database_name,
    type: 'database',
    component: 'component',
    inputs: {
      name: `component/${options.database_name}`,
      databaseType: options.database_type,
      databaseVersion: options.database_version,
    },
  });

  assertArrayIncludes(graph.nodes, [database_schema]);
};

export const testDatabaseIntegration = (
  contents: string,
  constructor: new (data: ComponentSchema) => Component,
  options: { database_name: string; deployment_name: string },
): void => {
  const component = new constructor(yaml.load(contents) as ComponentSchema);
  const graph = component.getGraph({
    component: {
      name: 'component',
      source: 'fake/source',
    },
    environment: 'environment',
  });

  const database_schema_node_id = `component/database/${options.database_name}`;

  const deployment_node_id = `component/deployment/${options.deployment_name}`;

  const name = `${deployment_node_id}/${options.database_name}`;
  const database_user_node = new AppGraphNode({
    name,
    type: 'databaseUser',
    component: 'component',
    inputs: {
      username: name.replaceAll('/', '--'),
      database: `\${{ ${database_schema_node_id}.id }}`,
    },
  });

  const deployment_node = new AppGraphNode({
    name: options.deployment_name,
    type: 'deployment',
    component: 'component',
    inputs: {
      replicas: 1,
      image: 'nginx:1.14.2',
      volume_mounts: [],
      environment: {
        DB_DSN: `\${{ ${database_user_node.getId()}.dsn }}`,
      },
    },
  });

  assertArrayIncludes(graph.nodes, [database_user_node, deployment_node]);
  assertArrayIncludes(graph.edges, [
    new GraphEdge({
      from: database_user_node.getId(),
      to: database_schema_node_id,
    }),
    new GraphEdge({
      from: deployment_node.getId(),
      to: database_user_node.getId(),
    }),
  ]);
};

export const testDeploymentGeneration = (
  contents: string,
  constructor: new (data: ComponentSchema) => Component,
  options: { deployment_name: string },
): void => {
  const component = new constructor(yaml.load(contents) as ComponentSchema);
  const graph = component.getGraph({
    component: {
      name: 'test',
      source: 'fake/source',
    },
    environment: 'test',
  });

  const deployment_node = new AppGraphNode({
    name: options.deployment_name,
    type: 'deployment',
    component: 'test',
    inputs: {
      replicas: 1,
      image: 'nginx:1.14.2',
      volume_mounts: [],
    },
  });

  assertArrayIncludes(graph.nodes, [deployment_node]);
};

export const testServiceGeneration = (
  contents: string,
  constructor: new (data: ComponentSchema) => Component,
  options: { deployment_name: string; service_name: string },
): void => {
  const component = new constructor(yaml.load(contents) as ComponentSchema);
  const graph = component.getGraph({
    component: {
      name: 'component',
      source: 'fake/source',
    },
    environment: 'environment',
  });

  const service_node = new AppGraphNode({
    name: options.service_name,
    type: 'service',
    component: 'component',
    inputs: {
      name: `component/${options.service_name}`,
      target_protocol: 'http',
      target_deployment: `component/${options.deployment_name}`,
      target_port: 80,
    },
  });

  const deployment_node = new AppGraphNode({
    name: options.deployment_name,
    type: 'deployment',
    component: 'component',
    inputs: {
      image: 'nginx:1.14.2',
      replicas: 1,
      services: [
        {
          id: `\${{ ${service_node.getId()}.id }}`,
          port: `\${{ ${service_node.getId()}.target_port }}`,
        },
      ],
      volume_mounts: [],
    },
  });

  assertArrayIncludes(graph.nodes, [deployment_node, service_node]);
  assertArrayIncludes(graph.edges, [
    new GraphEdge({
      from: deployment_node.getId(),
      to: service_node.getId(),
    }),
  ]);
};

export const testServiceIntegration = (
  contents: string,
  constructor: new (data: ComponentSchema) => Component,
  options: {
    service_name: string;
    deployment_name: string;
  },
): void => {
  const component = new constructor(yaml.load(contents) as ComponentSchema);
  const graph = component.getGraph({
    component: {
      name: 'component',
      source: 'fake/source',
    },
    environment: 'environment',
  });

  const first_service_node_id = `component/service/${options.service_name}`;

  const second_deployment_node = new AppGraphNode({
    name: options.deployment_name,
    type: 'deployment',
    component: 'component',
    inputs: {
      replicas: 1,
      image: 'nginx:1.14.2',
      volume_mounts: [],
      environment: {
        FIRST_ADDR: `\${{ ${first_service_node_id}.url }}`,
      },
    },
  });

  assertArrayIncludes(graph.nodes, [second_deployment_node]);
  assertArrayIncludes(graph.edges, [
    new GraphEdge({
      from: second_deployment_node.getId(),
      to: first_service_node_id,
    }),
  ]);
};
