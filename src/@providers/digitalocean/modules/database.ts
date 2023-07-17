import { Construct } from 'constructs';
import { ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule, ResourceModuleOptions } from '../../module.ts';
import { DataDigitaloceanDatabaseCa } from '../.gen/providers/digitalocean/data-digitalocean-database-ca/index.ts';
import { DataDigitaloceanDatabaseCluster } from '../.gen/providers/digitalocean/data-digitalocean-database-cluster/index.ts';
import { DatabaseDb } from '../.gen/providers/digitalocean/database-db/index.ts';
import { DigitaloceanCredentials } from '../credentials.ts';

export class DigitaloceanDatabaseModule extends ResourceModule<'database', DigitaloceanCredentials> {
  outputs: ResourceOutputs['database'];
  db: DatabaseDb;

  constructor(scope: Construct, options: ResourceModuleOptions<'database', DigitaloceanCredentials>) {
    super(scope, options);

    const instance = new DataDigitaloceanDatabaseCluster(this, 'instance', {
      name: this.inputs?.databaseCluster || 'unknown',
    });

    this.db = new DatabaseDb(this, 'databaseCluster', {
      clusterId: instance.id,
      name: this.inputs?.name.replace(/\//g, '--') || 'unknown',
    });

    const ca = new DataDigitaloceanDatabaseCa(this, 'ca', {
      clusterId: instance.id,
    });

    let protocol = this.inputs?.databaseType || 'unknown';
    if (protocol === 'postgres') {
      protocol = 'postgresql';
    }

    this.outputs = {
      id: `${instance.name}/${this.db.name}`,
      name: this.db.name,
      host: instance.host,
      port: instance.port,
      protocol: protocol,
      url: `${protocol}://${instance.host}:${instance.port}/${this.db.name}`,
      username: instance.user,
      password: instance.password,
      certificate: ca.certificate,
      account: this.accountName,
    };
  }

  genImports(resourceId: string): Promise<Record<string, string>> {
    return Promise.resolve({
      [this.getResourceRef(this.db)]: resourceId,
    });
  }

  getDisplayNames(): Record<string, string> {
    return {
      [this.getResourceRef(this.db)]: 'Database',
    };
  }
}
