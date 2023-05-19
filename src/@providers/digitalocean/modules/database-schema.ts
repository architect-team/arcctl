import { ResourceModule } from '../../module.js';
import { DataDigitaloceanDatabaseCa } from '../.gen/providers/digitalocean/data-digitalocean-database-ca/index.js';
import { DataDigitaloceanDatabaseCluster } from '../.gen/providers/digitalocean/data-digitalocean-database-cluster/index.js';
import { DatabaseDb } from '../.gen/providers/digitalocean/database-db/index.js';
import { DigitaloceanCredentials } from '../credentials.js';
import { ResourceInputs, ResourceOutputs } from '@resources/index.js';
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
      provider: inputs.provider || '',
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
