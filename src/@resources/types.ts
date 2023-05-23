import type cronjobInputs from './cronjob/inputs.js';
import type cronjobOutputs from './cronjob/outputs.js';
import type databaseInputs from './database/inputs.js';
import type databaseOutputs from './database/outputs.js';
import type databaseSchemaInputs from './databaseSchema/inputs.js';
import type databaseSchemaOutputs from './databaseSchema/outputs.js';
import type databaseSizeInputs from './databaseSize/inputs.js';
import type databaseSizeOutputs from './databaseSize/outputs.js';
import type databaseTypeInputs from './databaseType/inputs.js';
import type databaseTypeOutputs from './databaseType/outputs.js';
import type databaseUserInputs from './databaseUser/inputs.js';
import type databaseUserOutputs from './databaseUser/outputs.js';
import type databaseVersionInputs from './databaseVersion/inputs.js';
import type databaseVersionOutputs from './databaseVersion/outputs.js';
import type deploymentInputs from './deployment/inputs.js';
import type deploymentOutputs from './deployment/outputs.js';
import type dnsRecordInputs from './dnsRecord/inputs.js';
import type dnsRecordOutputs from './dnsRecord/outputs.js';
import type dnsZoneInputs from './dnsZone/inputs.js';
import type dnsZoneOutputs from './dnsZone/outputs.js';
import type dockerBuildInputs from './dockerBuild/inputs.js';
import type dockerBuildOutputs from './dockerBuild/outputs.js';
import type helmChartInputs from './helmChart/inputs.js';
import type helmChartOutputs from './helmChart/outputs.js';
import type ingressRuleInputs from './ingressRule/inputs.js';
import type ingressRuleOutputs from './ingressRule/outputs.js';
import type kubernetesClusterInputs from './kubernetesCluster/inputs.js';
import type kubernetesClusterOutputs from './kubernetesCluster/outputs.js';
import type kubernetesVersionInputs from './kubernetesVersion/inputs.js';
import type kubernetesVersionOutputs from './kubernetesVersion/outputs.js';
import type loadBalancerInputs from './loadBalancer/inputs.js';
import type loadBalancerOutputs from './loadBalancer/outputs.js';
import type loadBalancerTypeInputs from './loadBalancerType/inputs.js';
import type loadBalancerTypeOutputs from './loadBalancerType/outputs.js';
import type namespaceInputs from './namespace/inputs.js';
import type namespaceOutputs from './namespace/outputs.js';
import type nodeInputs from './node/inputs.js';
import type nodeOutputs from './node/outputs.js';
import type nodeSizeInputs from './nodeSize/inputs.js';
import type nodeSizeOutputs from './nodeSize/outputs.js';
import type regionInputs from './region/inputs.js';
import type regionOutputs from './region/outputs.js';
import type secretInputs from './secret/inputs.js';
import type secretOutputs from './secret/outputs.js';
import type serviceInputs from './service/inputs.js';
import type serviceOutputs from './service/outputs.js';
import type taskInputs from './task/inputs.js';
import type taskOutputs from './task/outputs.js';
import type volumeInputs from './volume/inputs.js';
import type volumeOutputs from './volume/outputs.js';
import type vpcInputs from './vpc/inputs.js';
import type vpcOutputs from './vpc/outputs.js';

export type ResourceType =
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
  | 'dockerBuild'
  | 'helmChart'
  | 'ingressRule'
  | 'kubernetesCluster'
  | 'kubernetesVersion'
  | 'loadBalancer'
  | 'loadBalancerType'
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
  'dockerBuild',
  'helmChart',
  'ingressRule',
  'kubernetesCluster',
  'kubernetesVersion',
  'loadBalancer',
  'loadBalancerType',
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
  'cronjob': {
    type: 'cronjob',
    account?: string,
  } & cronjobInputs;
  'database': {
    type: 'database',
    account?: string,
  } & databaseInputs;
  'databaseSchema': {
    type: 'databaseSchema',
    account?: string,
  } & databaseSchemaInputs;
  'databaseSize': {
    type: 'databaseSize',
    account?: string,
  } & databaseSizeInputs;
  'databaseType': {
    type: 'databaseType',
    account?: string,
  } & databaseTypeInputs;
  'databaseUser': {
    type: 'databaseUser',
    account?: string,
  } & databaseUserInputs;
  'databaseVersion': {
    type: 'databaseVersion',
    account?: string,
  } & databaseVersionInputs;
  'deployment': {
    type: 'deployment',
    account?: string,
  } & deploymentInputs;
  'dnsRecord': {
    type: 'dnsRecord',
    account?: string,
  } & dnsRecordInputs;
  'dnsZone': {
    type: 'dnsZone',
    account?: string,
  } & dnsZoneInputs;
  'dockerBuild': {
    type: 'dockerBuild',
    account?: string,
  } & dockerBuildInputs;
  'helmChart': {
    type: 'helmChart',
    account?: string,
  } & helmChartInputs;
  'ingressRule': {
    type: 'ingressRule',
    account?: string,
  } & ingressRuleInputs;
  'kubernetesCluster': {
    type: 'kubernetesCluster',
    account?: string,
  } & kubernetesClusterInputs;
  'kubernetesVersion': {
    type: 'kubernetesVersion',
    account?: string,
  } & kubernetesVersionInputs;
  'loadBalancer': {
    type: 'loadBalancer',
    account?: string,
  } & loadBalancerInputs;
  'loadBalancerType': {
    type: 'loadBalancerType',
    account?: string,
  } & loadBalancerTypeInputs;
  'namespace': {
    type: 'namespace',
    account?: string,
  } & namespaceInputs;
  'node': {
    type: 'node',
    account?: string,
  } & nodeInputs;
  'nodeSize': {
    type: 'nodeSize',
    account?: string,
  } & nodeSizeInputs;
  'region': {
    type: 'region',
    account?: string,
  } & regionInputs;
  'secret': {
    type: 'secret',
    account?: string,
  } & secretInputs;
  'service': {
    type: 'service',
    account?: string,
  } & serviceInputs;
  'task': {
    type: 'task',
    account?: string,
  } & taskInputs;
  'volume': {
    type: 'volume',
    account?: string,
  } & volumeInputs;
  'vpc': {
    type: 'vpc',
    account?: string,
  } & vpcInputs;
};

export type ResourceOutputs = {
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
  'loadBalancer': {
    id: string;
  } & loadBalancerOutputs;
  'loadBalancerType': {
    id: string;
  } & loadBalancerTypeOutputs;
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

export type InputSchema = ResourceInputs[ResourceType];
export type OutputSchema = ResourceOutputs[ResourceType];