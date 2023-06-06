import { JSONSchemaType } from 'ajv';

// deno-lint-ignore no-empty-interface
export interface ProviderCredentials {}

export type ProviderCredentialsSchema<
  C extends ProviderCredentials = ProviderCredentials,
> = JSONSchemaType<C>;
