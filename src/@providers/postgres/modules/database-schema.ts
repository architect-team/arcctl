import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.js';
import { ResourceModule } from '../../module.js';
import { Database } from '../.gen/providers/postgresql/database/index.js';
import { PostgresCredentials } from '../credentials.js';
import { Construct } from 'constructs';

export class PostgresDatabaseSchemaModule extends ResourceModule<
  'databaseSchema',
  PostgresCredentials
> {
  outputs: ResourceOutputs['databaseSchema'];
  db: Database;

  constructor(
    scope: Construct,
    id: string,
    inputs: ResourceInputs['databaseSchema'],
  ) {
    super(scope, id, inputs);

    this.db = new Database(this, 'postgres-database', {
      name: inputs.name,
    });

    const protocol = 'postgresql';

    this.outputs = {
      id: this.db.name,
      name: this.db.name,
      host: inputs.host || '',
      port: inputs.port || 5432,
      protocol,
      url: `${protocol}://${inputs.host}:${inputs.port}/${this.db.name}`,
      account: inputs.account || '',
    };
  }

  async genImports(
    credentials: PostgresCredentials,
    resourceId: string,
  ): Promise<Record<string, string>> {
    return {
      [this.getResourceRef(this.db)]: resourceId,
    };
  }

  getDisplayNames(): Record<string, string> {
    return {
      [this.getResourceRef(this.db)]: 'Database Schema',
    };
  }
}