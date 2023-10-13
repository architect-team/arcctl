export type ServiceOutputs = {
  /**
   * Protocol the service listens on
   */
  protocol: string;

  /**
   * Host the service listens on
   */
  host: string;

  /**
   * Port the service listens on
   */
  port: number | string;

  /**
   * Fully resolvable URL of the service
   */
  url: string;
};

export default ServiceOutputs;
