import { Construct } from 'constructs';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule, ResourceModuleOptions } from '../../module.ts';
import { ProjectService } from '../.gen/providers/google/project-service/index.ts';
import { SqlDatabase } from '../.gen/providers/google/sql-database/index.ts';
import { GoogleCloudCredentials } from '../credentials.ts';
import GcpUtils from '../utils.ts';

export class GoogleCloudDatabaseModule extends ResourceModule<'database', GoogleCloudCredentials> {
  outputs: ResourceOutputs['database'];
  db: SqlDatabase;

  constructor(scope: Construct, options: ResourceModuleOptions<'database', GoogleCloudCredentials>) {
    super(scope, options);

    GcpUtils.configureProvider(this);

    const depends_on = this.inputs?.name
      ? [
        new ProjectService(this, 'database-service', {
          service: 'sqladmin.googleapis.com',
          disableOnDestroy: false,
        }),
      ]
      : [];

    const [protocol, instance_name, host, port] = this.inputs?.databaseCluster.split('/') ||
      ['unknown', 'unknown', 'unknown', 'unknown'];

    const normalizedName = this.inputs?.name.replaceAll('/', '--');
    this.db = new SqlDatabase(this, 'sql-database', {
      dependsOn: depends_on,
      name: normalizedName || 'unknown',
      instance: instance_name,
      // For postgres, databases cannot be deleted from the API if there are
      // users other than cloudsqlsuperuser with access
      deletionPolicy: 'ABANDON',
    });

    this.outputs = {
      id: `${protocol}/${instance_name}/${this.db.name}/${host}/${port}`,
      name: this.db.name,
      host,
      port,
      username: '',
      password: '',
      account: this.accountName,
      protocol: protocol,
      url: `${protocol}://${host}:${port}/${this.db.name}`,
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
