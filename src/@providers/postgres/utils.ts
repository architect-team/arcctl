import { pg } from 'deps';
import { PostgresCredentials } from './credentials.ts';

export function getPgClient(credentials: PostgresCredentials, options?: { connectionTimeout?: number }): pg.Client {
  return new pg.Client({
    host: credentials.host === 'host.docker.internal' ? 'localhost' : credentials.host,
    port: credentials.port,
    user: credentials.username,
    password: credentials.password,
    database: credentials.database,
    connectionTimeoutMillis: options?.connectionTimeout,
  });
}
