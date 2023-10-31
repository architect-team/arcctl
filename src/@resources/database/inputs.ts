export type DatabaseInputs = {
  /**
   * Name to give to the new schema
   */
  name: string;

  /**
   * Type of database required by the schema
   */
  databaseType: string;

  /**
   * Version of the database type the schema creation process expects
   */
  databaseVersion: string;
};

export default DatabaseInputs;
