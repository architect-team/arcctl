import {
  ResourceInputs,
  ResourceOutputs,
  ResourceType,
} from '../../../@resources/types.ts';
import { CldctlTest, CldctlTestContext } from '../../tests.ts';
import { DigitaloceanCredentials } from '../credentials.ts';
import { expect } from 'chai';

export class DigitalOceanVpcTest
  implements CldctlTest<DigitaloceanCredentials>
{
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

  validateCreate = async (
    context: CldctlTestContext<Partial<DigitaloceanCredentials>>,
  ) => {
    const vpcStack = context.stacks[0];
    const inputs = vpcStack.inputs as ResourceInputs['vpc'];
    const outputs = vpcStack.outputs as ResourceOutputs['vpc'];
    expect(inputs.name).to.equal(outputs.name);
    expect(inputs.region).to.equal(outputs.region);
  };
}
