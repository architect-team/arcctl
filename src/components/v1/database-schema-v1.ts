export type DatabaseSchemaV1 = {
  /**
   * Type of database and version required by the application
   */
  type: string;

  /**
   * A human-readable description of the database and its purpose
   */
  description?: string;
};
