export type DatabaseOutputs = {
  /**
   * Protocol of the underlying database
   *
   * @example "postgresql"
   */
  protocol: string;

  /**
   * Host address of the underlying database
   *
   * @example "my-database.example.com"
   */
  host: string;

  /**
   * Port the underlying database listens on
   *
   * @example 5432
   */
  port: string | number;

  /**
   * Name of the new database schema
   *
   * @example "my-schema"
   */
  database: string;

  /**
   * Full connection string for the database
   *
   * @example "postgresql://user:pass@my-database.example.com:5432/my-schema"
   */
  url: string;

  /**
   * Username used to authenticate with the schema
   *
   * @example "user"
   */
  username: string;

  /**
   * Passowrd used to authenticate with the schema
   * @example "pass"
   */
  password: string;

  /**
   * SSL certificate used to authenticate with the database
   */
  certificate?: string;
};

export default DatabaseOutputs;
