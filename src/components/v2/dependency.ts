export type DependencySchemaV2 = {
  /**
   * The repo the component is in
   */
  component: string;

  /**
   * Input values to provide to the component if `merge` is turned on
   */
  variables?: Record<string, string | string[]>;
};
