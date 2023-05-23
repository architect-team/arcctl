import {
  ProviderCredentials,
  ProviderCredentialsSchema,
} from '../credentials.js';

export interface DockerCredentials extends ProviderCredentials {
  host?: string;
  ca_material?: string;
  cert_material?: string;
  key_material?: string;
}

export const DockerCredentialsSchema: ProviderCredentialsSchema<DockerCredentials> =
  {
    type: 'object',
    properties: {
      host: {
        type: 'string',
        description: '',
        nullable: true,
      },
      ca_material: {
        type: 'string',
        description: '',
        nullable: true,
      },
      cert_material: {
        type: 'string',
        description: '',
        nullable: true,
      },
      key_material: {
        type: 'string',
        description: '',
        nullable: true,
      },
    },
    additionalProperties: false,
  };
