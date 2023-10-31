export type ServiceInputs = {
  /**
   * Target port
   */
  port: number;

  /**
   * Protocol
   * @default http
   */
  protocol?: string;

  /**
   * Basic auth username
   */
  username?: string;

  /**
   * Basic auth password
   */
  password?: string;

  /**
   * A deployment the service should point to
   */
  deployment: string;
} | {
  /**
   * External address to point to
   */
  external_hostname: string;
};

export default ServiceInputs;
