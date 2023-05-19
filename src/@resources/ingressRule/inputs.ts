export type IngressRuleInputs = {
  /**
   * ID of the load balancer to use for this ingress rule
   */
  loadBalancer: string;

  /**
   * Namespace to put the ingress rule in
   * @default default
   */
  namespace?: string;

  /**
   * Port that the ingress rule listens for traffic on
   */
  port: number;

  /**
   * Service the ingress forwards traffic to
   */
  service: string;

  listener?: {
    /**
     * Protocol that the ingress rule listens for traffic on
     * @default http
     */
    protocol?: string;

    /**
     * The DNS subdomain that the ingress rule listens for traffic on (only works w/ application load balancers)
     */
    subdomain?: string;

    /**
     * The DNS zone that the ingress rule listens for traffic on (only works w/ application load balancers)
     */
    hostZone?: string;

    /**
     * The path that the ingress rule listens for traffic on (only works w/ application load balancers)
     * @default /
     */
    path?: string;
  };

  /**
   * Whether or not this should be fulfilled by an internal load balancer (e.g. no public IP)
   * @default false
   */
  internal?: boolean;
};

export default IngressRuleInputs;
