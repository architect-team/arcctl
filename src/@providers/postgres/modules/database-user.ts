import { Construct } from 'constructs';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule, ResourceModuleOptions } from '../../module.ts';
import { PostgresqlProvider } from '../.gen/providers/postgresql/provider/index.ts';
import { Role } from '../.gen/providers/postgresql/role/index.ts';
import { PostgresCredentials } from '../credentials.ts';

export class PostgresDatabaseUserModule extends ResourceModule<'databaseUser', PostgresCredentials> {
  outputs: ResourceOutputs['databaseUser'];
  role: Role;

  constructor(scope: Construct, options: ResourceModuleOptions<'databaseUser', PostgresCredentials>) {
    super(scope, options);

    const password = crypto.randomUUID();

    new PostgresqlProvider(this, 'postgres', {
      host: this.credentials.host === 'host.docker.internal' ? 'localhost' : this.credentials.host,
      port: this.credentials.port,
      username: this.credentials.username,
      password: this.credentials.password,
      database: this.inputs?.database,
      superuser: false,
      sslMode: 'disable',
    });

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
        `${protocol}://${this.role.name}:${this.role.password}@${this.credentials.host}:${this.credentials.port}/${this.inputs?.database}`,
      database: this.inputs?.database || 'unknown',
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
