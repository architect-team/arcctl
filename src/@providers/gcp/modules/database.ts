import { Construct } from 'constructs';
import * as path from 'std/path/mod.ts';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { ApplyOptions } from '../../base.service.ts';
import { ResourceModule, ResourceModuleOptions } from '../../module.ts';
import { TerraformResourceState } from '../../terraform.service.ts';
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
          disableOnDestroy: false,
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
      region: !this.inputs?.region ? 'us-east4-a' : this.inputs.region.split('-').slice(0, -1).join('-'),
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

    let cert = '';
    try {
      cert = this.database.serverCaCert.get(0).cert;
    } catch {
      cert = '';
    }

    // TODO: Fix outputs
    this.outputs = {
      id: this.database.id,
      protocol: this.inputs?.databaseType || '',
      host: this.database.connectionName,
      port: 0,
      username: this.user.name,
      password: this.user.password,
      certificate: cert,
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

  async afterImport(options: ApplyOptions<TerraformResourceState>) {
    const state_file = path.join(options.cwd!, 'terraform.tfstate');
    const file_contents = await Deno.readTextFile(state_file);
    const modified_file_contents = file_contents.replace(
      '"deletion_protection": true',
      '"deletion_protection": false',
    );
    Deno.writeTextFileSync(state_file, modified_file_contents);
  }
}
