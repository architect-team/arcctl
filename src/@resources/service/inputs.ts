export type ServiceInputs = {
  /**
   * Hostname to listen on
   */
  name: string;

  /**
   * Resource namespace
   */
  namespace?: string;

  /**
   * Resource labels
   */
  labels?: Record<string, string>;

  /**
   * Target deployment name
   */
  target_deployment: string;

  /**
   * Target port
   */
  target_port: number;

  /**
   * Protocol
   * @default http
   */
  target_protocol?: string;

  /**
   * Port to listen on
   */
  port?: number;

  /**
   * External address to point to
   */
  external_hostname?: string;

  /**
   * Basic auth username
   */
  username?: string;

  /**
   * Basic auth password
   */
  password?: string;

  /**
   * Optional DNS zone to use for listeners
   */
  dnsZone?: string;
};

export default ServiceInputs;
