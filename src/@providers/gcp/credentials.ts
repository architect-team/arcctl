import { ProviderCredentials, ProviderCredentialsSchema } from '../credentials.ts';

export interface GoogleCloudCredentials extends ProviderCredentials {
  project: string;
  serviceAccountCredentialsFile: string;
}

export const GoogleCloudCredentialsSchema: ProviderCredentialsSchema<GoogleCloudCredentials> = {
  type: 'object',
  properties: {
    project: {
      type: 'string',
      description: '',
    },
    serviceAccountCredentialsFile: {
      type: 'string',
      description: '',
    },
  },
  required: ['project', 'serviceAccountCredentialsFile'],
  additionalProperties: false,
};
