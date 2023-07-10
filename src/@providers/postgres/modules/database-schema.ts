import { Construct } from 'constructs';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule, ResourceModuleOptions } from '../../module.ts';
import { Database } from '../.gen/providers/postgresql/database/index.ts';
import { PostgresCredentials } from '../credentials.ts';

export class PostgresDatabaseSchemaModule extends ResourceModule<'databaseSchema', PostgresCredentials> {
  outputs: ResourceOutputs['databaseSchema'];
  db: Database;

  constructor(scope: Construct, options: ResourceModuleOptions<'databaseSchema', PostgresCredentials>) {
    super(scope, options);

    const normalizedName = this.inputs?.name.replaceAll('/', '--');
    this.db = new Database(this, 'postgres-database', {
      name: normalizedName || 'unknown',
    });

    const protocol = 'postgresql';
    const host = this.credentials.host;
    const port = this.credentials.port;
    this.outputs = {
      id: this.db.name,
      name: this.db.name,
      host,
      port,
      username: this.credentials.username,
      password: this.credentials.password,
      account: this.accountName,
      protocol,
      url: `${protocol}://${this.credentials.username}:${this.credentials.password}@${host}:${port}/${this.db.name}`,
    };
  }

  genImports(resourceId: string): Promise<Record<string, string>> {
    return Promise.resolve({
      [this.getResourceRef(this.db)]: resourceId,
    });
  }

  getDisplayNames(): Record<string, string> {
    return {
      [this.getResourceRef(this.db)]: 'Database Schema',
    };
  }
}
