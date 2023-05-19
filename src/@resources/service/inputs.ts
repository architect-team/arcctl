export type ServiceInputs = {
  /**
   * Name to give to the service
   */
  name: string;

  /**
   * Namespace the service should be registered in. Not all providers require this.
   */
  namespace?: string;

  /**
   * Port to forward requests to
   */
  target_port: number;

  /**
   * Labels for the service resource
   */
  labels?: Record<string, string>;

  /**
   * Reference used to target a deployment
   */
  selector?: string;

  /**
   * Port to listen for requests on
   * @default 80
   */
  listener_port?: number;

  /**
   * Protocol the service responds to
   */
  protocol?: string;

  /**
   * Map this service to the specified hostname instead of to a deployment selector
   */
  external_name?: string;
};

export default ServiceInputs;
