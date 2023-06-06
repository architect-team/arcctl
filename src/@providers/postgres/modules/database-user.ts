import { ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule, ResourceModuleOptions } from '../../module.ts';
import { Role } from '../.gen/providers/postgresql/role/index.ts';
import { PostgresCredentials } from '../credentials.ts';
import { Construct } from 'constructs';

export class PostgresDatabaseUserModule extends ResourceModule<'databaseUser', PostgresCredentials> {
  outputs: ResourceOutputs['databaseUser'];
  role: Role;

  constructor(scope: Construct, options: ResourceModuleOptions<'databaseUser'>) {
    super(scope, options);

    const password = crypto.randomUUID();

    this.role = new Role(this, 'user', {
      name: this.inputs?.username || 'unknown',
      password,
      superuser: false,
      createDatabase: false,
      encrypted: 'true',
      login: true,
    });

    const protocol = 'postgresql';

    this.outputs = {
      id: `${this.role.name}`,
      username: this.role.name,
      password: this.role.password,
      host: this.inputs?.host || 'unknown',
      port: Number(this.inputs?.port || 5432),
      protocol,
      url: `${protocol}://${this.role.name}:${this.role.password}@${this.inputs?.host}:${this.inputs?.port}/${this.inputs?.databaseSchema}`,
      database: this.inputs?.databaseSchema || 'unknown',
    };
  }

  genImports(_credentials: PostgresCredentials, resourceId: string): Promise<Record<string, string>> {
    return Promise.resolve({
      [this.getResourceRef(this.role)]: resourceId,
    });
  }

  getDisplayNames(): Record<string, string> {
    return {
      [this.getResourceRef(this.role)]: 'Database User',
    };
  }
}
