import { assertEquals } from 'std/testing/asserts.ts';
import { ResourceInputs, ResourceOutputs, ResourceType } from '../../../@resources/types.ts';
import { CldctlTest, CldctlTestContext } from '../../tests.ts';
import { DigitaloceanCredentials } from '../credentials.ts';

export class DigitalOceanDnsZoneTest implements CldctlTest<DigitaloceanCredentials> {
  name = 'Basic DNS Zone Test';

  stacks = [
    {
      inputs: {
        type: 'dnsZone',
        name: 'arc.architest.dev',
        account: 'digitalocean',
      } as ResourceInputs['dnsZone'],
      serviceType: 'dnsZone' as ResourceType,
    },
  ];

  validateCreate = async (context: CldctlTestContext<Partial<DigitaloceanCredentials>>) => {
    const dns_zone = context.stacks[0];
    const inputs = dns_zone.inputs as ResourceInputs['dnsZone'];
    const outputs = dns_zone.outputs as ResourceOutputs['dnsZone'];

    assertEquals(inputs.name, outputs.name);
    assertEquals(inputs.name, outputs.id);
    assertEquals(outputs.nameservers.length, 0);
  };
}
