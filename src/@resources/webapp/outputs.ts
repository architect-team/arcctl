export type WebappOutputs = {
  /**
   * URL to access the webapp
   *
   * @example "https://example.com"
   */
  url: string;

  /**
   * Protocol to access the webapp
   *
   * @example "https"
   */
  protocol: string;

  /**
   * Hostname to access the webapp
   *
   * @example "example.com"
   */
  host: string;

  /**
   * Port to access the webapp
   *
   * @example 443
   */
  port: number;
};

export default WebappOutputs;
