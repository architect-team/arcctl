import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.js';
import { ResourceModule } from '../../module.js';
import { DataDigitaloceanDatabaseCa } from '../.gen/providers/digitalocean/data-digitalocean-database-ca/index.js';
import { DataDigitaloceanVpc } from '../.gen/providers/digitalocean/data-digitalocean-vpc/index.js';
import { DatabaseCluster } from '../.gen/providers/digitalocean/database-cluster/index.js';
import { DigitaloceanCredentials } from '../credentials.js';
import { Construct } from 'npm:constructs';

export class DigitaloceanDatabaseModule extends ResourceModule<
  'database',
  DigitaloceanCredentials
> {
  database: DatabaseCluster;
  outputs: ResourceOutputs['database'];

  constructor(
    scope: Construct,
    id: string,
    inputs: ResourceInputs['database'],
  ) {
    super(scope, id, inputs);

    const vpc = new DataDigitaloceanVpc(this, 'vpc', {
      id: inputs.vpc,
    });

    let protocol = inputs.databaseType;
    if (protocol === 'postgres') {
      protocol = 'postgresql';
    }

    let engine = inputs.databaseType;
    if (engine === 'postgres') {
      engine = 'pg';
    }

    this.database = new DatabaseCluster(this, 'database', {
      name: inputs.name.replaceAll('/', '--').toLowerCase(),
      region: vpc.region || inputs.region,
      size: inputs.databaseSize || 'db-s-1vcpu-1gb',
      engine: engine,
      version: inputs.databaseVersion || '8',
      nodeCount: 1,
      privateNetworkUuid: vpc.id,
    });

    const ca = new DataDigitaloceanDatabaseCa(this, 'ca', {
      clusterId: this.database.id,
    });

    this.outputs = {
      id: this.database.name,
      protocol: protocol,
      host: this.database.host,
      port: this.database.port,
      provider: inputs.provider!,
      certificate: ca.certificate,
    };
  }

  async genImports(
    credentials: DigitaloceanCredentials,
    resourceId: string,
  ): Promise<Record<string, string>> {
    return {
      [this.getResourceRef(this.database)]: resourceId,
    };
  }

  getDisplayNames(): Record<string, string> {
    return {
      [this.getResourceRef(this.database)]: 'Database',
    };
  }
}
