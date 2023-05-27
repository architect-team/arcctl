import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.js';
import { ResourceModule } from '../../module.js';
import { Role } from '../.gen/providers/postgresql/role/index.js';
import { PostgresCredentials } from '../credentials.js';
import { Construct } from 'constructs';
import { v4 } from 'uuid';

export class PostgresDatabaseUserModule extends ResourceModule<
  'databaseUser',
  PostgresCredentials
> {
  outputs: ResourceOutputs['databaseUser'];
  role: Role;

  constructor(
    scope: Construct,
    id: string,
    inputs: ResourceInputs['databaseUser'],
  ) {
    super(scope, id, inputs);

    const password = v4();

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

  async genImports(
    credentials: PostgresCredentials,
    resourceId: string,
  ): Promise<Record<string, string>> {
    return {
      [this.getResourceRef(this.role)]: resourceId,
    };
  }

  getDisplayNames(): Record<string, string> {
    return {
      [this.getResourceRef(this.role)]: 'Database User',
    };
  }
}
