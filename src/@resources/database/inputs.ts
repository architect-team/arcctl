export type DatabaseInputs = {
  /**
   * Name to give to the new schema
   *
   * @example "my-schema"
   */
  name: string;

  /**
   * Type of database required by the schema
   *
   * @example "postgres"
   */
  databaseType: string;

  /**
   * Version of the database type the schema creation process expects
   *
   * @example 15
   */
  databaseVersion: string;
};

export default DatabaseInputs;
