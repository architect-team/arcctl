export type DatabaseUserApplyInputs = {
  /**
   * Username of the user to create
   */
  username: string;

  /**
   * The schema the user should have access to
   */
  databaseSchema: string;

  /**
   * The protocol of the underlying database
   */
  protocol: string;

  /**
   * The host address of the underlying database
   */
  host: string;

  /**
   * The port the underlying database is listening on
   */
  port: string | number;
};

export default DatabaseUserApplyInputs;
