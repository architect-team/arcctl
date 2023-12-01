import { ContainerSchemaV2 } from './container.ts';

export type BucketSchemaV2 = {
  /**
   * A human-readable description of the bucket
   *
   * @example "CSV reporting dumps"
   */
  description?: string;

  /**
   * The directory containing the contents to upload to the bucket
   * @example "./reports"
   */
  directory?: string;

  /**
   * The built image containing the contents to upload inside the workdir
   * @example "registry.architect.io/my-org/my-image:latest"
   */
  image?: string;
} | {
  /**
   * A human-readable description of the bucket
   *
   * @example "A static website"
   */
  description?: string;

  /**
   * Settings outlining a step that should be run when the component gets deployed
   */
  deploy: ContainerSchemaV2 & {
    /**
     * The path to the directory containing the contents to upload to the bucket
     *
     * @example "./dist"
     */
    publish: string;
  };
};
