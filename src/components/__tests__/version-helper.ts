import yaml from 'js-yaml';
import { assertArrayIncludes } from 'std/testing/asserts.ts';
import { CloudEdge, CloudNode } from '../../cloud-graph/index.ts';
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

  const secret_node = new CloudNode({
    name: options.secret_name,
    component: 'test',
    environment: 'test',
    inputs: {
      type: 'secret',
      name: CloudNode.genResourceId({
        name: options.secret_name,
        component: 'test',
        environment: 'test',
      }),
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

  const secret_node = new CloudNode({
    name: options.secret_name,
    component: 'component',
    environment: 'environment',
    inputs: {
      type: 'secret',
      name: CloudNode.genResourceId({
        name: options.secret_name,
        component: 'component',
        environment: 'environment',
      }),
      data: '',
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
        DB_DSN: `\${{ ${secret_node.id}.data }}`,
      },
    },
  });
  assertArrayIncludes(graph.nodes, [secret_node, deployment_node]);
  assertArrayIncludes(graph.edges, [
    new CloudEdge({
      from: deployment_node.id,
      to: secret_node.id,
      required: true,
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

  const database_schema_node_id = CloudNode.genId({
    type: 'databaseSchema',
    name: options.database_name,
    component: 'component',
    environment: 'environment',
  });

  const deployment_node_id = CloudNode.genId({
    type: 'deployment',
    name: options.deployment_name,
    component: 'component',
    environment: 'environment',
  });

  const name = `${deployment_node_id}/${options.database_name}`;
  const database_user_node = new CloudNode({
    name,
    component: 'component',
    environment: 'environment',
    inputs: {
      type: 'databaseUser',
      username: name.replaceAll('/', '--'),
      databaseSchema: `\${{ ${database_schema_node_id}.id }}`,
      account: `\${{ ${database_schema_node_id}.account }}`,
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

  assertArrayIncludes(graph.nodes, [database_user_node, deployment_node]);
  assertArrayIncludes(graph.edges, [
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
      target_protocol: 'http',
      target_deployment: CloudNode.genResourceId({
        name: options.deployment_name,
        component: 'component',
        environment: 'environment',
      }),
      target_port: 80,
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
      image: 'nginx:1.14.2',
      replicas: 1,
      services: [
        {
          id: `\${{ ${service_node.id}.id }}`,
          account: `\${{ ${service_node.id}.account }}`,
        },
      ],
      volume_mounts: [],
    },
  });

  assertArrayIncludes(graph.nodes, [deployment_node, service_node]);
  assertArrayIncludes(graph.edges, [
    new CloudEdge({
      from: service_node.id,
      to: deployment_node.id,
      required: false,
    }),
    new CloudEdge({
      from: deployment_node.id,
      to: service_node.id,
      required: true,
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

  assertArrayIncludes(graph.nodes, [second_deployment_node]);
  assertArrayIncludes(graph.edges, [
    new CloudEdge({
      from: second_deployment_node.id,
      to: first_service_node_id,
      required: true,
    }),
  ]);
};
