export type RepositoryInputs = {
  /**
   * The name for the new repository
   */
  name: string;

  /**
   * The namespace the repository should be in
   */
  namespace?: string;

  /**
   * Human-readable description of the repository
   */
  description?: string;

  /**
   * Whether or not the repository is private
   * @default false
   */
  private?: boolean;
};

export default RepositoryInputs;
