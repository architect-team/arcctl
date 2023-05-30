export type ClusterApplyOutputs = {
  name: string;
  description?: string;
  vpc: string;
  kubernetesVersion: string;
  account: string;
};

export default ClusterApplyOutputs;
