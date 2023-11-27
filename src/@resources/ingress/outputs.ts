export type IngressRuleOutputs = {
  /**
   * Protocol the ingress rule responds to
   * @example "http"
   */
  protocol: string;

  /**
   * Host the ingress rule responds to
   * @example "api.example.com"
   */
  host: string;

  /**
   * Port the ingress rule responds to
   * @example 80
   */
  port: string | number;

  /**
   * Username for basic auth
   * @example "admin"
   */
  username?: string;

  /**
   * Password for basic auth
   * @example "password"
   */
  password?: string;

  /**
   * URL the ingress rule responds to
   * @example "http://admin:password@api.example.com/path"
   */
  url: string;

  /**
   * Path the ingress rule responds to
   * @example "/path"
   */
  path: string;

  /**
   * Subdomain the ingress rule responds to
   * @example "api"
   */
  subdomain: string;

  /**
   * DNS zone the ingress rule responds to
   * @example "example.com"
   */
  dns_zone: string;
};

export default IngressRuleOutputs;
