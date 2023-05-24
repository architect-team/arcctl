import { SupportedProviders } from '../../../@providers/supported-providers.ts';
import {
  CloudEdge,
  CloudGraph,
  CloudNode,
} from '../../../cloud-graph/index.ts';
import { CldCtlProviderStore } from '../../../utils/provider-store.ts';
import { parseDatacenter } from '../../parser.ts';
import DatacenterV1 from '../index.ts';
import yaml from 'js-yaml';

describe('Datacenter Schema: v1', () => {
  it('should add root resources to graph', async () => {
    const datacenter = new DatacenterV1(
      yaml.load(`
        resources:
          gateway:
            type: loadBalancer
            account: my-kubernetes-cluster
            name: gateway
            loadBalancerType: traefik
      `) as any,
    );

    const providerStore = new CldCtlProviderStore();
    providerStore.saveProvider(
      new SupportedProviders.kubernetes(
        'my-kubernetes-cluster',
        {
          configPath: '',
        },
        () => '',
      ),
    );

    const graph = await datacenter.enrichGraph(new CloudGraph(), 'environment');

    expect(graph.nodes).toEqual(
      expect.arrayContaining([
        new CloudNode({
          name: 'gateway',
          environment: 'environment',
          inputs: {
            type: 'loadBalancer',
            name: 'gateway',
            account: 'my-kubernetes-cluster',
            loadBalancerType: 'traefik',
          },
        }),
      ]),
    );
  });

  it('should integrate root services w/ each other', async () => {
    const datacenter = await parseDatacenter(
      yaml.load(`
        resources:
          vpc:
            type: vpc
            name: vpc
            account: aws
            region: us-east-1
          cluster:
            type: kubernetesCluster
            account: aws
            name: cluster
            kubernetesVersion: '1.24'
            region: us-east-1
            vpc: \${{ resources.vpc.id }}
            nodePools:
              - name: pool1
                count: 3
                nodeSize: size-slug
      `) as any,
    );

    const providerStore = new CldCtlProviderStore();
    providerStore.saveProvider(
      new SupportedProviders.aws(
        'aws',
        {
          accessKeyId: '',
          secretAccessKey: '',
        },
        () => '',
      ),
    );

    const graph = await datacenter.enrichGraph(new CloudGraph(), 'environment');

    const vpc_node = new CloudNode({
      name: 'vpc',
      environment: 'environment',
      inputs: {
        type: 'vpc',
        name: 'vpc',
        region: 'us-east-1',
        account: 'aws',
      },
    });

    const cluster_node = new CloudNode({
      name: 'cluster',
      environment: 'environment',
      inputs: {
        type: 'kubernetesCluster',
        account: 'aws',
        name: 'cluster',
        region: 'us-east-1',
        vpc: `\${{ ${vpc_node.id}.id }}`,
        kubernetesVersion: '1.24',
        nodePools: [
          {
            name: 'pool1',
            count: 3,
            nodeSize: 'size-slug',
          },
        ],
      },
    });

    expect(graph.nodes).toEqual(
      expect.arrayContaining([vpc_node, cluster_node]),
    );
    expect(graph.edges).toEqual(
      expect.arrayContaining([
        new CloudEdge({
          from: cluster_node.id,
          to: vpc_node.id,
          required: true,
        }),
      ]),
    );
  });

  it('should modify resources matching hooks', async () => {
    const datacenter = await parseDatacenter(
      yaml.load(`
        hooks:
          - when:
              type: databaseSchema
            account: test
            database: database-id
      `) as any,
    );

    const providerStore = new CldCtlProviderStore();
    providerStore.saveProvider(
      new SupportedProviders.aws(
        'test',
        {
          accessKeyId: '',
          secretAccessKey: '',
        },
        () => '',
      ),
    );

    const databaseSchemaNode = new CloudNode({
      name: 'main',
      component: 'account/component',
      environment: 'account/environment',
      inputs: {
        type: 'databaseSchema',
        database: '',
        databaseType: 'postgres',
        databaseVersion: '13',
        name: CloudNode.genResourceId({
          name: 'main',
          component: 'account/component',
          environment: 'account/environment',
        }),
      },
    });

    const graph = await datacenter.enrichGraph(
      new CloudGraph({
        nodes: [databaseSchemaNode],
      }),
      'environment',
    );

    const expectedSchemaNode = new CloudNode({
      name: 'main',
      component: 'account/component',
      environment: 'account/environment',
      inputs: {
        type: 'databaseSchema',
        account: 'test',
        database: 'database-id',
        databaseType: 'postgres',
        databaseVersion: '13',
        name: CloudNode.genResourceId({
          name: 'main',
          component: 'account/component',
          environment: 'account/environment',
        }),
      },
    });

    expect(graph.nodes).toEqual(expect.arrayContaining([expectedSchemaNode]));
  });

  it(`should not modify resources that don't match hooks`, async () => {
    const datacenter = await parseDatacenter(
      yaml.load(`
        hooks:
          - when:
              type: ingressRule
            account: test
      `) as any,
    );

    const providerStore = new CldCtlProviderStore();
    providerStore.saveProvider(
      new SupportedProviders.aws(
        'test',
        {
          accessKeyId: '',
          secretAccessKey: '',
        },
        () => '',
      ),
    );

    const databaseSchemaNode = new CloudNode({
      name: 'main',
      component: 'account/component',
      environment: 'account/environment',
      inputs: {
        type: 'databaseSchema',
        database: '',
        databaseType: 'postgres',
        databaseVersion: '13',
        name: CloudNode.genResourceId({
          name: 'main',
          component: 'account/component',
          environment: 'account/environment',
        }),
      },
    });

    const graph = await datacenter.enrichGraph(
      new CloudGraph({
        nodes: [databaseSchemaNode],
      }),
      'environment',
    );

    expect(graph.nodes).toEqual(expect.arrayContaining([databaseSchemaNode]));
  });

  it('should create inline resources', async () => {
    const datacenter = await parseDatacenter(
      yaml.load(`
        hooks:
          - when:
              type: databaseSchema
            resources:
              test:
                type: database
                account: test
                name: test
                databaseSize: size-slug
                databaseType: postgres
                databaseVersion: '13'
                vpc: vpc-1
                region: us-east-1
      `) as any,
    );

    const providerStore = new CldCtlProviderStore();
    providerStore.saveProvider(
      new SupportedProviders.aws(
        'test',
        {
          accessKeyId: '',
          secretAccessKey: '',
        },
        () => '',
      ),
    );

    const databaseSchemaNode = new CloudNode({
      name: 'main',
      component: 'account/component',
      environment: 'account/environment',
      inputs: {
        type: 'databaseSchema',
        database: '',
        databaseType: 'postgres',
        databaseVersion: '13',
        name: CloudNode.genResourceId({
          name: 'main',
          component: 'account/component',
          environment: 'account/environment',
        }),
      },
    });

    const graph = await datacenter.enrichGraph(
      new CloudGraph({
        nodes: [databaseSchemaNode],
      }),
      'account/environment',
    );

    const expectedDatabaseNode = new CloudNode({
      name: 'hook-0-test',
      environment: 'account/environment',
      inputs: {
        type: 'database',
        name: 'test',
        databaseSize: 'size-slug',
        databaseVersion: '13',
        databaseType: 'postgres',
        vpc: 'vpc-1',
        account: 'test',
        region: 'us-east-1',
      },
    });

    expect(graph.nodes).toEqual(expect.arrayContaining([expectedDatabaseNode]));
  });

  it('should integrate inline resources with hook resources', async () => {
    const datacenter = await parseDatacenter(
      yaml.load(`
        hooks:
          - when:
              type: databaseSchema
            resources:
              test:
                type: database
                account: test
                name: test
                databaseSize: size-slug
                databaseType: postgres
                databaseVersion: '13'
                vpc: vpc-1
                region: us-east-1
            database: \${{ this.resources.test.id }}
      `) as any,
    );

    const providerStore = new CldCtlProviderStore();
    providerStore.saveProvider(
      new SupportedProviders.aws(
        'test',
        {
          accessKeyId: '',
          secretAccessKey: '',
        },
        () => '',
      ),
    );

    const databaseSchemaNode = new CloudNode({
      name: 'main',
      component: 'account/component',
      environment: 'account/environment',
      inputs: {
        type: 'databaseSchema',
        database: '',
        databaseType: 'postgres',
        databaseVersion: '13',
        name: CloudNode.genResourceId({
          name: 'main',
          component: 'account/component',
          environment: 'account/environment',
        }),
      },
    });

    const graph = await datacenter.enrichGraph(
      new CloudGraph({
        nodes: [databaseSchemaNode],
      }),
      'account/environment',
    );

    (databaseSchemaNode as CloudNode<'databaseSchema'>).inputs.database =
      '${{ this.resources.test.id }}';

    const expectedDatabaseNode = new CloudNode({
      name: 'hook-0-test',
      environment: 'account/environment',
      inputs: {
        type: 'database',
        name: 'test',
        account: 'test',
        databaseSize: 'size-slug',
        databaseVersion: '13',
        databaseType: 'postgres',
        vpc: 'vpc-1',
        region: 'us-east-1',
      },
    });

    expect(graph.nodes).toEqual(
      expect.arrayContaining([databaseSchemaNode, expectedDatabaseNode]),
    );
    expect(graph.edges).toEqual(
      expect.arrayContaining([
        new CloudEdge({
          from: databaseSchemaNode.id,
          to: expectedDatabaseNode.id,
          required: true,
        }),
      ]),
    );
  });
});
