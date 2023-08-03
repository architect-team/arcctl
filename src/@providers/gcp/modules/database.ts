import { Construct } from 'constructs';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule, ResourceModuleOptions } from '../../module.ts';
import { DataGoogleSqlDatabaseInstance } from '../.gen/providers/google/data-google-sql-database-instance/index.ts';
import { SqlDatabase } from '../.gen/providers/google/sql-database/index.ts';
import { GoogleCloudCredentials } from '../credentials.ts';
import GcpUtils from '../utils.ts';

export class GoogleCloudDatabaseModule extends ResourceModule<'database', GoogleCloudCredentials> {
  outputs: ResourceOutputs['database'];
  db: SqlDatabase;

  constructor(scope: Construct, options: ResourceModuleOptions<'database', GoogleCloudCredentials>) {
    super(scope, options);

    GcpUtils.configureProvider(this);

    const instance = new DataGoogleSqlDatabaseInstance(this, 'database', {
      name: this.inputs?.databaseCluster || 'unknown',
    });

    const normalizedName = this.inputs?.name.replaceAll('/', '--');
    this.db = new SqlDatabase(this, 'sql-database', {
      name: normalizedName || 'unknown',
      instance: instance.name,
    });

    const host = instance.privateIpAddress;
    const { port, protocol } = GcpUtils.databasePortAndProtocol(instance.databaseVersion);

    const { username, password } = instance.replicaConfiguration.get(0);

    this.outputs = {
      id: `${instance.name}/${this.db.name}`,
      name: this.db.name,
      host,
      port,
      username,
      password,
      account: this.accountName,
      protocol,
      url: `${protocol}://${username}:${password}@${host}:${port}/${this.db.name}`,
    };
  }

  genImports(resourceId: string): Promise<Record<string, string>> {
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
