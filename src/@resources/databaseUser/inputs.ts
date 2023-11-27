export type DatabaseUserApplyInputs = {
  /**
   * Name of the new user to create
   *
   * @example "my-db"
   */
  name: string;

  /**
   * Protocol of the target database
   *
   * @example "postgresql"
   * @example "mysql"
   */
  protocol: string;

  /**
   * Hostname of the target database
   *
   * @example "rds.amazonwebservices.com/abc123"
   */
  host: string;

  /**
   * Port the target database is listening on
   *
   * @example 5432
   */
  port: string | number;

  /**
   * Username used to access the target database
   *
   * @example "admin"
   */
  username: string;

  /**
   * Password used to access the target database
   *
   * @example "password"
   */
  password: string;

  /**
   * Name of the database to give access to
   *
   * @example "database"
   */
  database: string;
};

export default DatabaseUserApplyInputs;
