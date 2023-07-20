import { ProviderCredentials, ProviderCredentialsSchema } from '../credentials.ts';

// deno-lint-ignore no-empty-interface
export interface OrasCredentials extends ProviderCredentials {}

export const OrasCredentialsSchema: ProviderCredentialsSchema<OrasCredentials> = {
  type: 'object',
  properties: {},
  additionalProperties: false,
};
