export type ServiceInputs = {
  /**
   * Hostname to listen on
   */
  name: string;

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

  /**
   * A deployment the service should point to
   */
  target_deployment?: string;
};

export default ServiceInputs;
