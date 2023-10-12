export type IngressRuleInputs = {
  /**
   * Port that the ingress rule listens for traffic on
   */
  port: string | number;

  /**
   * Service the ingress forwards traffic to
   */
  service: string;

  /**
   * The protocol the ingress rule listens for traffic on
   * @default http
   */
  protocol?: string;

  /**
   * The subdomain the ingress rule listens on
   */
  subdomain?: string;

  /**
   * The DNS zone (aka base URL) that the ingress rule listens on
   */
  dnsZone?: string;

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
  path?: string;

  /**
   * Whether or not this should be fulfilled by an internal load balancer (e.g. no public IP)
   * @default false
   */
  internal?: boolean;

  /**
   * Headers to include in responses
   */
  headers?: {
    [key: string]: string;
  };
};

export default IngressRuleInputs;
