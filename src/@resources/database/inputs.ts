export type DatabaseApplyInputs = {
  /**
   * Name to give to the new schema
   */
  name: string;

  /**
   * Unique ID of the database backing this schema
   */
  database: string;

  /**
   * Type of database required by the schema
   */
  databaseType: string;

  /**
   * Version of the database type the schema creation process expects
   */
  databaseVersion: string;
};

export default DatabaseApplyInputs;
