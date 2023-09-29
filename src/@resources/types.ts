import type arcctlAccountInputs from './arcctlAccount/inputs.ts';
import type arcctlAccountOutputs from './arcctlAccount/outputs.ts';
import type cronjobInputs from './cronjob/inputs.ts';
import type cronjobOutputs from './cronjob/outputs.ts';
import type databaseInputs from './database/inputs.ts';
import type databaseOutputs from './database/outputs.ts';
import type databaseClusterInputs from './databaseCluster/inputs.ts';
import type databaseClusterOutputs from './databaseCluster/outputs.ts';
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
import type dockerBuildInputs from './dockerBuild/inputs.ts';
import type dockerBuildOutputs from './dockerBuild/outputs.ts';
import type helmChartInputs from './helmChart/inputs.ts';
import type helmChartOutputs from './helmChart/outputs.ts';
import type ingressRuleInputs from './ingressRule/inputs.ts';
import type ingressRuleOutputs from './ingressRule/outputs.ts';
import type kubernetesClusterInputs from './kubernetesCluster/inputs.ts';
import type kubernetesClusterOutputs from './kubernetesCluster/outputs.ts';
import type kubernetesVersionInputs from './kubernetesVersion/inputs.ts';
import type kubernetesVersionOutputs from './kubernetesVersion/outputs.ts';
import type moduleInputs from './module/inputs.ts';
import type moduleOutputs from './module/outputs.ts';
import type namespaceInputs from './namespace/inputs.ts';
import type namespaceOutputs from './namespace/outputs.ts';
import type nodeInputs from './node/inputs.ts';
import type nodeOutputs from './node/outputs.ts';
import type nodeSizeInputs from './nodeSize/inputs.ts';
import type nodeSizeOutputs from './nodeSize/outputs.ts';
import type regionInputs from './region/inputs.ts';
import type regionOutputs from './region/outputs.ts';
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
  | 'cronjob'
  | 'database'
  | 'databaseCluster'
  | 'databaseSize'
  | 'databaseType'
  | 'databaseUser'
  | 'databaseVersion'
  | 'deployment'
  | 'dnsRecord'
  | 'dnsZone'
  | 'dockerBuild'
  | 'helmChart'
  | 'ingressRule'
  | 'kubernetesCluster'
  | 'kubernetesVersion'
  | 'module'
  | 'namespace'
  | 'node'
  | 'nodeSize'
  | 'region'
  | 'secret'
  | 'service'
  | 'task'
  | 'volume'
  | 'vpc'
;

export const ResourceTypeList: ResourceType[] = [
  'arcctlAccount',
  'cronjob',
  'database',
  'databaseCluster',
  'databaseSize',
  'databaseType',
  'databaseUser',
  'databaseVersion',
  'deployment',
  'dnsRecord',
  'dnsZone',
  'dockerBuild',
  'helmChart',
  'ingressRule',
  'kubernetesCluster',
  'kubernetesVersion',
  'module',
  'namespace',
  'node',
  'nodeSize',
  'region',
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
  'cronjob': {
    type: 'cronjob';
    account?: string;
  } & cronjobInputs;
  'database': {
    type: 'database';
    account?: string;
  } & databaseInputs;
  'databaseCluster': {
    type: 'databaseCluster';
    account?: string;
  } & databaseClusterInputs;
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
  'dockerBuild': {
    type: 'dockerBuild';
    account?: string;
  } & dockerBuildInputs;
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
  'module': {
    type: 'module';
    account?: string;
  } & moduleInputs;
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
  'region': {
    type: 'region';
    account?: string;
  } & regionInputs;
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
  'cronjob': {
    id: string;
  } & cronjobOutputs;
  'database': {
    id: string;
  } & databaseOutputs;
  'databaseCluster': {
    id: string;
  } & databaseClusterOutputs;
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
  'dockerBuild': {
    id: string;
  } & dockerBuildOutputs;
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
  'module': {
    id: string;
  } & moduleOutputs;
  'namespace': {
    id: string;
  } & namespaceOutputs;
  'node': {
    id: string;
  } & nodeOutputs;
  'nodeSize': {
    id: string;
  } & nodeSizeOutputs;
  'region': {
    id: string;
  } & regionOutputs;
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
