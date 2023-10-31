export type IngressRuleInputs = {
  /**
   * Port that the ingress rule listens for traffic on
   */
  port: string | number;

  service: {
    /**
     * The hostname the service is listening on
     */
    host: string;

    /**
     * The port the service deployment is listening on
     */
    port: string;

    /**
     * The protocol the service is listening on
     */
    protocol: string;
  };

  /**
   * The protocol the ingress rule listens for traffic on
   * @default http
   */
  protocol: string;

  /**
   * The subdomain the ingress rule listens on
   */
  subdomain?: string;

  /**
   * Basic auth username
   */
  username?: string;

  /**
   * Basic auth password
   */
  password?: string;

  /**
   * The path the ingress rule listens on
   * @default /
   */
  path: string;

  /**
   * Whether or not this should be fulfilled by an internal load balancer (e.g. no public IP)
   * @default false
   */
  internal: boolean;

  /**
   * Headers to include in responses
   */
  headers?: {
    [key: string]: string;
  };
};

export default IngressRuleInputs;
