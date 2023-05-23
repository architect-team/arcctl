import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.js';
import { ResourceModule } from '../../module.js';
import { Eks } from '../.gen/modules/eks.js';
import { DataAwsEksClusterAuth } from '../.gen/providers/aws/data-aws-eks-cluster-auth/index.js';
import { DataAwsEksCluster } from '../.gen/providers/aws/data-aws-eks-cluster/index.js';
import { DataAwsSubnets } from '../.gen/providers/aws/data-aws-subnets/index.js';
import { AwsProvider } from '../.gen/providers/aws/provider/index.js';
import { Sleep } from '../.gen/providers/time/sleep/index.js';
import { AwsCredentials } from '../credentials.js';
import AwsUtils from '../utils.js';
import { TerraformOutput } from 'cdktf';
import { Construct } from 'constructs';

export class AwsKubernetesClusterModule extends ResourceModule<
  'kubernetesCluster',
  AwsCredentials
> {
  private eks: Eks;
  private subnet_ids: DataAwsSubnets;
  private dataAwsEksCluster: DataAwsEksCluster;
  private dataAwsEksClusterAuth: DataAwsEksClusterAuth;
  outputs: ResourceOutputs['kubernetesCluster'];

  // Used for kubeconfig yaml generation
  private readonly clusterEndpointOutput: TerraformOutput;
  private readonly clusterCaOutput: TerraformOutput;

  constructor(
    scope: Construct,
    private id: string,
    inputs: ResourceInputs['kubernetesCluster'],
  ) {
    super(scope, id, inputs);

    if (inputs.region) {
      (this.scope.node.children[0] as AwsProvider).region = inputs.region;
    }

    const vpc_parts = inputs.vpc
      ? inputs.vpc.match(/^([\dA-Za-z-]+)\/(.*)$/)
      : [];
    if (!vpc_parts && this.inputs.name) {
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

    const nodeGroups = this.inputs.nodePools
      ? this.inputs.nodePools.map((nodePool) => ({
          desired_size: 1,
          instance_types: [nodePool.nodeSize],
          max_size: nodePool.count,
          min_size: 1,
          name: nodePool.name,
        }))
      : [];
    const managedNodeGroups: Record<string, typeof nodeGroups[number]> = {};
    for (const nodeGroup of nodeGroups) {
      managedNodeGroups[nodeGroup.name] = nodeGroup;
    }

    this.eks = new Eks(this, 'eks', {
      clusterName: inputs.name || 'deleting',
      clusterVersion: inputs.kubernetesVersion,
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
        architectResourceId: inputs.name,
      },
      eksManagedNodeGroups: managedNodeGroups,
      subnetIds: this.subnet_ids.ids,
      vpcId: vpc_id,
    });

    this.dataAwsEksCluster = new DataAwsEksCluster(this, 'eks-cluster', {
      name: this.eks.clusterName || this.inputs.name,
      dependsOn: [this.eks],
    });

    // We need to fetch the authentication data from the EKS cluster as well
    this.dataAwsEksClusterAuth = new DataAwsEksClusterAuth(this, 'eks-auth', {
      name: this.dataAwsEksCluster.name,
    });

    this.clusterEndpointOutput = new TerraformOutput(this, 'clusterEndpoint', {
      value: this.dataAwsEksCluster.endpoint,
      description: 'Endpoint for EKS control plane',
      sensitive: true,
    });
    this.clusterCaOutput = new TerraformOutput(this, 'clusterCa', {
      value: this.dataAwsEksCluster.certificateAuthority.get(0).data,
      description: 'CA for EKS control plane',
      sensitive: true,
    });

    this.outputs = {
      id: `${this.inputs.region}/${this.eks.clusterIdOutput}`,
      kubernetesVersion: this.eks.clusterVersion || '',
      name: this.eks.clusterName || this.inputs.name,
      vpc: this.eks.vpcId || this.inputs.vpc,
      provider: `kubernetesCluster-${this.inputs.name}`,
    };
  }

  async genImports(
    credentials: AwsCredentials,
    resourceId: string,
  ): Promise<Record<string, string>> {
    const match = resourceId.match(/^([\dA-Za-z-]+)\/([\w-]+)$/);
    if (!match) {
      throw new Error('ID must be of the format, <region>/<uuid>');
    }

    const [_, region, clusterId] = match;
    this.id = clusterId;
    this.dataAwsEksCluster.name = clusterId;
    this.dataAwsEksClusterAuth.name = clusterId;
    const moduleId = ['module', this.eks.friendlyUniqueId].join('.');

    const ids = await AwsUtils.getEksIds(credentials, region, clusterId);

    const aws_provider = this.scope.node.children[0] as AwsProvider;
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
      [`${moduleId}.aws_security_group_rule.node["ingress_cluster_443"]`]:
        ids.securityGroupRules.nodeIngressCluster443,
      [`${moduleId}.aws_security_group_rule.node["ingress_cluster_kubelet"]`]:
        ids.securityGroupRules.nodeIngressClusterKubelet,
      [`${moduleId}.aws_security_group_rule.node["ingress_self_coredns_tcp"]`]:
        ids.securityGroupRules.nodeIngressSelfCoreDnsTcp,
      [`${moduleId}.aws_security_group_rule.node["ingress_self_coredns_udp"]`]:
        ids.securityGroupRules.nodeIngressSelfCoreDnsUdp,
    };

    for (const [key, id] of Object.entries(ids.nodePoolSg)) {
      results[
        `${moduleId}.module.eks_managed_node_group["${key}"].aws_security_group.this[0]`
      ] = id;
    }

    const node_groups = [];
    for (let i = 0; i < ids.nodeGroups.length; i++) {
      const nodeGroup = ids.nodeGroups[i];
      results[
        `${moduleId}.module.eks_managed_node_group["${i}"].aws_eks_node_group.this[0]`
      ] = nodeGroup.id;
      results[
        `${moduleId}.module.eks_managed_node_group["${i}"].aws_launch_template.this[0]`
      ] = nodeGroup.launchTemplate;

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
    for (let i = 0; i < (this.inputs.nodePools || []).length; i++) {
      const nodeGroup = this.inputs.nodePools[i];
      results[
        `${moduleId}.module.eks_managed_node_group["${nodeGroup.name}"].aws_eks_node_group.this[${i}]`
      ] = `Node Pool ${nodeGroup.name}`;
    }
    return results;
  }
}
