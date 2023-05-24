import {
  ResourceInputs,
  ResourceOutputs,
  ResourceType,
} from '../../../@resources/types.ts';
import { CldctlTest, CldctlTestContext } from '../../tests.ts';
import { AwsCredentials } from '../credentials';
import { expect } from 'chai';

export class AwsDnsZoneTest implements CldctlTest<AwsCredentials> {
  name = 'Basic DNS Zone Test';

  stacks = [
    {
      inputs: {
        type: 'dnsZone',
        name: 'arc.architest.dev',
        account: 'aws',
      } as ResourceInputs['dnsZone'],
      serviceType: 'dnsZone' as ResourceType,
    },
  ];

  validateCreate = async (
    context: CldctlTestContext<Partial<AwsCredentials>>,
  ) => {
    const dns_zone = context.stacks[0];
    const inputs = dns_zone.inputs as ResourceInputs['dnsZone'];
    const outputs = dns_zone.outputs as ResourceOutputs['dnsZone'];

    expect(inputs.name).to.equal(outputs.name);
    expect(outputs.nameservers).length(4);
    expect(outputs.nameservers[0]).to.include('.awsdns-');
  };
}
