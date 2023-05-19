export type LoadBalancerOutputs = {
  /**
   * IP address or hostname of the load balancer
   */
  address: string;

  /**
   * The name of the new or existing provider that is used to configure this load balancer
   */
  provider: string;
};

export default LoadBalancerOutputs;
