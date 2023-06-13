export type ClusterApplyOutputs = {
  name: string;
  description?: string;
  vpc: string;
  kubernetesVersion: string;
  configPath: string;
};

export default ClusterApplyOutputs;
