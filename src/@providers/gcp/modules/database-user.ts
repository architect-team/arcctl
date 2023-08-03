import { Construct } from 'constructs';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule, ResourceModuleOptions } from '../../module.ts';
import { DataGoogleSqlDatabaseInstance } from '../.gen/providers/google/data-google-sql-database-instance/index.ts';
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

    const instance = new DataGoogleSqlDatabaseInstance(this, 'database', {
      name: this.inputs?.database || 'unknown',
    });

    this.sql_user = new SqlUser(this, 'user', {
      name: this.inputs?.username || 'unknown',
      password,
      instance: instance.name,
    });

    const host = instance.privateIpAddress;
    let port;
    let protocol;
    if (instance.databaseVersion.toLowerCase().includes('mysql')) {
      port = 3306;
      protocol = 'mysql';
    } else if (instance.databaseVersion.toLowerCase().includes('postgres')) {
      port = 5432;
      protocol = 'postgresql';
    } else {
      port = 1433;
      protocol = 'sqlserver';
    }

    this.outputs = {
      id: this.sql_user.name,
      username: this.sql_user.name,
      password: this.sql_user.password,
      host,
      port,
      protocol,
      url: `${protocol}://${this.sql_user.name}:${this.sql_user.password}@${host}:${port}/${instance.name}`,
      database: instance.name,
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
