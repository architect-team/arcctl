import { ProviderCredentials, ProviderCredentialsSchema } from '../credentials.ts';

export interface TraefikCredentials extends ProviderCredentials {
  type: 'volume';
  volume: string;
  account: string;
}

export const TraefikCredentialsSchema: ProviderCredentialsSchema<TraefikCredentials> = {
  type: 'object',
  required: ['type', 'volume', 'account'],
  properties: {
    type: {
      type: 'string',
      description: 'Type of configuration being used',
    },
    volume: {
      type: 'string',
      description: 'ID of the volume to store content on',
    },
    account: {
      type: 'string',
      description: 'Account capable of creating tasks that can mount the specified volume',
    },
  },
  additionalProperties: false,
};
