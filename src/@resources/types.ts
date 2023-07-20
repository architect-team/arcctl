import type arcctlAccountInputs from './arcctlAccount/inputs.ts';
import type arcctlAccountOutputs from './arcctlAccount/outputs.ts';
import type containerBuildInputs from './containerBuild/inputs.ts';
import type containerBuildOutputs from './containerBuild/outputs.ts';
import type containerPushInputs from './containerPush/inputs.ts';
import type containerPushOutputs from './containerPush/outputs.ts';
import type containerTagInputs from './containerTag/inputs.ts';
import type containerTagOutputs from './containerTag/outputs.ts';
import type cronjobInputs from './cronjob/inputs.ts';
import type cronjobOutputs from './cronjob/outputs.ts';
import type databaseInputs from './database/inputs.ts';
import type databaseOutputs from './database/outputs.ts';
import type databaseSchemaInputs from './databaseSchema/inputs.ts';
import type databaseSchemaOutputs from './databaseSchema/outputs.ts';
import type databaseSizeInputs from './databaseSize/inputs.ts';
import type databaseSizeOutputs from './databaseSize/outputs.ts';
import type databaseTypeInputs from './databaseType/inputs.ts';
import type databaseTypeOutputs from './databaseType/outputs.ts';
import type databaseUserInputs from './databaseUser/inputs.ts';
import type databaseUserOutputs from './databaseUser/outputs.ts';
import type databaseVersionInputs from './databaseVersion/inputs.ts';
import type databaseVersionOutputs from './databaseVersion/outputs.ts';
import type deploymentInputs from './deployment/inputs.ts';
import type deploymentOutputs from './deployment/outputs.ts';
import type dnsRecordInputs from './dnsRecord/inputs.ts';
import type dnsRecordOutputs from './dnsRecord/outputs.ts';
import type dnsZoneInputs from './dnsZone/inputs.ts';
import type dnsZoneOutputs from './dnsZone/outputs.ts';
import type helmChartInputs from './helmChart/inputs.ts';
import type helmChartOutputs from './helmChart/outputs.ts';
import type ingressRuleInputs from './ingressRule/inputs.ts';
import type ingressRuleOutputs from './ingressRule/outputs.ts';
import type kubernetesClusterInputs from './kubernetesCluster/inputs.ts';
import type kubernetesClusterOutputs from './kubernetesCluster/outputs.ts';
import type kubernetesVersionInputs from './kubernetesVersion/inputs.ts';
import type kubernetesVersionOutputs from './kubernetesVersion/outputs.ts';
import type namespaceInputs from './namespace/inputs.ts';
import type namespaceOutputs from './namespace/outputs.ts';
import type nodeInputs from './node/inputs.ts';
import type nodeOutputs from './node/outputs.ts';
import type nodeSizeInputs from './nodeSize/inputs.ts';
import type nodeSizeOutputs from './nodeSize/outputs.ts';
import type ociBuildInputs from './ociBuild/inputs.ts';
import type ociBuildOutputs from './ociBuild/outputs.ts';
import type ociPushInputs from './ociPush/inputs.ts';
import type ociPushOutputs from './ociPush/outputs.ts';
import type ociTagInputs from './ociTag/inputs.ts';
import type ociTagOutputs from './ociTag/outputs.ts';
import type regionInputs from './region/inputs.ts';
import type regionOutputs from './region/outputs.ts';
import type repositoryInputs from './repository/inputs.ts';
import type repositoryOutputs from './repository/outputs.ts';
import type secretInputs from './secret/inputs.ts';
import type secretOutputs from './secret/outputs.ts';
import type serviceInputs from './service/inputs.ts';
import type serviceOutputs from './service/outputs.ts';
import type taskInputs from './task/inputs.ts';
import type taskOutputs from './task/outputs.ts';
import type volumeInputs from './volume/inputs.ts';
import type volumeOutputs from './volume/outputs.ts';
import type vpcInputs from './vpc/inputs.ts';
import type vpcOutputs from './vpc/outputs.ts';

export type ResourceType =
  | 'arcctlAccount'
  | 'containerBuild'
  | 'containerPush'
  | 'containerTag'
  | 'cronjob'
  | 'database'
  | 'databaseSchema'
  | 'databaseSize'
  | 'databaseType'
  | 'databaseUser'
  | 'databaseVersion'
  | 'deployment'
  | 'dnsRecord'
  | 'dnsZone'
  | 'helmChart'
  | 'ingressRule'
  | 'kubernetesCluster'
  | 'kubernetesVersion'
  | 'namespace'
  | 'node'
  | 'nodeSize'
  | 'ociBuild'
  | 'ociPush'
  | 'ociTag'
  | 'region'
  | 'repository'
  | 'secret'
  | 'service'
  | 'task'
  | 'volume'
  | 'vpc'
;

export const ResourceTypeList: ResourceType[] = [
  'arcctlAccount',
  'containerBuild',
  'containerPush',
  'containerTag',
  'cronjob',
  'database',
  'databaseSchema',
  'databaseSize',
  'databaseType',
  'databaseUser',
  'databaseVersion',
  'deployment',
  'dnsRecord',
  'dnsZone',
  'helmChart',
  'ingressRule',
  'kubernetesCluster',
  'kubernetesVersion',
  'namespace',
  'node',
  'nodeSize',
  'ociBuild',
  'ociPush',
  'ociTag',
  'region',
  'repository',
  'secret',
  'service',
  'task',
  'volume',
  'vpc',
];

export type ResourceInputs = {
  'arcctlAccount': {
    type: 'arcctlAccount';
    account?: string;
  } & arcctlAccountInputs;
  'containerBuild': {
    type: 'containerBuild';
    account?: string;
  } & containerBuildInputs;
  'containerPush': {
    type: 'containerPush';
    account?: string;
  } & containerPushInputs;
  'containerTag': {
    type: 'containerTag';
    account?: string;
  } & containerTagInputs;
  'cronjob': {
    type: 'cronjob';
    account?: string;
  } & cronjobInputs;
  'database': {
    type: 'database';
    account?: string;
  } & databaseInputs;
  'databaseSchema': {
    type: 'databaseSchema';
    account?: string;
  } & databaseSchemaInputs;
  'databaseSize': {
    type: 'databaseSize';
    account?: string;
  } & databaseSizeInputs;
  'databaseType': {
    type: 'databaseType';
    account?: string;
  } & databaseTypeInputs;
  'databaseUser': {
    type: 'databaseUser';
    account?: string;
  } & databaseUserInputs;
  'databaseVersion': {
    type: 'databaseVersion';
    account?: string;
  } & databaseVersionInputs;
  'deployment': {
    type: 'deployment';
    account?: string;
  } & deploymentInputs;
  'dnsRecord': {
    type: 'dnsRecord';
    account?: string;
  } & dnsRecordInputs;
  'dnsZone': {
    type: 'dnsZone';
    account?: string;
  } & dnsZoneInputs;
  'helmChart': {
    type: 'helmChart';
    account?: string;
  } & helmChartInputs;
  'ingressRule': {
    type: 'ingressRule';
    account?: string;
  } & ingressRuleInputs;
  'kubernetesCluster': {
    type: 'kubernetesCluster';
    account?: string;
  } & kubernetesClusterInputs;
  'kubernetesVersion': {
    type: 'kubernetesVersion';
    account?: string;
  } & kubernetesVersionInputs;
  'namespace': {
    type: 'namespace';
    account?: string;
  } & namespaceInputs;
  'node': {
    type: 'node';
    account?: string;
  } & nodeInputs;
  'nodeSize': {
    type: 'nodeSize';
    account?: string;
  } & nodeSizeInputs;
  'ociBuild': {
    type: 'ociBuild';
    account?: string;
  } & ociBuildInputs;
  'ociPush': {
    type: 'ociPush';
    account?: string;
  } & ociPushInputs;
  'ociTag': {
    type: 'ociTag';
    account?: string;
  } & ociTagInputs;
  'region': {
    type: 'region';
    account?: string;
  } & regionInputs;
  'repository': {
    type: 'repository';
    account?: string;
  } & repositoryInputs;
  'secret': {
    type: 'secret';
    account?: string;
  } & secretInputs;
  'service': {
    type: 'service';
    account?: string;
  } & serviceInputs;
  'task': {
    type: 'task';
    account?: string;
  } & taskInputs;
  'volume': {
    type: 'volume';
    account?: string;
  } & volumeInputs;
  'vpc': {
    type: 'vpc';
    account?: string;
  } & vpcInputs;
};

export type ResourceOutputs = {
  'arcctlAccount': {
    id: string;
  } & arcctlAccountOutputs;
  'containerBuild': {
    id: string;
  } & containerBuildOutputs;
  'containerPush': {
    id: string;
  } & containerPushOutputs;
  'containerTag': {
    id: string;
  } & containerTagOutputs;
  'cronjob': {
    id: string;
  } & cronjobOutputs;
  'database': {
    id: string;
  } & databaseOutputs;
  'databaseSchema': {
    id: string;
  } & databaseSchemaOutputs;
  'databaseSize': {
    id: string;
  } & databaseSizeOutputs;
  'databaseType': {
    id: string;
  } & databaseTypeOutputs;
  'databaseUser': {
    id: string;
  } & databaseUserOutputs;
  'databaseVersion': {
    id: string;
  } & databaseVersionOutputs;
  'deployment': {
    id: string;
  } & deploymentOutputs;
  'dnsRecord': {
    id: string;
  } & dnsRecordOutputs;
  'dnsZone': {
    id: string;
  } & dnsZoneOutputs;
  'helmChart': {
    id: string;
  } & helmChartOutputs;
  'ingressRule': {
    id: string;
  } & ingressRuleOutputs;
  'kubernetesCluster': {
    id: string;
  } & kubernetesClusterOutputs;
  'kubernetesVersion': {
    id: string;
  } & kubernetesVersionOutputs;
  'namespace': {
    id: string;
  } & namespaceOutputs;
  'node': {
    id: string;
  } & nodeOutputs;
  'nodeSize': {
    id: string;
  } & nodeSizeOutputs;
  'ociBuild': {
    id: string;
  } & ociBuildOutputs;
  'ociPush': {
    id: string;
  } & ociPushOutputs;
  'ociTag': {
    id: string;
  } & ociTagOutputs;
  'region': {
    id: string;
  } & regionOutputs;
  'repository': {
    id: string;
  } & repositoryOutputs;
  'secret': {
    id: string;
  } & secretOutputs;
  'service': {
    id: string;
  } & serviceOutputs;
  'task': {
    id: string;
  } & taskOutputs;
  'volume': {
    id: string;
  } & volumeOutputs;
  'vpc': {
    id: string;
  } & vpcOutputs;
};

/**
 * @discriminator type
 */
export type InputSchema = ResourceInputs[ResourceType];

export type OutputSchema = ResourceOutputs[ResourceType];
