export type OciBuildInputs = {
  /**
   * Custom config file configuration
   */
  config?: {
    /**
     * Path to the config file
     */
    file: string;

    /**
     * Media type of the config file
     */
    mediaType: string;
  };

  /**
   * Paths to files to package
   */
  files: string[];

  /**
   * Directory to store the OCI image in
   */
  layoutDir: string;
};

export default OciBuildInputs;
