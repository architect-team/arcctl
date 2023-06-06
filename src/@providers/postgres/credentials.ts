import { ProviderCredentials, ProviderCredentialsSchema } from '../credentials.ts';

export interface PostgresCredentials extends ProviderCredentials {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export const PostgresCredentialsSchema: ProviderCredentialsSchema<PostgresCredentials> = {
  type: 'object',
  properties: {
    host: {
      type: 'string',
      description: '',
      show: true,
    },
    port: {
      type: 'number',
      description: '',
      show: true,
    },
    username: {
      type: 'string',
      description: '',
      show: true,
    },
    password: {
      type: 'string',
      description: '',
    },
    database: {
      type: 'string',
      description: 'Default database to connect to',
    },
  },
  required: ['host', 'port', 'username', 'password', 'database'],
  additionalProperties: false,
};
