import { ResourceInputs } from '../../@resources/index.ts';
import { AwsCredentials } from './credentials.ts';
import { AWS, EC2 } from 'deps';

export interface AwsIds {
  private: string[];
  public: string[];
}
export interface RouteTableIds {
  private: string[];
  public: string[];
  privateAssocationIds: string[];
  publicAssociationIds: string[];
  publicGatewayIds: string[];
}

export class EksNodeGroupIds {
  id: string = '';
  launchTemplate: string = '';
  poolName: string = '';
}

export class EksSecurityGroupRules {
  clusterEgressNode443: string = '';
  clusterIngressNode443: string = '';
  nodeIngressCluster443: string = '';
  nodeIngressClusterKubelet: string = '';
  nodeIngressSelfCoreDnsTcp: string = '';
  nodeIngressSelfCoreDnsUdp: string = '';
}

export class EksIds {
  nodeGroups: EksNodeGroupIds[] = [];
  eks: string = '';
  vpcId: string = '';
  cloudWatchLogs: string = '';
  workerIam: string = '';
  workerSg: string = '';
  clusterSg: string = '';
  nodeSg: string = '';
  nodePoolSg: { [key: string]: string } = {};
  securityGroupRules: EksSecurityGroupRules = new EksSecurityGroupRules();
}

export default class AwsUtils {
  public static getEKS(credentials: AwsCredentials, region = 'us-east-1'): AWS.EKS {
    return new AWS.EKS({
      apiVersion: '2022-10-05',
      region: region,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
      },
    });
  }

  public static getRDS(credentials: AwsCredentials, region = 'us-east-1'): AWS.RDS {
    return new AWS.RDS({
      apiVersion: '2022-10-05',
      region: region,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
      },
    });
  }

  public static getEC2(credentials: AwsCredentials, region = 'us-east-1'): AWS.EC2 {
    return new AWS.EC2({
      apiVersion: '2022-10-05',
      region: region,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
      },
    });
  }

  public static getRoute53(credentials: AwsCredentials, region = 'us-east-1'): AWS.Route53 {
    return new AWS.Route53({
      apiVersion: '2022-10-05',
      region: region,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
      },
    });
  }

  public static getIAM(credentials: AwsCredentials, region = 'us-east-1'): AWS.IAM {
    return new AWS.IAM({
      apiVersion: '2022-10-05',
      region: region,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
      },
    });
  }

  public static getCloudWatchLogs(credentials: AwsCredentials, region = 'us-east-1'): AWS.CloudWatchLogs {
    return new AWS.CloudWatchLogs({
      apiVersion: '2022-10-05',
      region: region,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
      },
    });
  }

  public static getAutoScaling(credentials: AwsCredentials, region = 'us-east-1'): AWS.AutoScaling {
    return new AWS.AutoScaling({
      apiVersion: '2022-10-05',
      region: region,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
      },
    });
  }

  public static async getNatGateways(credentials: AwsCredentials, region: string, id: string): Promise<string[]> {
    const natGatewayData = await AwsUtils.getEC2(credentials, region)
      .describeNatGateways({
        Filter: [
          {
            Name: 'vpc-id',
            Values: [id],
          },
        ],
      })
      .promise();
    const results = [];
    for (const gateway of natGatewayData.NatGateways || []) {
      if (gateway.NatGatewayId) {
        results.push(gateway.NatGatewayId);
      }
    }
    return results;
  }

  public static async getElasticIPs(credentials: AwsCredentials, region: string, name: string): Promise<string> {
    const addressData = await AwsUtils.getEC2(credentials, region)
      .describeAddresses({
        Filters: [
          {
            Name: 'tag:architectResourceId',
            Values: [name],
          },
        ],
      })
      .promise();
    for (const address of addressData.Addresses || []) {
      if (address.Domain === 'vpc' && address.PublicIpv4Pool === 'amazon') {
        return address.AllocationId || '';
      }
    }
    return '';
  }

  public static async getSubnetIdsForVpc(
    credentials: AwsCredentials,
    region: string,
    id: string,
  ): Promise<{ private: string[]; public: string[] }> {
    const subnetsData = await AwsUtils.getEC2(credentials, region)
      .describeSubnets({
        Filters: [
          {
            Name: 'vpc-id',
            Values: [id],
          },
        ],
      })
      .promise();

    const ids: AwsIds = {
      public: [],
      private: [],
    };
    for (const subnet of subnetsData.Subnets || []) {
      if (!subnet.SubnetId) {
        continue;
      }

      if (subnet.MapPublicIpOnLaunch) {
        ids.public.push(subnet.SubnetId);
      } else {
        ids.private.push(subnet.SubnetId);
      }
    }
    return ids;
  }

  public static async getNameForVpc(credentials: AwsCredentials, region: string, id: string): Promise<string> {
    const vpcs = await AwsUtils.getEC2(credentials, region)
      .describeVpcs({
        VpcIds: [id],
      })
      .promise();
    if (!vpcs.Vpcs) {
      throw new Error(`Unable to find vpc with id ${id}`);
    }
    const vpc = vpcs?.Vpcs[0] || {};
    for (const tag of vpc.Tags || []) {
      if (tag.Key === 'architectResourceId') {
        return tag.Value || '';
      }
    }
    return '';
  }

  public static async getRouteIdsForVpc(
    credentials: AwsCredentials,
    region: string,
    id: string,
  ): Promise<RouteTableIds> {
    const routeTableData = await AwsUtils.getEC2(credentials, region)
      .describeRouteTables({
        Filters: [
          {
            Name: 'vpc-id',
            Values: [id],
          },
        ],
      })
      .promise();

    const ids: RouteTableIds = {
      public: [],
      private: [],
      privateAssocationIds: [],
      publicAssociationIds: [],
      publicGatewayIds: [],
    };
    for (const routeTable of routeTableData.RouteTables || []) {
      if (!routeTable.RouteTableId) {
        continue;
      }
      if (!routeTable.Associations) {
        continue;
      }
      const nameTag: EC2.Tag | undefined = routeTable.Tags?.find((tag) => {
        return tag.Key === 'Name';
      });
      if (!nameTag) {
        continue;
      }
      const nameParts = nameTag?.Value?.split('-') || [];
      if (nameParts.includes('public')) {
        ids.public.push(routeTable.RouteTableId);
        for (const route of routeTable.Routes || []) {
          if (route.GatewayId && route.GatewayId.indexOf('igw') === 0) {
            ids.publicGatewayIds.push(route.GatewayId);
          }
        }
        for (const association of routeTable.Associations || []) {
          if (association.RouteTableAssociationId) {
            ids.publicAssociationIds.push(
              `${routeTable.RouteTableId}/${nameTag.Value}/${association.RouteTableAssociationId}`,
            );
          }
        }
      } else if (nameParts.includes('private')) {
        ids.private.push(routeTable.RouteTableId);
        for (const association of routeTable.Associations || []) {
          if (association.RouteTableAssociationId) {
            ids.privateAssocationIds.push(
              `${routeTable.RouteTableId}/${nameTag.Value}/${association.RouteTableAssociationId}`,
            );
          }
        }
      }
    }
    return ids;
  }

  public static async getEksInputs(
    credentials: AwsCredentials,
    region: string,
    id: string,
  ): Promise<ResourceInputs['kubernetesCluster']> {
    const eks = await this.getEKS(credentials, region);
    const results: Partial<ResourceInputs['kubernetesCluster']> = {
      name: id,
      nodePools: [],
      region: region,
      type: 'kubernetesCluster',
    };
    await new Promise(async (resolve) => {
      const nodeGroupsData = await eks
        .listNodegroups({
          clusterName: id,
        })
        .promise();
      const nodeGroupPromises: Promise<void>[] = [];
      for (const nodeGroupId of nodeGroupsData.nodegroups || []) {
        nodeGroupPromises.push(
          new Promise((resolve, reject) => {
            eks.describeNodegroup(
              {
                clusterName: id,
                nodegroupName: nodeGroupId,
              },
              (err, data) => {
                if (err) {
                  return reject(err);
                }
                const tags = Object.entries(data.nodegroup?.tags || {});
                results.nodePools?.push({
                  name:
                    tags.find((tag) => {
                      return tag[0] === 'Name';
                    })?.[1] || '',
                  count: data.nodegroup?.scalingConfig?.maxSize || 1,
                  nodeSize: (data.nodegroup?.instanceTypes || [])[0] || '',
                });
                resolve();
              },
            );
          }),
        );
      }

      await Promise.all(nodeGroupPromises);
      resolve({});
    });

    await new Promise(async (resolve) => {
      const clusterData = await eks
        .describeCluster({
          name: id,
        })
        .promise();
      results.region = region;
      results.vpc = `${region}/${clusterData.cluster?.resourcesVpcConfig?.vpcId}`;
      resolve({});
    });

    return results as ResourceInputs['kubernetesCluster'];
  }

  private static securityGroupRuleToId(rule: EC2.SecurityGroupRule): string {
    const groupId = rule.GroupId || '';
    const type = rule.IsEgress ? 'egress' : 'ingress';
    const protocol = rule.IpProtocol || '';
    const fromPort = rule.FromPort || '';
    const toPort = rule.ToPort || '';
    const source = rule.CidrIpv4 || rule.CidrIpv6 || rule.ReferencedGroupInfo?.GroupId || '';

    return [groupId, type, protocol, fromPort, toPort, source].join('_');
  }

  private static getSecurityGroupRules(
    clusterId: string,
    nodeId: string,
    rules: EC2.SecurityGroupRuleList,
  ): EksSecurityGroupRules {
    const results = new EksSecurityGroupRules();
    for (const rule of rules) {
      const id = this.securityGroupRuleToId(rule);
      if (rule.GroupId === clusterId) {
        // This is a cluster rule
        if (rule.Description === 'Cluster API to node groups') {
          results.clusterEgressNode443 = id;
        } else if (rule.Description === 'Node groups to cluster API') {
          results.clusterIngressNode443 = id;
        }
      } else if (rule.GroupId === nodeId) {
        // This is a node rule
        if (rule.Description === 'Cluster API to node kubelets') {
          results.nodeIngressClusterKubelet = id;
        } else if (rule.Description === 'Node to node CoreDNS') {
          results.nodeIngressSelfCoreDnsTcp = id;
        } else if (rule.Description === 'Node to node CoreDNS UDP') {
          results.nodeIngressSelfCoreDnsUdp = id;
        } else if (rule.Description === 'Cluster API to node groups') {
          results.nodeIngressCluster443 = id;
        }
      }
    }
    return results;
  }

  public static async getEksIds(credentials: AwsCredentials, region: string, id: string): Promise<EksIds> {
    const ec2 = await this.getEC2(credentials, region);
    const eks = await this.getEKS(credentials, region);
    const iam = await this.getIAM(credentials, region);
    const cwl = await this.getCloudWatchLogs(credentials, region);
    const results: EksIds = new EksIds();
    const promises: Promise<void>[] = [];

    results.eks = id;

    promises.push(
      new Promise(async (resolve) => {
        const clusterData = await eks
          .describeCluster({
            name: id,
          })
          .promise();
        results.vpcId = clusterData.cluster?.resourcesVpcConfig?.vpcId || '';
        resolve();
      }),
    );

    promises.push(
      new Promise(async (resolve) => {
        const nodeGroupsData = await eks
          .listNodegroups({
            clusterName: id,
          })
          .promise();
        for (const nodeGroupId of nodeGroupsData.nodegroups || []) {
          const nodeGroupData = await eks
            .describeNodegroup({
              clusterName: id,
              nodegroupName: nodeGroupId,
            })
            .promise();
          const launchTemplateData = await ec2
            .describeLaunchTemplates({
              Filters: [
                {
                  Name: 'tag:eks:nodegroup-name',
                  Values: [nodeGroupId],
                },
              ],
            })
            .promise();
          results.nodeGroups.push({
            id: `${nodeGroupData.nodegroup?.clusterName}:${nodeGroupData.nodegroup?.nodegroupName}`,
            launchTemplate: (launchTemplateData?.LaunchTemplates || [])[0]?.LaunchTemplateId || '',
            poolName: (nodeGroupData.nodegroup?.tags || {}).Name || '',
          });
        }
        resolve();
      }),
    );

    promises.push(
      new Promise(async (resolve) => {
        const logGroupsData = await cwl.describeLogGroups().promise();
        const logGroups = logGroupsData.logGroups || [];
        for (const logGroup of logGroups) {
          const tagsData = await cwl
            .listTagsLogGroup({
              logGroupName: logGroup.logGroupName || '',
            })
            .promise();
          const tags = Object.entries(tagsData.tags || {});
          const isInCluster = tags.find((tag) => {
            return tag[0] === 'architectResourceId' && tag[1] === id;
          });
          if (isInCluster) {
            results.cloudWatchLogs = logGroup.logGroupName || '';
          }
        }
        resolve();
      }),
    );

    promises.push(
      new Promise(async (resolve) => {
        const rolesData = await iam.listRoles().promise();
        const roles = rolesData.Roles;
        for (const role of roles) {
          const tagsData = await iam.listRoleTags({ RoleName: role.RoleName }).promise();
          const isInCluster = (tagsData.Tags || []).find((tag) => {
            return tag.Key === 'architectResourceId' && tag.Value === id;
          });
          if (!isInCluster) {
            continue;
          }
          if (role.Description === 'EKS managed node group IAM role') {
            results.workerIam = role.RoleName;
            continue;
          }
        }
        resolve();
      }),
    );

    promises.push(
      new Promise(async (resolve) => {
        const securityGroupsData = await ec2
          .describeSecurityGroups({
            Filters: [
              {
                Name: 'tag:architectResourceId',
                Values: [id],
              },
            ],
          })
          .promise();
        const getIdForDescription = (description: string): string => {
          return (
            securityGroupsData.SecurityGroups?.find((group) => {
              return group.Description === description;
            })?.GroupId || ''
          );
        };
        results.clusterSg = getIdForDescription('EKS cluster security group');
        results.nodeSg = getIdForDescription('EKS node shared security group');

        const rules = await ec2
          .describeSecurityGroupRules({
            Filters: [{ Name: 'group-id', Values: [results.clusterSg, results.nodeSg] }],
          })
          .promise();
        results.securityGroupRules = this.getSecurityGroupRules(
          results.clusterSg,
          results.nodeSg,
          rules.SecurityGroupRules || [],
        );

        results.nodePoolSg = {};
        const nodePoolSgs = securityGroupsData.SecurityGroups?.filter((group) => {
          return group.Description === 'EKS managed node group security group';
        });
        for (const nodePoolSg of nodePoolSgs || []) {
          const key = nodePoolSg.GroupName?.split('-eks-node-group-')[0] || '';
          results.nodePoolSg[key] = nodePoolSg.GroupId || '';
        }
        resolve();
      }),
    );

    await Promise.all(promises);
    return results;
  }
}
