import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule } from '../../module.ts';
import { Role } from '../.gen/providers/postgresql/role/index.ts';
import { PostgresCredentials } from '../credentials.ts';
import { Construct } from 'constructs';

export class PostgresDatabaseUserModule extends ResourceModule<'databaseUser', PostgresCredentials> {
  outputs: ResourceOutputs['databaseUser'];
  role: Role;

  constructor(scope: Construct, id: string, inputs: ResourceInputs['databaseUser']) {
    super(scope, id, inputs);

    const password = crypto.randomUUID();

    this.role = new Role(this, 'user', {
      name: inputs.username,
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
      password,
      host: inputs.host || '',
      port: inputs.port ? Number(inputs.port) : 0,
      protocol,
      url: `${protocol}://${inputs.host}:${inputs.port}/${this.inputs.databaseSchema}`,
      database: this.inputs.databaseSchema,
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
