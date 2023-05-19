export type ClusterApplyOutputs = {
  name: string;
  description?: string;
  vpc: string;
  kubernetesVersion: string;
  provider: string;
};

export default ClusterApplyOutputs;
