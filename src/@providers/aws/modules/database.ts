import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.js';
import { ResourceModule } from '../../module.js';
import { ProviderStore } from '../../store.js';
import { SupportedProviders } from '../../supported-providers.js';
import { Rds } from '../.gen/modules/rds.js';
import { DataAwsSubnets } from '../.gen/providers/aws/data-aws-subnets/index.js';
import { DbSubnetGroup } from '../.gen/providers/aws/db-subnet-group/index.js';
import { AwsProvider } from '../.gen/providers/aws/provider/index.js';
import { SecurityGroup } from '../.gen/providers/aws/security-group/index.js';
import { AwsCredentials } from '../credentials.js';
import { Fn, TerraformOutput } from 'cdktf';
import { Construct } from 'constructs';

export class AwsDatabaseModule extends ResourceModule<
  'database',
  AwsCredentials
> {
  outputs: ResourceOutputs['database'];
  database: Rds;
  private username: TerraformOutput;
  private password: TerraformOutput;
  private certificate: TerraformOutput;

  constructor(
    scope: Construct,
    id: string,
    inputs: ResourceInputs['database'],
  ) {
    super(scope, id, inputs);

    const vpc_parts = inputs.vpc
      ? inputs.vpc.match(/^([\dA-Za-z-]+)\/(.*)$/)
      : [];
    if (!vpc_parts && this.inputs.name) {
      throw new Error('VPC must be of the format, <region>/<vpc_id>');
    }
    const [region, vpc_id] = (inputs.vpc || '/').split('/');

    if (region) {
      const aws_provider = this.scope.node.children.find(
        (child) => child instanceof AwsProvider,
      ) as AwsProvider | undefined;
      if (!aws_provider) {
        throw new Error('Unable to set region on AWS provider.');
      }
      aws_provider.region = region;
    }

    const database_security_group = new SecurityGroup(
      this,
      `database-security-group-${inputs.name}`,
      {
        name: `database-${inputs.name}`,
        description: 'Allow database access',
        vpcId: vpc_id,
        ingress: [
          {
            protocol: 'tcp',
            fromPort: 5432,
            toPort: 5432,
            cidrBlocks: ['0.0.0.0/0'],
          },
        ],
      },
    );

    const subnet_ids = new DataAwsSubnets(this, `subnet_ids-${inputs.name}`, {
      filter: [
        {
          name: 'vpc-id',
          values: [vpc_id],
        },
      ],
    });

    const dbSubnetGroup = new DbSubnetGroup(
      this,
      `db-subnet-group-${inputs.name}`,
      {
        subnetIds: subnet_ids.ids,
        name: `db-subnet-group-${inputs.name}`,
      },
    );

    this.database = new Rds(this, `database-${inputs.name}`, {
      identifier: inputs.name,
      publiclyAccessible: true,
      engine: inputs.databaseType,
      engineVersion: inputs.databaseVersion,
      vpcSecurityGroupIds: [database_security_group.id],
      instanceClass: inputs.databaseSize,
      allocatedStorage: '50',
      storageEncrypted: false,
      username: 'arcctl',
      dbSubnetGroupName: dbSubnetGroup.name,
      family: `${inputs.databaseType}${inputs.databaseVersion}`,
    });

    let protocol = inputs.databaseType;
    if (protocol === 'postgres') {
      protocol = 'postgresql';
    }

    this.username = new TerraformOutput(
      this,
      `database-${inputs.name}-username`,
      {
        value: this.database.dbInstanceUsernameOutput,
        sensitive: true,
      },
    );

    this.password = new TerraformOutput(
      this,
      `database-${inputs.name}-password`,
      {
        value: this.database.dbInstancePasswordOutput,
        sensitive: true,
      },
    );

    this.certificate = new TerraformOutput(
      this,
      `database-${inputs.name}-certificate`,
      {
        sensitive: true,
        value: this.database.dbInstanceCaCertIdentifierOutput,
      },
    );

    this.outputs = {
      id: this.database.identifier,
      protocol,
      host: this.database.dbInstanceAddressOutput,
      port: Fn.tonumber(this.database.dbInstancePortOutput),
      account: `postgres-${this.inputs.name}`,
      certificate: this.certificate.value,
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

  hooks = {
    afterCreate: async (
      providerStore: ProviderStore,
      outputs: ResourceOutputs['database'],
      getOutputValue: (id: string) => Promise<any>,
    ) => {
      const username = await getOutputValue(this.username.friendlyUniqueId);
      const password = await getOutputValue(this.password.friendlyUniqueId);
      const host = outputs.host;
      const port = outputs.port;
      providerStore.saveProvider(
        new SupportedProviders.postgres(
          `postgres-${this.inputs.name}`,
          {
            host,
            port,
            username,
            password,
            database: 'postgres',
          },
          providerStore.saveFile.bind(providerStore),
        ),
      );
    },
  };
}
