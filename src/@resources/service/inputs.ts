export type ServiceInputs = {
  /**
   * Target port
   *
   * @example 8080
   */
  port: number;

  /**
   * Protocol
   * @default http
   */
  protocol?: string;

  /**
   * Basic auth username
   * @example "admin"
   */
  username?: string;

  /**
   * Basic auth password
   *
   * @example "password"
   */
  password?: string;

  /**
   * A deployment the service should point to
   * @example "component--my-deployment"
   */
  deployment: string;
} | {
  /**
   * External address to point to
   * @example "https://example.com"
   */
  external_hostname: string;
};

export default ServiceInputs;
