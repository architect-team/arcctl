import { ResourceType } from '../../../@resources/types.ts';
import { CldctlTest } from '../../tests.ts';
import { DigitaloceanCredentials } from '../credentials.ts';

export class DigitalOceanDatabaseTest
  implements CldctlTest<DigitaloceanCredentials>
{
  name = 'Basic Database Test';

  stacks = [
    {
      inputs: {
        type: 'database' as any,
        name: 'test-kubernetes-cluster',
        region: 'nyc1',
        vpc: '',
        databaseType: 'mysql',
        databaseVersion: '8',
        provider: 'digitalocean',
      },
      serviceType: 'database' as ResourceType,
      children: [
        {
          inputs: {
            type: 'vpc' as any,
            name: 'database-vpc',
            region: 'nyc1',
            provider: 'digitalocean',
          },
          serviceType: 'vpc' as ResourceType,
        },
      ],
    },
  ];
}
