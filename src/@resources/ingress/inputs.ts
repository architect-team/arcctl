export type IngressRuleInputs = {
  /**
   * Port that the ingress rule listens for traffic on
   * @example 80
   */
  port: string | number;

  /**
   * The configuration details of the target service
   */
  service: {
    /**
     * Name of the service the ingress points to
     * @example "my-service"
     */
    name: string;

    /**
     * The hostname the service is listening on
     * @example "my-service"
     */
    host: string;

    /**
     * The port the service deployment is listening on
     * @example 80
     */
    port: string;

    /**
     * The protocol the service is listening on
     * @example "http"
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
   * @example "api"
   */
  subdomain?: string;

  /**
   * Basic auth username
   * @example "admin"
   */
  username?: string;

  /**
   * Basic auth password
   * @example "password"
   */
  password?: string;

  /**
   * The path the ingress rule listens on
   * @default "/"
   */
  path: string;

  /**
   * Whether or not this should be fulfilled by an internal load balancer (e.g. no public IP)
   * @default false
   */
  internal: boolean;

  /**
   * Headers to include in responses
   * @example { "X-Frame-Options": "DENY" }
   */
  headers?: {
    [key: string]: string;
  };
};

export default IngressRuleInputs;
