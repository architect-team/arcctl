import { Construct } from 'constructs';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule, ResourceModuleOptions } from '../../module.ts';
import { Role } from '../.gen/providers/postgresql/role/index.ts';
import { PostgresCredentials } from '../credentials.ts';

export class PostgresDatabaseUserModule extends ResourceModule<'databaseUser', PostgresCredentials> {
  outputs: ResourceOutputs['databaseUser'];
  role: Role;

  constructor(scope: Construct, options: ResourceModuleOptions<'databaseUser', PostgresCredentials>) {
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
      host: this.credentials.host,
      port: this.credentials.port,
      protocol,
      url:
        `${protocol}://${this.role.name}:${this.role.password}@${this.credentials.host}:${this.credentials.port}/${this.inputs?.databaseSchema}`,
      database: this.inputs?.databaseSchema || 'unknown',
    };
  }

  genImports(resourceId: string): Promise<Record<string, string>> {
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
