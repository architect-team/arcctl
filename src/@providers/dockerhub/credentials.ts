import { ProviderCredentials, ProviderCredentialsSchema } from '../credentials.ts';

export interface DockerHubCredentials extends ProviderCredentials {
  username: string;
  password: string;
}

export const DockerHubCredentialsSchema: ProviderCredentialsSchema<DockerHubCredentials> = {
  type: 'object',
  required: ['username', 'password'],
  properties: {
    username: {
      type: 'string',
      description: 'Username',
    },
    password: {
      type: 'string',
      description: 'Password',
    },
  },
  additionalProperties: false,
};
