import { ResourceOutputs } from '../../../@resources/types.ts';
import { ResourceModule, ResourceModuleOptions } from '../../module.ts';
import { DataDigitaloceanDatabaseCa } from '../.gen/providers/digitalocean/data-digitalocean-database-ca/index.ts';
import { DataDigitaloceanDatabaseCluster } from '../.gen/providers/digitalocean/data-digitalocean-database-cluster/index.ts';
import { DatabaseUser } from '../.gen/providers/digitalocean/database-user/index.ts';
import { DigitaloceanCredentials } from '../credentials.ts';
import { Construct } from 'constructs';

export class DigitaloceanDatabaseUserModule extends ResourceModule<'databaseUser', DigitaloceanCredentials> {
  outputs: ResourceOutputs['databaseUser'];
  user: DatabaseUser;

  constructor(scope: Construct, options: ResourceModuleOptions<'databaseUser'>) {
    super(scope, options);

    const [instance_name, database_name] = this.inputs?.databaseSchema.split('/') || ['unknown', 'unknown'];

    const instance = new DataDigitaloceanDatabaseCluster(this, 'instance', {
      name: instance_name,
    });

    const ca = new DataDigitaloceanDatabaseCa(this, 'ca', {
      clusterId: instance.id,
    });

    this.user = new DatabaseUser(this, 'user', {
      clusterId: instance.id,
      name: this.inputs?.username || 'unknown',
    });

    const protocol = `\${ ${instance.engine} == "pg" ? "postgresql" : ${instance.engine} }`;
    this.outputs = {
      id: this.user.id,
      database: database_name,
      host: instance.host,
      port: instance.port,
      username: this.user.name,
      password: this.user.password,
      protocol: protocol,
      certificate: ca.certificate,
      url: `${protocol}://${this.user.name}:${this.user.password}@${instance.host}:${instance.port}/${database_name}`,
    };
  }

  genImports(_credentials: DigitaloceanCredentials, resourceId: string): Promise<Record<string, string>> {
    return Promise.resolve({
      [this.getResourceRef(this.user)]: resourceId,
    });
  }

  getDisplayNames(): Record<string, string> {
    return {
      [this.getResourceRef(this.user)]: 'Database user',
    };
  }
}
