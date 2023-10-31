import { JSONSchemaType } from 'ajv';

export type S3Credentials = {
  accessKeyId: string;
  secretAccessKey: string;
  endpoint: string;
  region: string;
  bucket: string;
};

export const S3CredentialsSchema: JSONSchemaType<S3Credentials> = {
  type: 'object',
  required: ['accessKeyId', 'secretAccessKey', 'endpoint', 'region', 'bucket'],
  properties: {
    accessKeyId: {
      type: 'string',
      description: 'Access Key ID',
      sensitive: true,
    },
    secretAccessKey: {
      type: 'string',
      description: 'Secret Access Key',
      sensitive: true,
    },
    endpoint: {
      type: 'string',
      description: 'The api endpoint for accessing the bucket.',
    },
    region: {
      type: 'string',
      description: 'Which region the bucket lives in',
    },
    bucket: {
      type: 'string',
      description: 'The bucket/directory you want to store state in',
    },
  },
  additionalProperties: false,
};
