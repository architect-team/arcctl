export type ServiceInputs = {
  /**
   * Hostname the service should listen on
   */
  hostname: string;

  /**
   * Namespace to put the resource in
   */
  namespace?: string;

  /**
   * Additional labels to attach to the resource
   */
  labels?: Record<string, string>;

  /**
   * Name/selector of the replicas
   */
  target_deployment: string;

  /**
   * Port to forward traffic to
   */
  target_port: number;

  /**
   * Protocol the service responds to
   */
  target_protocol: string;

  /**
   * A port the service should listen on. Providers will generate one by default.
   */
  port?: number;

  /**
   * External hostname to point to instead of an internal deployment
   */
  external_hostname?: string;
};

export default ServiceInputs;
