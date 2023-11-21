export type DatabaseUserApplyInputs = {
  /**
   * Name of the new user to create
   *
   * @example "my-db"
   */
  name: string;

  /**
   * Protocol of the target database
   */
  protocol: string;

  /**
   * Hostname of the target database
   */
  host: string;

  /**
   * Port the target database is listening on
   */
  port: string | number;

  /**
   * Username used to access the target database
   */
  username: string;

  /**
   * Password used to access the target database
   */
  password: string;

  /**
   * Name of the database to give access to
   */
  database: string;
};

export default DatabaseUserApplyInputs;
