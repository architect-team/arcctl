import { ProviderCredentials, ProviderCredentialsSchema } from '../credentials.ts';

export interface S3Credentials extends ProviderCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  endpoint: string;
  region: string;
}

export const S3CredentialsSchema: ProviderCredentialsSchema<S3Credentials> = {
  type: 'object',
  required: ['accessKeyId', 'secretAccessKey', 'endpoint', 'region'],
  properties: {
    accessKeyId: {
      type: 'string',
      description: '',
    },
    secretAccessKey: {
      type: 'string',
      description: '',
    },
    endpoint: {
      type: 'string',
      description: 'The api endpoint for accessing the bucket.',
    },
    region: {
      type: 'string',
      description: 'Which region the bucket lives in',
    },
  },
  additionalProperties: false,
};
