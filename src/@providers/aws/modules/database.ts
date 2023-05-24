import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.js';
import { ResourceModule } from '../../module.js';
import { Rds } from '../.gen/modules/rds.js';
import { DataAwsSubnets } from '../.gen/providers/aws/data-aws-subnets/index.js';
import { DbSubnetGroup } from '../.gen/providers/aws/db-subnet-group/index.js';
import { AwsProvider } from '../.gen/providers/aws/provider/index.js';
import { AwsCredentials } from '../credentials.js';
import { Construct } from 'constructs';

export class AwsDatabaseModule extends ResourceModule<
  'database',
  AwsCredentials
> {
  outputs: ResourceOutputs['database'];
  database: Rds;

  constructor(
    scope: Construct,
    id: string,
    inputs: ResourceInputs['database'],
  ) {
    super(scope, id, inputs);

    const [engineVersion, majorEngineVersion] = (
      inputs.databaseVersion || ''
    ).split('/');

    const vpc_parts = inputs.vpc
      ? inputs.vpc.match(/^([\dA-Za-z-]+)\/(.*)$/)
      : [];
    if (!vpc_parts && this.inputs.name) {
      throw new Error('VPC must be of the format, <region>/<vpc_id>');
    }
    const vpc_id = vpc_parts ? vpc_parts[2] : '';

    if (inputs.region) {
      const aws_provider = this.scope.node.children[0] as AwsProvider;
      aws_provider.region = inputs.region;
    }

    const subnet_ids = new DataAwsSubnets(this, 'subnet_ids', {
      filter: [
        {
          name: 'tag:Name',
          values: ['*-private-*'],
        },
        {
          name: 'vpc-id',
          values: [vpc_id],
        },
      ],
    });

    const dbSubnetGroup = new DbSubnetGroup(this, 'my-db-subnet-group', {
      subnetIds: subnet_ids.ids,
    });

    this.database = new Rds(this, 'database', {
      identifier: inputs.name,
      engine: inputs.databaseType,
      engineVersion: engineVersion,
      majorEngineVersion: majorEngineVersion,
      instanceClass: inputs.databaseSize,
      allocatedStorage: '50',
      storageEncrypted: false,
      username: 'cldctl',
      dbSubnetGroupName: dbSubnetGroup.name,
      family: `${inputs.databaseType}${majorEngineVersion}`,
    });

    this.outputs = {
      id: `${inputs.region}/${this.database.identifier}`,
      host: this.database.dbInstanceEndpointOutput,
      port: this.database.dbInstancePortOutput as any,
      protocol: inputs.databaseType,
      account: '',
    };
  }

  async genImports(
    credentials: AwsCredentials,
    resourceId: string,
  ): Promise<Record<string, string>> {
    const moduleId = ['module', this.database.friendlyUniqueId].join('.');

    const [region, id] = resourceId.split('/');
    const aws_provider = this.scope.node.children[0] as AwsProvider;
    aws_provider.region = region;

    return {
      [`${moduleId}.module.db_instance.aws_db_instance.this[0]`]: id,
    };
  }

  getDisplayNames(): Record<string, string> {
    const moduleId = ['module', this.database.friendlyUniqueId].join('.');
    return {
      [`${moduleId}.module.db_instance.aws_db_instance.this[0]`]: 'Database',
    };
  }
}
