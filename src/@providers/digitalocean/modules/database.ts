import { Construct } from 'constructs';
import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule } from '../../module.ts';
import { DataDigitaloceanDatabaseCa } from '../.gen/providers/digitalocean/data-digitalocean-database-ca/index.ts';
import { DataDigitaloceanVpc } from '../.gen/providers/digitalocean/data-digitalocean-vpc/index.ts';
import { DatabaseCluster } from '../.gen/providers/digitalocean/database-cluster/index.ts';
import { DigitaloceanCredentials } from '../credentials.ts';

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
      account: inputs.account!,
      certificate: ca.certificate,
    };
  }

  // deno-lint-ignore require-await
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
