import { JSONSchemaType } from 'ajv';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ProviderCredentials {}

export type ProviderCredentialsSchema<
  C extends ProviderCredentials = ProviderCredentials
> = JSONSchemaType<C>;
