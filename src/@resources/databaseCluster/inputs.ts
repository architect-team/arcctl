export type DatabaseClusterApplyInputs = {
  /**
   * Unique name for the database
   */
  name: string;

  /**
   * Human-readable description of the database
   */
  description?: string;

  /**
   * Size of the database instance to create
   */
  databaseSize: string;

  /**
   * The type of database engine to use
   */
  databaseType: string;

  /**
   * Refers to the unique ID of a `databaseVersion` response
   */
  databaseVersion: string;

  /**
   * Unique ID of the VPC to run the database in
   */
  vpc: string;

  /**
   * Unique ID of the region to run the database in
   */
  region: string;
};

export default DatabaseClusterApplyInputs;
