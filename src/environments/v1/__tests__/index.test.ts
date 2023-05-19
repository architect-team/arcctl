import { CloudEdge, CloudNode } from '../../../cloud-graph/index.js';
import { ComponentStore } from '../../../component-store/index.js';
import { parseEnvironment } from '../../parser.js';
import fs from 'fs/promises';
import yaml from 'js-yaml';
import mock_fs from 'mock-fs';
import os from 'os';
import path from 'path';

describe('Environment schema: v1', () => {
  afterEach(() => {
    mock_fs.restore();
  });

  it('should ignore configuration without a source', async () => {
    const environment = await parseEnvironment(
      yaml.load(`
        components:
          account/component:
            secrets:
              secret: value
      `) as any,
    );

    const store = new ComponentStore(os.tmpdir(), 'registry.architect.io');
    const graph = await environment.getGraph('account/environment', store);

    expect(graph.nodes).toEqual([]);
    expect(graph.edges).toEqual([]);
  });

  it('should graph single component', async () => {
    const environment = await parseEnvironment(
      yaml.load(`
        components:
          account/component:
            source: account/component:latest
      `) as any,
    );

    const component = `
      version: v2
      deployments:
        main:
          image: nginx:latest
    `;

    mock_fs({
      '/component': {
        'architect.yml': component,
      },
    });

    const store = new ComponentStore(os.tmpdir(), 'registry.architect.io');
    const component_id = await store.add('/component/architect.yml');
    store.tag(component_id, 'account/component:latest');

    const graph = await environment.getGraph('account/environment', store);

    expect(graph.nodes).toEqual([
      new CloudNode({
        name: 'main',
        component: 'account/component',
        environment: 'account/environment',
        inputs: {
          type: 'deployment',
          name: CloudNode.genResourceId({
            name: 'main',
            component: 'account/component',
            environment: 'account/environment',
          }),
          containers: [
            {
              image: 'nginx:latest',
              volume_mounts: [],
            },
          ],
          replicas: 1,
        },
      }),
    ]);
    expect(graph.edges).toEqual([]);
  });

  it('should graph implicit dependencies', async () => {
    const environment = await parseEnvironment(
      yaml.load(`
      components:
        account/component:
          source: account/component:latest
    `) as any,
    );

    const component = `
      name: account/component
      dependencies:
        account/dependency: latest
      services:
        api:
          image: node:12
          environment:
            DEP_ADDR: \${{ dependencies.account/dependency.interfaces.main.url }}
    `;

    const dependency = `
      version: v2
      deployments:
        main:
          image: node:latest
      services:
        main:
          deployment: main
          port: 8080
    `;

    mock_fs({
      '/component': {
        'architect.yml': component,
      },
      '/dependency': {
        'architect.yml': dependency,
      },
    });

    const tmpdir = await fs.mkdtemp(path.join(os.tmpdir(), 'arc-store-'));
    const store = new ComponentStore(tmpdir, 'registry.architect.io');
    const component_id = await store.add('/component/architect.yml');
    store.tag(component_id, 'account/component:latest');
    const dependency_id = await store.add('/dependency/architect.yml');
    store.tag(dependency_id, 'account/dependency:latest');

    const graph = await environment.getGraph('account/environment', store);

    const component_deployment_node_id = CloudNode.genId({
      type: 'deployment',
      name: 'api',
      component: 'account/component',
      environment: 'account/environment',
    });

    const dependency_deployment_node_id = CloudNode.genId({
      type: 'deployment',
      name: 'main',
      component: 'account/dependency',
      environment: 'account/environment',
    });

    const dependency_service_node_id = CloudNode.genId({
      type: 'service',
      name: 'main',
      component: 'account/dependency',
      environment: 'account/environment',
    });

    expect(graph.nodes.map((n: CloudNode) => n.id)).toEqual(
      expect.arrayContaining([
        component_deployment_node_id,
        dependency_deployment_node_id,
        dependency_service_node_id,
      ]),
    );
    expect(graph.edges).toEqual(
      expect.arrayContaining([
        new CloudEdge({
          from: dependency_service_node_id,
          to: dependency_deployment_node_id,
          required: false,
        }),
        new CloudEdge({
          from: component_deployment_node_id,
          to: dependency_service_node_id,
          required: true,
        }),
      ]),
    );
  });

  it('should graph dependencies of dependencies', async () => {
    const environment = await parseEnvironment(
      yaml.load(`
      components:
        account/component:
          source: account/component:latest
    `) as any,
    );

    mock_fs({
      '/component': {
        'architect.yml': `
            name: account/component
            dependencies:
              account/dependency: latest
            services:
              api:
                image: node:12
          `,
      },
      '/dependency': {
        'architect.yml': `
            version: v2
            dependencies:
              dep: account/nested
            deployments:
              main:
                image: node:latest
          `,
      },
      '/nested': {
        'architect.yml': `
            version: v2
            deployments:
              main:
                image: node:14
          `,
      },
    });

    const tmpdir = await fs.mkdtemp(path.join(os.tmpdir(), 'arc-store-'));
    const store = new ComponentStore(tmpdir, 'registry.architect.io');
    const component_id = await store.add('/component/architect.yml');
    store.tag(component_id, 'account/component:latest');
    const dependency_id = await store.add('/dependency/architect.yml');
    store.tag(dependency_id, 'account/dependency:latest');
    const nested_id = await store.add('/nested/architect.yml');
    store.tag(nested_id, 'account/nested:latest');

    const graph = await environment.getGraph('account/environment', store);

    const component_deployment_node_id = CloudNode.genId({
      type: 'deployment',
      name: 'api',
      component: 'account/component',
      environment: 'account/environment',
    });

    const dependency_deployment_node_id = CloudNode.genId({
      type: 'deployment',
      name: 'main',
      component: 'account/dependency',
      environment: 'account/environment',
    });

    const nested_deployment_node_id = CloudNode.genId({
      type: 'deployment',
      name: 'main',
      component: 'account/nested',
      environment: 'account/environment',
    });

    expect(graph.nodes.map((n: CloudNode) => n.id)).toEqual(
      expect.arrayContaining([
        component_deployment_node_id,
        dependency_deployment_node_id,
        nested_deployment_node_id,
      ]),
    );
  });

  it('should graph shared dependencies', async () => {
    const environment = await parseEnvironment(
      yaml.load(`
      components:
        account/component1:
          source: account/component1:latest
        account/component2:
          source: account/component2:latest
    `) as any,
    );

    mock_fs({
      '/component1': {
        'architect.yml': `
          name: account/component1
          dependencies:
            account/dependency: latest
          services:
            api:
              image: node:12
        `,
      },
      '/component2': {
        'architect.yml': `
          version: v2
          dependencies:
            dependency: account/dependency
          deployments:
            main:
              image: node:14
        `,
      },
      '/dependency': {
        'architect.yml': `
          version: v2
          deployments:
            main:
              image: node:latest
        `,
      },
    });

    const tmpdir = await fs.mkdtemp(path.join(os.tmpdir(), 'arc-store-'));
    const store = new ComponentStore(tmpdir, 'registry.architect.io');
    const component1_id = await store.add('/component1/architect.yml');
    store.tag(component1_id, 'account/component1:latest');
    const component2_id = await store.add('/component2/architect.yml');
    store.tag(component2_id, 'account/component2:latest');
    const dependency_id = await store.add('/dependency/architect.yml');
    store.tag(dependency_id, 'account/dependency:latest');

    const graph = await environment.getGraph('account/environment', store);

    const component1_deployment_node_id = CloudNode.genId({
      type: 'deployment',
      name: 'api',
      component: 'account/component1',
      environment: 'account/environment',
    });

    const component2_deployment_node_id = CloudNode.genId({
      type: 'deployment',
      name: 'main',
      component: 'account/component2',
      environment: 'account/environment',
    });

    const dependency_deployment_node_id = CloudNode.genId({
      type: 'deployment',
      name: 'main',
      component: 'account/dependency',
      environment: 'account/environment',
    });

    expect(
      graph.nodes
        .filter((n: CloudNode) => n.type === 'deployment')
        .map((n: CloudNode) => n.id),
    ).toEqual([
      component1_deployment_node_id,
      component2_deployment_node_id,
      dependency_deployment_node_id,
    ]);
  });
});
