export type DatabaseUserApplyInputs = {
  /**
   * Username of the user to create
   */
  username: string;

  /**
   * The database the user should have access to
   */
  database: string;
};

export default DatabaseUserApplyInputs;
