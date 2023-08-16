import * as hclParser from 'hcl2-parser';
import yaml from 'js-yaml';
import { assertArrayIncludes, assertEquals } from 'std/testing/asserts.ts';
import { describe, it } from 'std/testing/bdd.ts';
import { EmptyProviderStore } from '../../../@providers/index.ts';
import { SupportedProviders } from '../../../@providers/supported-providers.ts';
import { CloudEdge, CloudGraph, CloudNode } from '../../../cloud-graph/index.ts';
import { parseDatacenter } from '../../parser.ts';
import DatacenterV1, { convertHclToJSON } from '../index.ts';

describe('Datacenter Schema: v1', () => {
  it('should add root resources to graph', async () => {
    const datacenter = new DatacenterV1(
      yaml.load(`
        resources:
          gateway:
            type: vpc
            account: aws
            name: my-vpc
            region: us-east-1
      `) as any,
    );

    const providerStore = new EmptyProviderStore();
    providerStore.save(
      new SupportedProviders.aws(
        'aws',
        {
          accessKeyId: '',
          secretAccessKey: '',
        },
        providerStore,
      ),
    );

    const graph = await datacenter.enrichGraph(new CloudGraph(), {
      datacenterName: 'datacenter',
      environmentName: 'environment',
    });

    assertArrayIncludes(graph.nodes, [
      new CloudNode({
        name: 'gateway',
        inputs: {
          type: 'vpc',
          name: 'my-vpc',
          account: 'aws',
          region: 'us-east-1',
        },
      }),
    ]);
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

    const providerStore = new EmptyProviderStore();
    providerStore.save(
      new SupportedProviders.aws(
        'aws',
        {
          accessKeyId: '',
          secretAccessKey: '',
        },
        providerStore,
      ),
    );

    const graph = await datacenter.enrichGraph(new CloudGraph(), {
      datacenterName: 'datacenter',
      environmentName: 'environment',
    });

    const vpc_node = new CloudNode({
      name: 'vpc',
      inputs: {
        type: 'vpc',
        name: 'vpc',
        region: 'us-east-1',
        account: 'aws',
      },
    });

    const cluster_node = new CloudNode({
      name: 'cluster',
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

    assertArrayIncludes(graph.nodes, [vpc_node, cluster_node]);
    assertArrayIncludes(graph.edges, [
      new CloudEdge({
        from: cluster_node.id,
        to: vpc_node.id,
        required: true,
      }),
    ]);
  });

  it('should modify resources matching hooks', async () => {
    const datacenter = await parseDatacenter(
      yaml.load(`
        environment:
          hooks:
            - when:
                type: database
              account: test
              databaseCluster: database-id
      `) as any,
    );

    const providerStore = new EmptyProviderStore();
    providerStore.save(
      new SupportedProviders.aws(
        'test',
        {
          accessKeyId: '',
          secretAccessKey: '',
        },
        providerStore,
      ),
    );

    const databaseNode = new CloudNode({
      name: 'main',
      component: 'account/component',
      environment: 'account/environment',
      inputs: {
        type: 'database',
        databaseCluster: '',
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
        nodes: [databaseNode],
      }),
      {
        datacenterName: 'datacenter',
        environmentName: 'environment',
      },
    );

    const expectedSchemaNode = new CloudNode({
      name: 'main',
      component: 'account/component',
      environment: 'account/environment',
      inputs: {
        type: 'database',
        account: 'test',
        databaseCluster: 'database-id',
        databaseType: 'postgres',
        databaseVersion: '13',
        name: CloudNode.genResourceId({
          name: 'main',
          component: 'account/component',
          environment: 'account/environment',
        }),
      },
    });

    assertArrayIncludes(graph.nodes, [expectedSchemaNode]);
  });

  it(`should not modify resources that don't match hooks`, async () => {
    const datacenter = await parseDatacenter(
      yaml.load(`
        environment:
          hooks:
            - when:
                type: ingressRule
              account: test
      `) as any,
    );

    const providerStore = new EmptyProviderStore();
    providerStore.save(
      new SupportedProviders.aws(
        'test',
        {
          accessKeyId: '',
          secretAccessKey: '',
        },
        providerStore,
      ),
    );

    const databaseNode = new CloudNode({
      name: 'main',
      component: 'account/component',
      environment: 'account/environment',
      inputs: {
        type: 'database',
        databaseCluster: '',
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
        nodes: [databaseNode],
      }),
      {
        datacenterName: 'datacenter',
        environmentName: 'environment',
      },
    );

    assertArrayIncludes(graph.nodes, [databaseNode]);
  });

  it('should create inline resources', async () => {
    const datacenter = await parseDatacenter(
      yaml.load(`
        environment:
          hooks:
            - when:
                type: database
              resources:
                test:
                  type: databaseCluster
                  account: test
                  name: test
                  databaseSize: size-slug
                  databaseType: postgres
                  databaseVersion: '13'
                  vpc: vpc-1
                  region: us-east-1
      `) as any,
    );

    const providerStore = new EmptyProviderStore();
    providerStore.save(
      new SupportedProviders.aws(
        'test',
        {
          accessKeyId: '',
          secretAccessKey: '',
        },
        providerStore,
      ),
    );

    const databaseNode = new CloudNode({
      name: 'main',
      component: 'account/component',
      environment: 'account/environment',
      inputs: {
        type: 'database',
        databaseCluster: '',
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
        nodes: [databaseNode],
      }),
      {
        datacenterName: 'datacenter',
        environmentName: 'account/environment',
      },
    );

    const expectedDatabaseNode = new CloudNode({
      name: `${databaseNode.name}/test`,
      component: databaseNode.component,
      environment: 'account/environment',
      inputs: {
        type: 'databaseCluster',
        name: 'test',
        databaseSize: 'size-slug',
        databaseVersion: '13',
        databaseType: 'postgres',
        vpc: 'vpc-1',
        account: 'test',
        region: 'us-east-1',
      },
    });

    assertArrayIncludes(graph.nodes, [expectedDatabaseNode]);
  });

  it('should integrate inline resources with hook resources', async () => {
    const datacenter = await parseDatacenter(
      yaml.load(`
        environment:
          hooks:
            - when:
                type: database
              resources:
                test:
                  type: databaseCluster
                  account: test
                  name: test
                  databaseSize: size-slug
                  databaseType: postgres
                  databaseVersion: '13'
                  vpc: vpc-1
                  region: us-east-1
              databaseCluster: \${{ this.resources.test.id }}
      `) as any,
    );

    const providerStore = new EmptyProviderStore();
    providerStore.save(
      new SupportedProviders.aws(
        'test',
        {
          accessKeyId: '',
          secretAccessKey: '',
        },
        providerStore,
      ),
    );

    const databaseNode = new CloudNode({
      name: 'main',
      component: 'account/component',
      environment: 'account/environment',
      inputs: {
        type: 'database',
        databaseCluster: '',
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
        nodes: [databaseNode],
      }),
      {
        datacenterName: 'datacenter',
        environmentName: 'account/environment',
      },
    );

    (databaseNode as CloudNode<'database'>).inputs.databaseCluster = '${{ this.resources.test.id }}';

    const expectedDatabaseNode = new CloudNode({
      name: `${databaseNode.name}/test`,
      component: databaseNode.component,
      environment: 'account/environment',
      inputs: {
        type: 'databaseCluster',
        name: 'test',
        account: 'test',
        databaseSize: 'size-slug',
        databaseVersion: '13',
        databaseType: 'postgres',
        vpc: 'vpc-1',
        region: 'us-east-1',
      },
    });

    assertArrayIncludes(graph.nodes, [databaseNode, expectedDatabaseNode]);
    assertArrayIncludes(graph.edges, [
      new CloudEdge({
        from: databaseNode.id,
        to: expectedDatabaseNode.id,
        required: true,
      }),
    ]);
  });

  it('should inject datacenter name into resources', async () => {
    const datacenter = new DatacenterV1(
      yaml.load(`
        resources:
          gateway:
            type: vpc
            account: aws
            name: \${{ datacenter.name }}
            region: us-east-1
        accounts:
          cluster:
            name: \${{ datacenter.name }}-dc-cluster
            provider: kubernetes
            credentials:
              configPath: test
        environment:
          resources:
            namespace:
              type: namespace
              account: aws
              name: \${{ datacenter.name }}-namespace
          accounts:
            cluster:
              name: \${{ datacenter.name }}-dc-cluster-env
              provider: kubernetes
              credentials:
                configPath: test
      `) as any,
    );

    const providerStore = new EmptyProviderStore();
    providerStore.save(
      new SupportedProviders.aws(
        'aws',
        {
          accessKeyId: '',
          secretAccessKey: '',
        },
        providerStore,
      ),
    );

    const graph = await datacenter.enrichGraph(new CloudGraph(), {
      datacenterName: 'dc-name',
      environmentName: 'environment',
    });

    assertArrayIncludes(graph.nodes, [
      new CloudNode({
        inputs: {
          account: 'n/a',
          credentials: {
            configPath: 'test',
          },
          name: 'dc-name-dc-cluster',
          provider: 'kubernetes',
          type: 'arcctlAccount',
        },
        name: 'dc-name-dc-cluster',
      }),
      new CloudNode({
        name: 'gateway',
        inputs: {
          type: 'vpc',
          name: 'dc-name',
          account: 'aws',
          region: 'us-east-1',
        },
      }),
    ]);
  });

  it('should inject environment name into resources', async () => {
    const datacenter = new DatacenterV1(
      yaml.load(`
        environment:
          resources:
            gateway:
              type: vpc
              account: aws
              name: \${{ environment.name }}
              region: us-east-1
      `) as any,
    );

    const providerStore = new EmptyProviderStore();
    providerStore.save(
      new SupportedProviders.aws(
        'aws',
        {
          accessKeyId: '',
          secretAccessKey: '',
        },
        providerStore,
      ),
    );

    const graph = await datacenter.enrichGraph(new CloudGraph(), {
      datacenterName: 'dc-name',
      environmentName: 'env-name',
    });

    assertArrayIncludes(graph.nodes, [
      new CloudNode({
        name: 'gateway',
        environment: 'env-name',
        inputs: {
          type: 'vpc',
          name: 'env-name',
          account: 'aws',
          region: 'us-east-1',
        },
      }),
    ]);
  });
});

const hclString = `
variable "account" {
  type = "arcctlAccount"
  description = "The docker account to use for this datacenter"
  provider = "docker"
}

variable "secretAccount" {
  type = "arcctlAccount"
  description = "The account used to store secrets"
}

volume "service-registry" {
  name = "traefik-volume"
  account = variable.account
}

deployment "gateway" {
  name = "my-gateway"
  account = variable.account
  exposed_ports = [
    {
      port = 80
      target_port = 80
    },
    {
      port = 8080
      target_port = 8080
    }
  ]
  image = "traefik:v2.10"
  command = [
    "--providers.file.directory=/etc/traefik",
    "--providers.file.watch=true",
    "--api.insecure=true",
    "--api.dashboard=true"
  ]
  volume_mounts = [
    {
      mount_path = "/etc/traefik"
      readonly = true
      volume = volume.service-registry.id
    }
  ]
}

account "gateway" {
  name = "local-gateway"
  provider = "traefik"
  credentials = {
    type = "volume"
    volume = volume.service-registry.id
    account = variable.account
  }
}

environment {

  defaults {
    account = variable.account
    namespace = environment.name
  }

  databaseCluster "pg" {
    account = variable.account
    name = "\${environment.name}-pg"
    databaseType = "postgres"
    databaseVersion = "13"
    databaseSize = "n/a"
    vpc = "n/a"
    region = "n/a"
  }

  account "pg" {
    name = "\${environment.name}-postgres-db"
    provider = "postgres"
    credentials = {
      host = environment.databaseCluster.pg.host
      port = environment.databaseCluster.pg.port
      username = environment.databaseCluster.pg.username
      password = environment.databaseCluster.pg.password
      databaseCluster = "architect"
    }
  }

  hook "service" {
    when = {
      type = "service"
    }
    account = account.gateway.id
    dnsZone = "\${environment.name}.172.17.0.1.nip.io"
    namespace = environment.name
  }

  hook "ingressRule" {
    when = {
      type = "ingressRule"
    }
    account = account.gateway.id
    registry = volume.service-registry.id
    dnsZone = "\${environment.name}.127.0.0.1.nip.io"
    namespace = environment.name
  }

  hook "database" {
    when = {
      type = "database"
    }
    account = environment.account.pg.id
  }

  hook "kratos-deployment" {
    when = {
      type = "deployment"
      image = "oryd/kratos-selfservice-ui-node:v0.13.0"
    }
    platform = "linux/amd64"
  }

  hook "secrets" {
    when = {
      type = "secret"
    }
    account = variable.secretAccount
  }
}`;

const expectedJSON = {
  variables: {
    account: {
      type: 'arcctlAccount',
      description: 'The docker account to use for this datacenter',
      provider: 'docker',
    },
    secretAccount: {
      type: 'arcctlAccount',
      description: 'The account used to store secrets',
    },
  },
  resources: {
    'service-registry': {
      type: 'volume',
      account: '${{ variables.account }}',
      name: 'traefik-volume',
    },
    gateway: {
      type: 'deployment',
      name: 'my-gateway',
      account: '${{ variables.account }}',
      exposed_ports: [
        { port: 80, target_port: 80 },
        { port: 8080, target_port: 8080 },
      ],
      image: 'traefik:v2.10',
      command: [
        '--providers.file.directory=/etc/traefik',
        '--providers.file.watch=true',
        '--api.insecure=true',
        '--api.dashboard=true',
      ],
      volume_mounts: [
        {
          mount_path: '/etc/traefik',
          readonly: true,
          volume: '${{ resources.service-registry.id }}',
        },
      ],
    },
  },
  accounts: {
    gateway: {
      name: 'local-gateway',
      provider: 'traefik',
      credentials: {
        type: 'volume',
        volume: '${{ resources.service-registry.id }}',
        account: '${{ variables.account }}',
      },
    },
  },
  environment: {
    resources: {
      pg: {
        type: 'databaseCluster',
        account: '${{ variables.account }}',
        name: '${{ environment.name }}-pg',
        databaseType: 'postgres',
        databaseVersion: '13',
        databaseSize: 'n/a',
        vpc: 'n/a',
        region: 'n/a',
      },
    },
    accounts: {
      pg: {
        name: '${{ environment.name }}-postgres-db',
        provider: 'postgres',
        credentials: {
          host: '${{ environment.resources.pg.host }}',
          port: '${{ environment.resources.pg.port }}',
          username: '${{ environment.resources.pg.username }}',
          password: '${{ environment.resources.pg.password }}',
          databaseCluster: 'architect',
        },
      },
    },
    hooks: [
      {
        when: { type: 'database' },
        account: '${{ environment.accounts.pg.id }}',
      },
      {
        when: { type: 'ingressRule' },
        account: '${{ accounts.gateway.id }}',
        registry: '${{ resources.service-registry.id }}',
        dnsZone: '${{ environment.name }}.127.0.0.1.nip.io',
        namespace: '${{ environment.name }}',
      },
      {
        when: {
          type: 'deployment',
          image: 'oryd/kratos-selfservice-ui-node:v0.13.0',
        },
        platform: 'linux/amd64',
      },
      {
        when: { type: 'secret' },
        account: '${{ variables.secretAccount }}',
      },
      {
        when: { type: 'service' },
        account: '${{ accounts.gateway.id }}',
        dnsZone: '${{ environment.name }}.172.17.0.1.nip.io',
        namespace: '${{ environment.name }}',
      },
      {
        account: '${{ variables.account }}',
        namespace: '${{ environment.name }}',
      },
    ],
  },
};

describe('HCL Datacenter parser', () => {
  it(`should properly convert HCL to JSON`, () => {
    const raw_obj = hclParser.default.parseToObject(hclString)[0];
    raw_obj.input_type = 'hcl';
    const parsedHcl = convertHclToJSON(raw_obj);
    assertEquals(parsedHcl as any, expectedJSON as any);
  });
});
