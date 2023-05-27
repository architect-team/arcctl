import {
  ProviderCredentials,
  ProviderCredentialsSchema,
} from '../credentials.js';

export interface LocalCredentials extends ProviderCredentials {
  directory: string;
}

export const LocalCredentialsSchema: ProviderCredentialsSchema<LocalCredentials> =
  {
    type: 'object',
    required: ['directory'],
    properties: {
      directory: {
        type: 'string',
        description: 'Directory where files will be stored',
      },
    },
    additionalProperties: false,
  };
