export type DatabaseUserApplyOutputs = {
  /**
   * The protocol the database responds to
   *
   * @example "postgresql"
   */
  protocol: string;

  /**
   * The host the database listens on
   *
   * @example "rds.amazonwebservices.com/abc123"
   */
  host: string;

  /**
   * The port the database listens on
   *
   * @example 5432
   */
  port: number | string;

  /**
   * The name of the database to connect to
   *
   * @example "database"
   */
  database: string;

  /**
   * Username used to authenticate with the database
   *
   * @example "admin"
   */
  username: string;

  /**
   * Password used to authenticate with the database
   *
   * @example "password"
   */
  password: string;

  /**
   * Fully resolvable URL used to connect to the database
   *
   * @example "postgresql://admin:password@rds.amazonwebservices.com:5432/database"
   */
  url: string;

  /**
   * The certificate used to connect to the database
   */
  certificate?: string;
};

export default DatabaseUserApplyOutputs;
