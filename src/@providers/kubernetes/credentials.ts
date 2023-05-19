import {
  ProviderCredentials,
  ProviderCredentialsSchema,
} from '../credentials.js';

export interface KubernetesCredentials extends ProviderCredentials {
  configPath?: string;
  configContext?: string;
}

export const KubernetesCredentialsSchema: ProviderCredentialsSchema<KubernetesCredentials> =
  {
    type: 'object',
    properties: {
      configPath: {
        type: 'string',
        description: '',
        nullable: true,
      },
      configContext: {
        type: 'string',
        description: '',
        nullable: true,
      },
    },
    additionalProperties: false,
  };
