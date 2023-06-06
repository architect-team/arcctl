import { ProviderCredentials, ProviderCredentialsSchema } from '../credentials.ts';

export interface DigitaloceanCredentials extends ProviderCredentials {
  token: string;
}

export const DigitaloceanCredentialsSchema: ProviderCredentialsSchema<DigitaloceanCredentials> = {
  type: 'object',
  properties: {
    token: {
      type: 'string',
      description: '',
    },
  },
  required: ['token'],
  additionalProperties: false,
};
