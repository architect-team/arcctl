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
import type kubernetesNamespaceInputs from './kubernetesNamespace/inputs.js';
import type kubernetesNamespaceOutputs from './kubernetesNamespace/outputs.js';
import type kubernetesVersionInputs from './kubernetesVersion/inputs.js';
import type kubernetesVersionOutputs from './kubernetesVersion/outputs.js';
import type loadBalancerInputs from './loadBalancer/inputs.js';
import type loadBalancerOutputs from './loadBalancer/outputs.js';
import type loadBalancerTypeInputs from './loadBalancerType/inputs.js';
import type loadBalancerTypeOutputs from './loadBalancerType/outputs.js';
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
  | 'kubernetesNamespace'
  | 'kubernetesVersion'
  | 'loadBalancer'
  | 'loadBalancerType'
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
  'kubernetesNamespace',
  'kubernetesVersion',
  'loadBalancer',
  'loadBalancerType',
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
    provider?: string,
  } & cronjobInputs;
  'database': {
    type: 'database',
    provider?: string,
  } & databaseInputs;
  'databaseSchema': {
    type: 'databaseSchema',
    provider?: string,
  } & databaseSchemaInputs;
  'databaseSize': {
    type: 'databaseSize',
    provider?: string,
  } & databaseSizeInputs;
  'databaseType': {
    type: 'databaseType',
    provider?: string,
  } & databaseTypeInputs;
  'databaseUser': {
    type: 'databaseUser',
    provider?: string,
  } & databaseUserInputs;
  'databaseVersion': {
    type: 'databaseVersion',
    provider?: string,
  } & databaseVersionInputs;
  'deployment': {
    type: 'deployment',
    provider?: string,
  } & deploymentInputs;
  'dnsRecord': {
    type: 'dnsRecord',
    provider?: string,
  } & dnsRecordInputs;
  'dnsZone': {
    type: 'dnsZone',
    provider?: string,
  } & dnsZoneInputs;
  'dockerBuild': {
    type: 'dockerBuild',
    provider?: string,
  } & dockerBuildInputs;
  'helmChart': {
    type: 'helmChart',
    provider?: string,
  } & helmChartInputs;
  'ingressRule': {
    type: 'ingressRule',
    provider?: string,
  } & ingressRuleInputs;
  'kubernetesCluster': {
    type: 'kubernetesCluster',
    provider?: string,
  } & kubernetesClusterInputs;
  'kubernetesNamespace': {
    type: 'kubernetesNamespace',
    provider?: string,
  } & kubernetesNamespaceInputs;
  'kubernetesVersion': {
    type: 'kubernetesVersion',
    provider?: string,
  } & kubernetesVersionInputs;
  'loadBalancer': {
    type: 'loadBalancer',
    provider?: string,
  } & loadBalancerInputs;
  'loadBalancerType': {
    type: 'loadBalancerType',
    provider?: string,
  } & loadBalancerTypeInputs;
  'node': {
    type: 'node',
    provider?: string,
  } & nodeInputs;
  'nodeSize': {
    type: 'nodeSize',
    provider?: string,
  } & nodeSizeInputs;
  'region': {
    type: 'region',
    provider?: string,
  } & regionInputs;
  'secret': {
    type: 'secret',
    provider?: string,
  } & secretInputs;
  'service': {
    type: 'service',
    provider?: string,
  } & serviceInputs;
  'task': {
    type: 'task',
    provider?: string,
  } & taskInputs;
  'volume': {
    type: 'volume',
    provider?: string,
  } & volumeInputs;
  'vpc': {
    type: 'vpc',
    provider?: string,
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
  'kubernetesNamespace': {
    id: string;
  } & kubernetesNamespaceOutputs;
  'kubernetesVersion': {
    id: string;
  } & kubernetesVersionOutputs;
  'loadBalancer': {
    id: string;
  } & loadBalancerOutputs;
  'loadBalancerType': {
    id: string;
  } & loadBalancerTypeOutputs;
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