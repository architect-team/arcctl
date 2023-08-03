import { Construct } from 'constructs';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule, ResourceModuleOptions } from '../../module.ts';
import { ProjectService } from '../.gen/providers/google/project-service/index.ts';
import { SqlUser } from '../.gen/providers/google/sql-user/index.ts';
import { GoogleCloudCredentials } from '../credentials.ts';
import GcpUtils from '../utils.ts';

export class GoogleCloudDatabaseUserModule extends ResourceModule<'databaseUser', GoogleCloudCredentials> {
  outputs: ResourceOutputs['databaseUser'];
  sql_user: SqlUser;

  constructor(scope: Construct, options: ResourceModuleOptions<'databaseUser', GoogleCloudCredentials>) {
    super(scope, options);

    const password = crypto.randomUUID();

    GcpUtils.configureProvider(this);

    const depends_on = this.inputs?.database
      ? [
        new ProjectService(this, 'database-service', {
          service: 'sqladmin.googleapis.com',
          disableOnDestroy: false,
        }),
      ]
      : [];

    const [protocol, instance_name, database_name, host, port] = this.inputs?.database.split('/') ||
      ['unknown', 'unknown', 'unknown', 'unknown', 'unknown'];

    this.sql_user = new SqlUser(this, 'user', {
      dependsOn: depends_on,
      name: this.inputs?.username || 'unknown',
      password,
      instance: instance_name,
    });

    this.outputs = {
      id: this.sql_user.name,
      username: this.sql_user.name,
      password: this.sql_user.password,
      host,
      port,
      protocol,
      url: `${protocol}://${this.sql_user.name}:${this.sql_user.password}@${host}:${port}/${database_name}`,
      database: database_name,
    };
  }

  genImports(resourceId: string): Promise<Record<string, string>> {
    return Promise.resolve({
      [this.getResourceRef(this.sql_user)]: resourceId,
    });
  }

  getDisplayNames(): Record<string, string> {
    return {
      [this.getResourceRef(this.sql_user)]: 'Database User',
    };
  }
}
