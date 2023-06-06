import { DeepPartial } from '../../utils/types.ts';

export type StaticBucketSchemaV1 = {
  /**
   * Directory containing the static assets to be shipped to the bucket
   */
  directory: string;

  /**
   * Instructions on how to build the code into static files to be put into the `directory`.
   * Builds will be done just-in-time (JIT) for deployments to ensure that environment variables
   * are specific to the target environment.
   */
  build?: {
    /**
     * Folder to consider the context for the build relative to the component root
     */
    context: string;

    /**
     * Command to run to build the code
     */
    command: string;

    /**
     * Environment variables to inject into the build process
     */
    environment?: Record<string, string | number | boolean>;
  };

  /**
   * Configure a DNS route to point to this static bucket
   */
  ingress?: {
    /**
     * Subdomain to use for the ingress rule
     */
    subdomain?: string;

    /**
     * Sub-path to listen on when re-routing traffic from the ingress rule to the bucket
     */
    path?: string;

    /**
     * Whether or not this bucket should be exposed internally vs externally
     * @default false
     */
    internal?: boolean;
  };
};

export type DebuggableStaticBucketSchemaV1 = StaticBucketSchemaV1 & {
  debug?: DeepPartial<StaticBucketSchemaV1>;
};
