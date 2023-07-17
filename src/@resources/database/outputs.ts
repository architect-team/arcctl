export type DatabaseApplyOutputs = {
  /**
   * Protocol of the underlying database
   */
  protocol: string;

  /**
   * Host address of the underlying database
   */
  host: string;

  /**
   * Port the underlying database listens on
   */
  port: string | number;

  /**
   * Name of the new database schema
   */
  name: string;

  /**
   * Full connection string for the database
   */
  url: string;

  /**
   * Account to be used by tasks that want to interact with this schema
   */
  account: string;

  /**
   * Username used to authenticate with the schema
   */
  username: string;

  /**
   * Passowrd used to authenticate with the schema
   */
  password: string;

  /**
   * SSL certificate used to authenticate with the database
   */
  certificate?: string;
};

export default DatabaseApplyOutputs;
