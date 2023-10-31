import { JSONSchemaType } from 'ajv';

export type LocalCredentials = {
  directory?: string;
};

export const LocalCredentialsSchema: JSONSchemaType<LocalCredentials> = {
  type: 'object',
  required: [],
  properties: {
    directory: {
      type: 'string',
      description: 'Directory to store state in',
      default: '~/.arcctl/',
      nullable: true,
    },
  },
  additionalProperties: false,
};
