import { ServiceInputs } from './inputs.ts';

export type ServiceOutputs = ServiceInputs & {
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

  /**
   * The account used to connect to this service
   */
  account: string;
};

export default ServiceOutputs;
