import { ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule, ResourceModuleOptions } from '../../module.ts';
import { Database } from '../.gen/providers/postgresql/database/index.ts';
import { Role } from '../.gen/providers/postgresql/role/index.ts';
import { PostgresCredentials } from '../credentials.ts';
import { Construct } from 'constructs';

export class PostgresDatabaseSchemaModule extends ResourceModule<'databaseSchema', PostgresCredentials> {
  outputs: ResourceOutputs['databaseSchema'];
  db: Database;
  role: Role;

  constructor(scope: Construct, options: ResourceModuleOptions<'databaseSchema'>) {
    super(scope, options);

    this.db = new Database(this, 'postgres-database', {
      name: this.inputs?.name || 'unknown',
    });

    const password = crypto.randomUUID();
    this.role = new Role(this, 'user', {
      name: this.inputs?.name || 'unknown',
      password,
      superuser: false,
      createDatabase: false,
      encrypted: 'true',
      login: true,
    });

    const protocol = 'postgresql';

    this.outputs = {
      id: this.db.name,
      name: this.db.name,
      host: this.inputs?.host || 'unknown',
      port: this.inputs?.port || 5432,
      username: this.role.name,
      password: this.role.password,
      protocol,
      url: `${protocol}://${this.role.name}:${this.role.password}@${this.inputs?.host}:${this.inputs?.port}/${this.db.name}`,
    };
  }

  genImports(_credentials: PostgresCredentials, resourceId: string): Promise<Record<string, string>> {
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
