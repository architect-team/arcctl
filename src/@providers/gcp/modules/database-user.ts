import { Construct } from 'constructs';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule, ResourceModuleOptions } from '../../module.ts';
import { DataGoogleSqlDatabaseInstance } from '../.gen/providers/google/data-google-sql-database-instance/index.ts';
import { DataGoogleSqlDatabase } from '../.gen/providers/google/data-google-sql-database/index.ts';
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

    const [instance_name, database_name] = this.inputs?.database.split('/') || ['unknown', 'unknown'];

    const instance = new DataGoogleSqlDatabaseInstance(this, 'database-cluster', {
      name: instance_name,
    });

    const database = new DataGoogleSqlDatabase(this, 'database', {
      name: database_name,
      instance: instance.name,
    });

    this.sql_user = new SqlUser(this, 'user', {
      name: this.inputs?.username || 'unknown',
      password,
      instance: instance.name,
    });

    const host = instance.privateIpAddress;
    const { port, protocol } = GcpUtils.databasePortAndProtocol(instance.databaseVersion);

    this.outputs = {
      id: this.sql_user.name,
      username: this.sql_user.name,
      password: this.sql_user.password,
      host,
      port,
      protocol,
      url: `${protocol}://${this.sql_user.name}:${this.sql_user.password}@${host}:${port}/${instance.name}`,
      database: database.name,
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
