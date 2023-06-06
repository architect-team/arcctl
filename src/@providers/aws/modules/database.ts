import { Fn, TerraformOutput } from 'cdktf';
import { Construct } from 'constructs';
import { ResourceInputs, ResourceOutputs } from '../../../@resources/index.ts';
import { ResourceModule } from '../../module.ts';
import { ProviderStore } from '../../store.ts';
import { SupportedProviders } from '../../supported-providers.ts';
import { Rds } from '../.gen/modules/rds.ts';
import { DataAwsSubnets } from '../.gen/providers/aws/data-aws-subnets/index.ts';
import { DbSubnetGroup } from '../.gen/providers/aws/db-subnet-group/index.ts';
import { AwsProvider } from '../.gen/providers/aws/provider/index.ts';
import { SecurityGroup } from '../.gen/providers/aws/security-group/index.ts';
import { AwsCredentials } from '../credentials.ts';

export class AwsDatabaseModule extends ResourceModule<'database', AwsCredentials> {
  outputs: ResourceOutputs['database'];
  database: Rds;
  private username: TerraformOutput;
  private password: TerraformOutput;
  private certificate: TerraformOutput;

  constructor(scope: Construct, id: string, inputs: ResourceInputs['database']) {
    super(scope, id, inputs);

    const name = inputs.name.replaceAll('/', '-').toLowerCase();
    const vpc_parts = inputs.vpc ? inputs.vpc.match(/^([\dA-Za-z-]+)\/(.*)$/) : [];
    if (!vpc_parts) {
      throw new Error('VPC must be of the format, <region>/<vpc_id>');
    }
    const [region, vpc_id] = (inputs.vpc || '/').split('/');

    if (region) {
      const aws_provider = this.scope.node.children.find((child) => child instanceof AwsProvider) as
        | AwsProvider
        | undefined;
      if (!aws_provider) {
        throw new Error('Unable to set region on AWS provider.');
      }
      aws_provider.region = region;
    }

    const database_security_group = new SecurityGroup(this, `database-security-group-${name}`, {
      name: `database-${name}`,
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
    });

    const subnet_ids = new DataAwsSubnets(this, `subnet_ids-${name}`, {
      filter: [
        {
          name: 'vpc-id',
          values: [vpc_id],
        },
      ],
    });

    const dbSubnetGroup = new DbSubnetGroup(this, `db-subnet-group-${name}`, {
      subnetIds: subnet_ids.ids,
      name: `db-subnet-group-${name}`,
    });

    this.database = new Rds(this, `database-${name}`, {
      identifier: name,
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

    this.username = new TerraformOutput(this, `database-${name}-username`, {
      value: this.database.dbInstanceUsernameOutput,
      sensitive: true,
    });

    this.password = new TerraformOutput(this, `database-${name}-password`, {
      value: this.database.dbInstancePasswordOutput,
      sensitive: true,
    });

    this.certificate = new TerraformOutput(this, `database-${name}-certificate`, {
      sensitive: true,
      value: this.database.dbInstanceCaCertIdentifierOutput,
    });

    this.outputs = {
      id: this.database.identifier,
      protocol,
      host: this.database.dbInstanceAddressOutput,
      port: Fn.tonumber(this.database.dbInstancePortOutput),
      account: `postgres-${inputs.name}`,
      certificate: this.certificate.value,
    };
  }

  // deno-lint-ignore require-await
  async genImports(credentials: AwsCredentials, resourceId: string): Promise<Record<string, string>> {
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
