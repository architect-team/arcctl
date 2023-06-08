import { assertEquals, assertStringIncludes } from 'std/testing/asserts.ts';
import { ResourceInputs, ResourceOutputs, ResourceType } from '../../../@resources/types.ts';
import { CldctlTest, CldctlTestContext } from '../../tests.ts';
import { AwsCredentials } from '../credentials.ts';

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

  validateCreate = async (context: CldctlTestContext<Partial<AwsCredentials>>) => {
    const dns_zone = context.stacks[0];
    const inputs = dns_zone.inputs as ResourceInputs['dnsZone'];
    const outputs = dns_zone.outputs as ResourceOutputs['dnsZone'];

    assertEquals(inputs.name, outputs.name);
    assertEquals(outputs.nameservers.length, 4);
    assertStringIncludes(outputs.nameservers[0], '.awsdns-');
  };
}
