export type LoadBalancerOutputs = {
  /**
   * IP address or hostname of the load balancer
   */
  address: string;

  /**
   * The type of load balancer this is
   */
  loadBalancerType: string;
};

export default LoadBalancerOutputs;
