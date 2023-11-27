export type ServiceOutputs = {
  /**
   * Name of the service
   * @example "my-service"
   */
  name: string;

  /**
   * The port the service forwards traffic to
   * @example 8080
   */
  target_port: number | string;

  /**
   * Protocol the service listens on
   * @example "http"
   */
  protocol: string;

  /**
   * Host the service listens on
   * @example "my-service"
   */
  host: string;

  /**
   * Port the service listens on
   * @example 80
   */
  port: number | string;

  /**
   * Fully resolvable URL of the service
   * @example "http://my-service:80"
   */
  url: string;
};

export default ServiceOutputs;
