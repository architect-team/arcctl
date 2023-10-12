import { JSONSchemaType } from 'ajv';
import { StateBackend } from './backend.ts';
import LocalStateBackend from './local/backend.ts';
import { LocalCredentialsSchema } from './local/credentials.ts';
import S3StateBackend from './s3/backend.ts';
import { S3CredentialsSchema } from './s3/credentials.ts';

export type StateBackendType = 'local' | 's3';

export const StateBackendTypeList = ['local', 's3'];

export const CredentialSchemas: { [type in StateBackendType]: JSONSchemaType<type> } = {
  local: LocalCredentialsSchema,
  s3: S3CredentialsSchema,
};

export const buildStateBackend = <T>(
  name: string,
  type: StateBackendType,
  credentials: Record<string, unknown>,
): StateBackend<T> => {
  switch (type) {
    case 'local':
      return new LocalStateBackend<T>(name, credentials as any);
    case 's3':
      return new S3StateBackend<T>(name, credentials as any);
  }
};
