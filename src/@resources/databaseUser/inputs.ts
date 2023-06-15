export type DatabaseUserApplyInputs = {
  /**
   * Username of the user to create
   */
  username: string;

  /**
   * The schema the user should have access to
   */
  databaseSchema: string;
};

export default DatabaseUserApplyInputs;
