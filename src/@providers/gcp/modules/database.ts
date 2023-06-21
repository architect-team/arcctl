import { Construct } from 'constructs';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule, ResourceModuleOptions } from '../../module.ts';
import { ProjectService } from '../.gen/providers/google/project-service/index.ts';
import { SqlDatabaseInstance } from '../.gen/providers/google/sql-database-instance/index.ts';
import { SqlUser } from '../.gen/providers/google/sql-user/index.ts';
import { GoogleCloudCredentials } from '../credentials.ts';

export class GoogleCloudDatabaseModule extends ResourceModule<'database', GoogleCloudCredentials> {
  database: SqlDatabaseInstance;
  user: SqlUser;
  outputs: ResourceOutputs['database'];

  constructor(scope: Construct, options: ResourceModuleOptions<'database', GoogleCloudCredentials>) {
    super(scope, options);

    const depends_on = this.inputs?.name
      ? [
        new ProjectService(this, 'database-service', {
          service: 'compute.googleapis.com',
        }),
      ]
      : [];

    this.database = new SqlDatabaseInstance(this, 'database', {
      dependsOn: depends_on,
      name: this.inputs?.name || 'deleting',
      databaseVersion: !this.inputs?.databaseType
        ? 'POSTGRES_14'
        : `${this.inputs.databaseType}_${this.inputs.databaseVersion}`,
      deletionProtection: false,
      region: !this.inputs?.region ? 'us-east1' : this.inputs.region.split('-').slice(0, -1).join('-'),
      settings: {
        tier: this.inputs?.databaseSize || 'db-f1-micro',
        deletionProtectionEnabled: false,
      },
    });

    const password = crypto.randomUUID();

    this.user = new SqlUser(this, 'user', {
      instance: this.database.name,
      dependsOn: [this.database],
      name: 'admin',
      password,
    });

    // TODO(tyler): Fix outputs
    this.outputs = {
      id: this.database.name,
      protocol: 'TODO',
      host: this.database.selfLink,
      port: 0,
      username: this.database.replicaConfiguration.username,
      password: this.database.replicaConfiguration.password,
      certificate: this.database.replicaConfiguration.caCertificate,
    };
  }

  async genImports(
    resourceId: string,
  ): Promise<Record<string, string>> {
    return {
      [this.getResourceRef(this.database)]: resourceId,
    };
  }

  getDisplayNames(): Record<string, string> {
    return {
      [this.getResourceRef(this.database)]: 'Database',
      [this.getResourceRef(this.user)]: 'Database User',
    };
  }

  // hooks = {
  //   afterImport: async () => {
  //     const file_path = path.join(CloudCtlConfig.getTerraformDirectory(), 'terraform.tfstate');
  //     const file_contents = await fs.promises.readFile(file_path, 'utf8');
  //     const modified_file_contents = file_contents.replace(
  //       '"deletion_protection": true',
  //       '"deletion_protection": false',
  //     );
  //     await fs.promises.writeFile(file_path, modified_file_contents);
  //   },
  // };
}
