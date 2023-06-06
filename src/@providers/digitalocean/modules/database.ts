import { ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule, ResourceModuleOptions } from '../../module.ts';
import { DataDigitaloceanDatabaseCa } from '../.gen/providers/digitalocean/data-digitalocean-database-ca/index.ts';
import { DataDigitaloceanVpc } from '../.gen/providers/digitalocean/data-digitalocean-vpc/index.ts';
import { DatabaseCluster } from '../.gen/providers/digitalocean/database-cluster/index.ts';
import { DigitaloceanCredentials } from '../credentials.ts';
import { Construct } from 'constructs';

export class DigitaloceanDatabaseModule extends ResourceModule<'database', DigitaloceanCredentials> {
  database: DatabaseCluster;
  outputs: ResourceOutputs['database'];

  constructor(scope: Construct, options: ResourceModuleOptions<'database'>) {
    super(scope, options);

    const vpc = new DataDigitaloceanVpc(this, 'vpc', {
      id: this.inputs?.vpc || 'unknown',
    });

    let protocol = this.inputs?.databaseType || 'unknown';
    if (protocol === 'postgres') {
      protocol = 'postgresql';
    }

    let engine = this.inputs?.databaseType || 'unknown';
    if (engine === 'postgres') {
      engine = 'pg';
    }

    this.database = new DatabaseCluster(this, 'database', {
      name: this.inputs?.name.replaceAll('/', '--').toLowerCase() || 'unknown',
      region: vpc.region || this.inputs?.region || 'unknown',
      size: this.inputs?.databaseSize || 'db-s-1vcpu-1gb',
      engine: engine,
      version: this.inputs?.databaseVersion || '8',
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
      username: this.database.user,
      password: this.database.password,
      certificate: ca.certificate,
    };
  }

  genImports(_credentials: DigitaloceanCredentials, resourceId: string): Promise<Record<string, string>> {
    return Promise.resolve({
      [this.getResourceRef(this.database)]: resourceId,
    });
  }

  getDisplayNames(): Record<string, string> {
    return {
      [this.getResourceRef(this.database)]: 'Database',
    };
  }
}
