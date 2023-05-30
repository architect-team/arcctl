import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule } from '../../module.ts';
import { DataDigitaloceanDatabaseCa } from '../.gen/providers/digitalocean/data-digitalocean-database-ca/index.ts';
import { DataDigitaloceanDatabaseCluster } from '../.gen/providers/digitalocean/data-digitalocean-database-cluster/index.ts';
import { DatabaseDb } from '../.gen/providers/digitalocean/database-db/index.ts';
import { DigitaloceanCredentials } from '../credentials.ts';
import { Construct } from 'constructs';

export class DigitaloceanDatabaseSchemaModule extends ResourceModule<
  'databaseSchema',
  DigitaloceanCredentials
> {
  outputs: ResourceOutputs['databaseSchema'];
  db: DatabaseDb;

  constructor(
    scope: Construct,
    id: string,
    inputs: ResourceInputs['databaseSchema'],
  ) {
    super(scope, id, inputs);

    const instance = new DataDigitaloceanDatabaseCluster(this, 'instance', {
      name: inputs.database,
    });

    this.db = new DatabaseDb(this, 'database', {
      clusterId: instance.id,
      name: inputs.name.replace(/\//g, '--'),
    });

    const ca = new DataDigitaloceanDatabaseCa(this, 'ca', {
      clusterId: instance.id,
    });

    let protocol = inputs.databaseType;
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
      account: inputs.account || '',
      certificate: ca.certificate,
    };
  }

  async genImports(
    credentials: DigitaloceanCredentials,
    resourceId: string,
  ): Promise<Record<string, string>> {
    return {
      [this.getResourceRef(this.db)]: resourceId,
    };
  }

  getDisplayNames(): Record<string, string> {
    return {
      [this.getResourceRef(this.db)]: 'Database',
    };
  }
}
