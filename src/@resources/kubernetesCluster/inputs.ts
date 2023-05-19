
export type ClusterInputs = {
  /**
   * Name of the cluster
   */
  name: string;

  /**
   * Description of the cluster
   */
  description?: string;

  /**
   * Region the cluster should live in
   */
  region: string;

  /**
   * VPC the cluster should live in
   */
  vpc: string;

  /**
   * Version of the kubernetes control plane to use
   */
  kubernetesVersion: string;

  /**
   * Node pools
   * @minimum 1
   */
  nodePools: Array<{
    /**
     * Name of the node pool
     */
    name: string;

    /**
     * Number of nodes the pool should have
     * @minimum 1
     */
    count: number;

    /**
     * Size of each node in the pool
     */
    nodeSize: string;
  }>;
};

export default ClusterInputs;
