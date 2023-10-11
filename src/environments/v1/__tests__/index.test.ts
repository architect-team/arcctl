import * as mockFile from 'https://deno.land/x/mock_file@v1.1.2/mod.ts';
import yaml from 'js-yaml';
import { assertArrayIncludes, assertEquals } from 'std/testing/asserts.ts';
import { describe, it } from 'std/testing/bdd.ts';
import { ComponentStore } from '../../../component-store/index.ts';
import { AppGraphNode, GraphEdge } from '../../../graphs/index.ts';
import { VariableMergingDisabledError } from '../../errors.ts';
import { parseEnvironment } from '../../parser.ts';

describe('Environment schema: v1', () => {
  it('should ignore configuration without a source', async () => {
    const environment = await parseEnvironment(
      yaml.load(`
        components:
          account/component:
            variables:
              secret: value
      `) as Record<string, unknown>,
    );

    const tmp_dir = Deno.makeTempDirSync();
    const store = new ComponentStore(tmp_dir, 'registry.architect.io');
    const graph = await environment.getGraph('account/environment', store);

    assertEquals(graph.nodes, []);
    assertEquals(graph.edges, []);
  });

  it('should extrapolate local values', async () => {
    const environment = await parseEnvironment(
      yaml.load(`
        locals:
          source: account/component:latest
        components:
          account/component:
            source: \${{locals.source}}
      `) as Record<string, unknown>,
    );

    const component = `
      version: v2
      deployments:
        main:
          image: nginx:latest
    `;

    mockFile.prepareVirtualFile('/component/architect.yml', new TextEncoder().encode(component));

    const tmp_dir = Deno.makeTempDirSync();
    const store = new ComponentStore(tmp_dir, 'registry.architect.io');
    const component_id = await store.add('/component/architect.yml');
    store.tag(component_id, 'account/component:latest');

    const graph = await environment.getGraph('account/environment', store);

    assertEquals(graph.nodes, [
      new AppGraphNode({
        name: 'main',
        type: 'deployment',
        component: 'account/component',
        inputs: {
          image: 'nginx:latest',
          volume_mounts: [],
          replicas: 1,
        },
      }),
    ]);
    assertEquals(graph.edges, []);
  });

  it('should graph single component', async () => {
    const environment = await parseEnvironment(
      yaml.load(`
        components:
          account/component:
            source: account/component:latest
      `) as Record<string, unknown>,
    );

    const component = `
      version: v2
      deployments:
        main:
          image: nginx:latest
    `;

    mockFile.prepareVirtualFile('/component/architect.yml', new TextEncoder().encode(component));

    const tmp_dir = Deno.makeTempDirSync();
    const store = new ComponentStore(tmp_dir, 'registry.architect.io');
    const component_id = await store.add('/component/architect.yml');
    store.tag(component_id, 'account/component:latest');

    const graph = await environment.getGraph('account/environment', store);

    assertEquals(graph.nodes, [
      new AppGraphNode({
        name: 'main',
        type: 'deployment',
        component: 'account/component',
        inputs: {
          image: 'nginx:latest',
          volume_mounts: [],
          replicas: 1,
        },
      }),
    ]);
    assertEquals(graph.edges, []);
  });

  it('should graph implicit dependencies', async () => {
    const environment = await parseEnvironment(
      yaml.load(`
      components:
        account/component:
          source: account/component:latest
    `) as Record<string, unknown>,
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

    mockFile.prepareVirtualFile('/component/architect.yml', new TextEncoder().encode(component));
    mockFile.prepareVirtualFile('/dependency/architect.yml', new TextEncoder().encode(dependency));

    const tmp_dir = Deno.makeTempDirSync({ prefix: 'arc-store-' });
    const store = new ComponentStore(tmp_dir, 'registry.architect.io');
    const component_id = await store.add('/component/architect.yml');
    store.tag(component_id, 'account/component:latest');
    const dependency_id = await store.add('/dependency/architect.yml');
    store.tag(dependency_id, 'account/dependency:latest');

    const graph = await environment.getGraph('account/environment', store);

    const component_deployment_node_id = `account/component/deployment/api`;
    const dependency_deployment_node_id = 'account/dependency/deployment/main';
    const dependency_service_node_id = 'account/dependency/service/main';

    assertArrayIncludes(
      graph.nodes.map((n: AppGraphNode) => n.getId()),
      [component_deployment_node_id, dependency_deployment_node_id, dependency_service_node_id],
    );

    assertArrayIncludes(graph.edges, [
      new GraphEdge({
        from: component_deployment_node_id,
        to: dependency_service_node_id,
      }),
    ]);
  });

  it('should graph dependencies of dependencies', async () => {
    const environment = await parseEnvironment(
      yaml.load(`
      components:
        account/component:
          source: account/component:latest
    `) as any,
    );

    mockFile.prepareVirtualFile(
      '/component/architect.yml',
      new TextEncoder().encode(`
      name: account/component
      dependencies:
        account/dependency: latest
      services:
        api:
          image: node:12
    `),
    );

    mockFile.prepareVirtualFile(
      '/dependency/architect.yml',
      new TextEncoder().encode(`
      version: v2
      dependencies:
        dep:
          component: account/nested
      deployments:
        main:
          image: node:latest
    `),
    );

    mockFile.prepareVirtualFile(
      '/nested/architect.yml',
      new TextEncoder().encode(`
      version: v2
      deployments:
        main:
          image: node:14
    `),
    );

    const tmpdir = Deno.makeTempDirSync({ prefix: 'arc-store-' });
    const store = new ComponentStore(tmpdir, 'registry.architect.io');
    const component_id = await store.add('/component/architect.yml');
    store.tag(component_id, 'account/component:latest');
    const dependency_id = await store.add('/dependency/architect.yml');
    store.tag(dependency_id, 'account/dependency:latest');
    const nested_id = await store.add('/nested/architect.yml');
    store.tag(nested_id, 'account/nested:latest');

    const graph = await environment.getGraph('account/environment', store);

    const component_deployment_node_id = 'account/component/deployment/api';
    const dependency_deployment_node_id = 'account/dependency/deployment/main';

    const nested_deployment_node_id = 'account/nested/deployment/main';

    assertArrayIncludes(graph.nodes.map((n: AppGraphNode) => n.getId()), [
      component_deployment_node_id,
      dependency_deployment_node_id,
      nested_deployment_node_id,
    ]);
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

    mockFile.prepareVirtualFile(
      '/component1/architect.yml',
      new TextEncoder().encode(`
      name: account/component1
      dependencies:
        account/dependency: latest
      services:
        api:
          image: node:12
    `),
    );

    mockFile.prepareVirtualFile(
      '/component2/architect.yml',
      new TextEncoder().encode(`
      version: v2
      dependencies:
        dependency:
          component: account/dependency
      deployments:
        main:
          image: node:14
    `),
    );

    mockFile.prepareVirtualFile(
      '/dependency/architect.yml',
      new TextEncoder().encode(`
      version: v2
      deployments:
        main:
          image: node:latest
    `),
    );

    const tmpdir = Deno.makeTempDirSync({ prefix: 'arc-store-' });
    const store = new ComponentStore(tmpdir, 'registry.architect.io');
    const component1_id = await store.add('/component1/architect.yml');
    store.tag(component1_id, 'account/component1:latest');
    const component2_id = await store.add('/component2/architect.yml');
    store.tag(component2_id, 'account/component2:latest');
    const dependency_id = await store.add('/dependency/architect.yml');
    store.tag(dependency_id, 'account/dependency:latest');

    const graph = await environment.getGraph('account/environment', store);

    const component1_deployment_node_id = 'account/component1/deployment/api';
    const component2_deployment_node_id = 'account/component2/deployment/main';
    const dependency_deployment_node_id = 'account/dependency/deployment/main';

    assertArrayIncludes(
      graph.nodes
        .filter((n: AppGraphNode) => n.type === 'deployment')
        .map((n: AppGraphNode) => n.getId()),
      [
        component1_deployment_node_id,
        component2_deployment_node_id,
        dependency_deployment_node_id,
      ],
    );
  });

  it('should pass values to dependency variables', async () => {
    const environment = await parseEnvironment(
      yaml.load(`
      components:
        account/component:
          source: account/component:latest
    `) as Record<string, unknown>,
    );

    const component = `
      version: v2
      dependencies:
        dep:
          component: account/dependency
          variables:
            key:
              - value1
    `;

    const dependency = `
      version: v2
      variables:
        key:
          merge: true
    `;

    mockFile.prepareVirtualFile('/component/architect.yml', new TextEncoder().encode(component));
    mockFile.prepareVirtualFile('/dependency/architect.yml', new TextEncoder().encode(dependency));

    const tmp_dir = Deno.makeTempDirSync({ prefix: 'arc-store-' });
    const store = new ComponentStore(tmp_dir, 'registry.architect.io');
    const component_id = await store.add('/component/architect.yml');
    store.tag(component_id, 'account/component:latest');
    const dependency_id = await store.add('/dependency/architect.yml');
    store.tag(dependency_id, 'account/dependency:latest');

    const graph = await environment.getGraph('account/environment', store);

    const secret_node = new AppGraphNode({
      name: 'key',
      type: 'secret',
      component: 'account/dependency',
      inputs: {
        data: JSON.stringify(['value1']),
        merge: true,
      },
    });

    assertArrayIncludes(
      graph.nodes,
      [secret_node],
    );
  });

  it('should merge values passed from upstream components', async () => {
    const environment = await parseEnvironment(
      yaml.load(`
      components:
        account/component:
          source: account/component:latest
        account/component2:
          source: account/component2:latest
    `) as Record<string, unknown>,
    );

    const component = `
      version: v2
      dependencies:
        dep:
          component: account/dependency
          variables:
            key:
              - value1
    `;

    const component2 = `
      version: v2
      dependencies:
        dep:
          component: account/dependency
          variables:
            key:
              - value2
              - value3
    `;

    const dependency = `
      version: v2
      variables:
        key:
          merge: true
    `;

    mockFile.prepareVirtualFile('/component/architect.yml', new TextEncoder().encode(component));
    mockFile.prepareVirtualFile('/component2/architect.yml', new TextEncoder().encode(component2));
    mockFile.prepareVirtualFile('/dependency/architect.yml', new TextEncoder().encode(dependency));

    const tmp_dir = Deno.makeTempDirSync({ prefix: 'arc-store-' });
    const store = new ComponentStore(tmp_dir, 'registry.architect.io');
    const component_id = await store.add('/component/architect.yml');
    store.tag(component_id, 'account/component:latest');
    const component2_id = await store.add('/component2/architect.yml');
    store.tag(component2_id, 'account/component2:latest');
    const dependency_id = await store.add('/dependency/architect.yml');
    store.tag(dependency_id, 'account/dependency:latest');

    const graph = await environment.getGraph('account/environment', store);

    const secret_node = new AppGraphNode({
      name: 'key',
      type: 'secret',
      component: 'account/dependency',
      inputs: {
        data: JSON.stringify(['value1', 'value2', 'value3']),
        merge: true,
      },
    });

    assertArrayIncludes(
      graph.nodes,
      [secret_node],
    );
  });

  it('should merge values passed from upstream components with environment values', async () => {
    const environment = await parseEnvironment(
      yaml.load(`
      components:
        account/component:
          source: account/component:latest
        account/dependency:
          variables:
            key:
              - value-environment
    `) as Record<string, unknown>,
    );

    const component = `
      version: v2
      dependencies:
        dep:
          component: account/dependency
          variables:
            key:
              - value-component
    `;

    const dependency = `
      version: v2
      variables:
        key:
          merge: true
    `;

    mockFile.prepareVirtualFile('/component/architect.yml', new TextEncoder().encode(component));
    mockFile.prepareVirtualFile('/dependency/architect.yml', new TextEncoder().encode(dependency));

    const tmp_dir = Deno.makeTempDirSync({ prefix: 'arc-store-' });
    const store = new ComponentStore(tmp_dir, 'registry.architect.io');
    const component_id = await store.add('/component/architect.yml');
    store.tag(component_id, 'account/component:latest');
    const dependency_id = await store.add('/dependency/architect.yml');
    store.tag(dependency_id, 'account/dependency:latest');

    const graph = await environment.getGraph('account/environment', store);

    const secret_node = new AppGraphNode({
      name: 'key',
      type: 'secret',
      component: 'account/dependency',
      inputs: {
        data: JSON.stringify(['value-component', 'value-environment']),
        merge: true,
      },
    });

    assertArrayIncludes(
      graph.nodes,
      [secret_node],
    );
  });

  it('should pass empty array to merge variables', async () => {
    const environment = await parseEnvironment(
      yaml.load(`
      components:
        account/component:
          source: account/component:latest
    `) as Record<string, unknown>,
    );

    const component = `
      version: v2
      variables:
        key:
          merge: true
    `;

    mockFile.prepareVirtualFile('/component/architect.yml', new TextEncoder().encode(component));

    const tmp_dir = Deno.makeTempDirSync({ prefix: 'arc-store-' });
    const store = new ComponentStore(tmp_dir, 'registry.architect.io');
    const component_id = await store.add('/component/architect.yml');
    store.tag(component_id, 'account/component:latest');

    const graph = await environment.getGraph('account/environment', store);

    const secret_node = new AppGraphNode({
      name: 'key',
      type: 'secret',
      component: 'account/component',
      inputs: {
        data: JSON.stringify([]),
        merge: true,
      },
    });

    assertArrayIncludes(
      graph.nodes,
      [secret_node],
    );
  });

  it('should pass dynamic values to dependency variables', async () => {
    const environment = await parseEnvironment(
      yaml.load(`
      components:
        account/component:
          source: account/component:latest
    `) as Record<string, unknown>,
    );

    const component = `
      version: v2

      deployments:
        main:
          image: nginx:latest

      services:
        main:
          deployment: main
          port: 80

      ingresses:
        main:
          service: main

      dependencies:
        dep:
          component: account/dependency
          variables:
            key:
              - \${{ services.main.url }}
              - \${{ ingresses.main.url }}
    `;

    const dependency = `
      version: v2
      variables:
        key:
          merge: true
    `;

    mockFile.prepareVirtualFile('/component/architect.yml', new TextEncoder().encode(component));
    mockFile.prepareVirtualFile('/dependency/architect.yml', new TextEncoder().encode(dependency));

    const tmp_dir = Deno.makeTempDirSync({ prefix: 'arc-store-' });
    const store = new ComponentStore(tmp_dir, 'registry.architect.io');
    const component_id = await store.add('/component/architect.yml');
    store.tag(component_id, 'account/component:latest');
    const dependency_id = await store.add('/dependency/architect.yml');
    store.tag(dependency_id, 'account/dependency:latest');

    const graph = await environment.getGraph('account/environment', store);

    const service_node_id = 'account/component/service/main';
    const ingress_node_id = 'account/component/ingress/main';

    const secret_node = new AppGraphNode({
      name: 'key',
      type: 'secret',
      component: 'account/dependency',
      inputs: {
        data: JSON.stringify([`\${{ ${ingress_node_id}.url }}`, `\${{ ${service_node_id}.url }}`]),
        merge: true,
      },
    });

    assertArrayIncludes(
      graph.nodes,
      [secret_node],
    );

    assertArrayIncludes(
      graph.edges,
      [
        new GraphEdge({
          from: secret_node.getId(),
          to: service_node_id,
        }),
        new GraphEdge({
          from: secret_node.getId(),
          to: ingress_node_id,
        }),
      ],
    );
  });

  it('should error if upstreams pass values to non-mergable dependency variables', async () => {
    const environment = await parseEnvironment(
      yaml.load(`
      components:
        account/component:
          source: account/component:latest
    `) as Record<string, unknown>,
    );

    const component = `
      version: v2
      dependencies:
        dep:
          component: account/dependency
          variables:
            key:
              - value1
    `;

    const dependency = `
      version: v2
      variables:
        key:
          description: Should not be provided
    `;

    mockFile.prepareVirtualFile('/component/architect.yml', new TextEncoder().encode(component));
    mockFile.prepareVirtualFile('/dependency/architect.yml', new TextEncoder().encode(dependency));

    const tmp_dir = Deno.makeTempDirSync({ prefix: 'arc-store-' });
    const store = new ComponentStore(tmp_dir, 'registry.architect.io');
    const component_id = await store.add('/component/architect.yml');
    store.tag(component_id, 'account/component:latest');
    const dependency_id = await store.add('/dependency/architect.yml');
    store.tag(dependency_id, 'account/dependency:latest');

    try {
      await environment.getGraph('account/environment', store);
    } catch (err) {
      assertEquals(err, new VariableMergingDisabledError('key', ['value1'], 'architect/dependency'));
      return;
    }

    throw new Error('Should have thrown an error');
  });

  it('should merge upstream values with default values', async () => {
    const environment = await parseEnvironment(
      yaml.load(`
      components:
        account/component:
          source: account/component:latest
    `) as Record<string, unknown>,
    );

    const component = `
      version: v2
      dependencies:
        dep:
          component: account/dependency
          variables:
            key:
              - value1
    `;

    const dependency = `
      version: v2

      deployments:
        main:
          image: nginx:latest

      services:
        main:
          deployment: main
          port: 8080

      variables:
        key:
          merge: true
          default:
            - value2
            - \${{ services.main.url }}
    `;

    mockFile.prepareVirtualFile('/component/architect.yml', new TextEncoder().encode(component));
    mockFile.prepareVirtualFile('/dependency/architect.yml', new TextEncoder().encode(dependency));

    const tmp_dir = Deno.makeTempDirSync({ prefix: 'arc-store-' });
    const store = new ComponentStore(tmp_dir, 'registry.architect.io');
    const component_id = await store.add('/component/architect.yml');
    store.tag(component_id, 'account/component:latest');
    const dependency_id = await store.add('/dependency/architect.yml');
    store.tag(dependency_id, 'account/dependency:latest');

    const graph = await environment.getGraph('account/environment', store);

    const service_node_id = 'account/dependency/service/main';

    const secret_node = new AppGraphNode({
      name: 'key',
      type: 'secret',
      component: 'account/dependency',
      inputs: {
        data: JSON.stringify([`\${{ ${service_node_id}.url }}`, 'value1', 'value2']),
        merge: true,
      },
    });

    assertArrayIncludes(
      graph.nodes,
      [secret_node],
    );

    assertArrayIncludes(
      graph.edges,
      [
        new GraphEdge({
          from: secret_node.getId(),
          to: service_node_id,
        }),
      ],
    );
  });
});
