export type BucketOutputs = {
  /**
   * Unique ID of the bucket that was created
   * @example "abc123"
   */
  id: string;

  /**
   * Endpoint that hosts the bucket
   *
   * @example "https://nyc3.digitaloceanspaces.com"
   * @example "https://bucket.s3.region.amazonaws.com"
   */
  endpoint: string;

  /**
   * Region the bucket was created in
   */
  region: string;

  /**
   * Access key ID used to authenticate with the bucket
   */
  access_key_id: string;

  /**
   * Secret access key used to authenticate with the bucket
   */
  secret_access_key: string;
};

export default BucketOutputs;
