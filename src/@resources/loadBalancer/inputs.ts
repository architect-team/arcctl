export type LoadBalancerInputs = {
  /**
   * Name for the new load balancer
   */
  name: string;

  /**
   * A namespace to put the load balancer in
   */
  namespace?: string;

  /**
   * What type of load balancer to create
   */
  loadBalancerType: string;

  /**
   * Whether or not this should be an internal load balancer (e.g. no public IP)
   * @default false
   */
  internal?: boolean;
};

export default LoadBalancerInputs;
