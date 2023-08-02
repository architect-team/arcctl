import { Construct } from 'constructs';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule, ResourceModuleOptions } from '../../module.ts';
import { Eks } from '../.gen/modules/eks.ts';
import { DataAwsEksClusterAuth } from '../.gen/providers/aws/data-aws-eks-cluster-auth/index.ts';
import { DataAwsEksCluster } from '../.gen/providers/aws/data-aws-eks-cluster/index.ts';
import { DataAwsSubnets } from '../.gen/providers/aws/data-aws-subnets/index.ts';
import { AwsProvider as TerraformAwsProvider } from '../.gen/providers/aws/provider/index.ts';
import { Sleep } from '../.gen/providers/time/sleep/index.ts';
import { AwsCredentials } from '../credentials.ts';
import AwsUtils from '../utils.ts';

export class AwsKubernetesClusterModule extends ResourceModule<'kubernetesCluster', AwsCredentials> {
  private eks: Eks;
  private subnet_ids: DataAwsSubnets;
  private dataAwsEksCluster: DataAwsEksCluster;
  private dataAwsEksClusterAuth: DataAwsEksClusterAuth;
  outputs: ResourceOutputs['kubernetesCluster'];

  constructor(private scope: Construct, options: ResourceModuleOptions<'kubernetesCluster', AwsCredentials>) {
    super(scope, options);

    new TerraformAwsProvider(this, 'aws', {
      accessKey: this.credentials.accessKeyId,
      secretKey: this.credentials.secretAccessKey,
      region: this.inputs?.region,
    });

    const vpc_parts = this.inputs?.vpc.match(/^([\dA-Za-z-]+)\/(.*)$/) || ['unknown', 'unknown'];
    if (this.inputs && vpc_parts[1] === 'unknown') {
      throw new Error('VPC must be of the format, <region>/<vpc_id>');
    }
    const vpc_id = vpc_parts ? vpc_parts[2] : '';

    const fake_subnet_ids = new DataAwsSubnets(this, 'fake_subnet_ids', {
      filter: [
        {
          name: 'tag:Name',
          values: ['*-private-*'],
        },
        {
          name: 'vpc-id',
          values: [vpc_id],
        },
      ],
    });

    const subnet_sleep = new Sleep(this, 'subnet_sleep', {
      dependsOn: [fake_subnet_ids],
      createDuration: '10s',
    });

    this.subnet_ids = new DataAwsSubnets(this, 'subnet_ids', {
      dependsOn: [subnet_sleep],
      filter: [
        {
          name: 'tag:Name',
          values: ['*-private-*'],
        },
        {
          name: 'vpc-id',
          values: [vpc_id],
        },
      ],
    });

    const nodeGroups = this.inputs?.nodePools
      ? this.inputs.nodePools.map((nodePool) => ({
        desired_size: 1,
        instance_types: [nodePool.nodeSize],
        max_size: nodePool.count,
        min_size: 1,
        name: nodePool.name,
      }))
      : [];
    const managedNodeGroups: Record<string, (typeof nodeGroups)[number]> = {};
    for (const nodeGroup of nodeGroups) {
      managedNodeGroups[nodeGroup.name] = nodeGroup;
    }

    this.eks = new Eks(this, 'eks', {
      clusterName: this.inputs?.name || 'unknown',
      clusterVersion: this.inputs?.kubernetesVersion || 'unknown',
      createClusterSecurityGroup: true,
      createNodeSecurityGroup: true,
      clusterEndpointPublicAccess: true,
      clusterAddons: {
        coredns: {
          most_recent: true,
        },
        'kube-proxy': {
          most_recent: true,
        },
        'vpc-cni': {
          most_recent: true,
        },
      },
      eksManagedNodeGroupDefaults: {
        amiType: 'AL2X86_64',
        attachClusterPrimarySecurityGroup: true,
        createSecurityGroup: false,
      },
      tags: {
        architectResourceId: this.inputs?.name || 'unknown',
      },
      eksManagedNodeGroups: managedNodeGroups,
      subnetIds: this.subnet_ids.ids,
      vpcId: vpc_id,
    });

    this.dataAwsEksCluster = new DataAwsEksCluster(this, 'eks-cluster', {
      name: this.eks.clusterName || this.inputs?.name || 'unknown',
      dependsOn: [this.eks],
    });

    // We need to fetch the authentication data from the EKS cluster as well
    this.dataAwsEksClusterAuth = new DataAwsEksClusterAuth(this, 'eks-auth', {
      name: this.dataAwsEksCluster.name,
    });

    const file = new options.FileConstruct(this, 'configFile', {
      filename: 'config.yml',
      content: `apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: ${this.dataAwsEksCluster.certificateAuthority.get(0).data}
    server: ${this.dataAwsEksCluster.endpoint}
  name: cluster
contexts:
- context:
    cluster: cluster
    user: cluster
  name: cluster
current-context: cluster
kind: Config
preferences: {}
users:
- name: cluster
  user:
    exec:
      apiVersion: client.authentication.k8s.io/v1beta1
      args:
      - --region
      - ${this.inputs?.region}
      - eks
      - get-token
      - --cluster-name
      - cluster
      command: aws`,
    });

    this.outputs = {
      id: `${this.inputs?.region}/${this.dataAwsEksCluster.id}`,
      kubernetesVersion: this.eks.clusterVersion || 'unknown',
      name: this.eks.clusterName || this.inputs?.name || 'unknown',
      vpc: this.eks.vpcId || 'unknown',
      configPath: file.filename,
    };
  }

  async genImports(resourceId: string): Promise<Record<string, string>> {
    const match = resourceId.match(/^([\dA-Za-z-]+)\/([\w-]+)$/);
    if (!match) {
      throw new Error('ID must be of the format, <region>/<uuid>');
    }

    const [_, region, clusterId] = match;
    this.dataAwsEksCluster.name = clusterId;
    this.dataAwsEksClusterAuth.name = clusterId;
    const moduleId = ['module', this.eks.friendlyUniqueId].join('.');

    const ids = await AwsUtils.getEksIds(this.credentials, region, clusterId);

    const aws_provider = this.scope.node.children[0] as TerraformAwsProvider;
    aws_provider.region = region;

    this.eks.vpcId = ids.vpcId;
    this.subnet_ids.resetFilter();
    this.subnet_ids.putFilter([
      {
        name: 'tag:Name',
        values: ['*-private-*'],
      },
      {
        name: 'vpc-id',
        values: [ids.vpcId],
      },
    ]);

    const results = {
      // EKS Cluster
      [`${moduleId}.aws_eks_cluster.this[0]`]: clusterId,

      // Cloud Watch Logs
      [`${moduleId}.aws_cloudwatch_log_group.this[0]`]: ids.cloudWatchLogs,

      // IAM Role
      [`${moduleId}.aws_iam_role.this[0]`]: ids.workerIam,

      // Security Groups
      [`${moduleId}.aws_security_group.cluster[0]`]: ids.clusterSg,
      [`${moduleId}.aws_security_group.node[0]`]: ids.nodeSg,

      // Security Group Rules
      [`${moduleId}.aws_security_group_rule.cluster["ingress_nodes_443"]`]:
        ids.securityGroupRules.clusterIngressNode443,
      [`${moduleId}.aws_security_group_rule.node["ingress_cluster_443"]`]: ids.securityGroupRules.nodeIngressCluster443,
      [`${moduleId}.aws_security_group_rule.node["ingress_cluster_kubelet"]`]:
        ids.securityGroupRules.nodeIngressClusterKubelet,
      [`${moduleId}.aws_security_group_rule.node["ingress_self_coredns_tcp"]`]:
        ids.securityGroupRules.nodeIngressSelfCoreDnsTcp,
      [`${moduleId}.aws_security_group_rule.node["ingress_self_coredns_udp"]`]:
        ids.securityGroupRules.nodeIngressSelfCoreDnsUdp,
    };

    for (const [key, id] of Object.entries(ids.nodePoolSg)) {
      results[`${moduleId}.module.eks_managed_node_group["${key}"].aws_security_group.this[0]`] = id;
    }

    const node_groups = [];
    for (let i = 0; i < ids.nodeGroups.length; i++) {
      const nodeGroup = ids.nodeGroups[i];
      results[`${moduleId}.module.eks_managed_node_group["${i}"].aws_eks_node_group.this[0]`] = nodeGroup.id;
      results[`${moduleId}.module.eks_managed_node_group["${i}"].aws_launch_template.this[0]`] =
        nodeGroup.launchTemplate;

      node_groups.push({
        desired_size: 1,
        instance_types: ['t2.medium'],
        max_size: 1,
        min_size: 1,
        name: nodeGroup.poolName,
        launch_template_name: nodeGroup.launchTemplate,
      });
    }
    this.eks.eksManagedNodeGroups = node_groups;

    return results;
  }

  getDisplayNames(): Record<string, string> {
    const moduleId = ['module', this.eks.friendlyUniqueId].join('.');

    const results = {
      [`${moduleId}.aws_eks_cluster.this[0]`]: 'Cluster',
    };
    for (let i = 0; i < (this.inputs?.nodePools || []).length; i++) {
      const nodeGroup = this.inputs!.nodePools[i];
      results[
        `${moduleId}.module.eks_managed_node_group["${nodeGroup.name}"].aws_eks_node_group.this[${i}]`
      ] = `Node Pool ${nodeGroup.name}`;
    }
    return results;
  }
}
