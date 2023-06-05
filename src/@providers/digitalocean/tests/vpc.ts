import { ResourceInputs, ResourceOutputs, ResourceType } from '../../../@resources/types.ts';
import { CldctlTest, CldctlTestContext } from '../../tests.ts';
import { DigitaloceanCredentials } from '../credentials.ts';
import { assertEquals } from 'std/testing/asserts.ts';

export class DigitalOceanVpcTest implements CldctlTest<DigitaloceanCredentials> {
  name = 'Basic VPC Test';

  stacks = [
    {
      inputs: {
        type: 'vpc' as any,
        name: 'test-vpc2',
        region: 'nyc1',
        provider: 'digitalocean',
      },
      serviceType: 'vpc' as ResourceType,
    },
  ];

  // deno-lint-ignore require-await
  validateCreate = async (context: CldctlTestContext<Partial<DigitaloceanCredentials>>) => {
    const vpcStack = context.stacks[0];
    const inputs = vpcStack.inputs as ResourceInputs['vpc'];
    const outputs = vpcStack.outputs as ResourceOutputs['vpc'];
    assertEquals(inputs.name, outputs.name);
    assertEquals(inputs.region, outputs.region);
  };
}
