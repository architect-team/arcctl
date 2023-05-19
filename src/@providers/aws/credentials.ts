import {
  ProviderCredentials,
  ProviderCredentialsSchema,
} from '../credentials.js';

export interface AwsCredentials extends ProviderCredentials {
  accessKeyId: string;
  secretAccessKey: string;
}

export const AwsCredentialsSchema: ProviderCredentialsSchema<AwsCredentials> = {
  type: 'object',
  properties: {
    accessKeyId: {
      type: 'string',
      description: '',
    },
    secretAccessKey: {
      type: 'string',
      description: '',
    },
  },
  required: ['accessKeyId', 'secretAccessKey'],
  additionalProperties: false,
};
