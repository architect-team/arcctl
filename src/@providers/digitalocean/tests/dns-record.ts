import { ResourceInputs, ResourceOutputs, ResourceType } from '../../../@resources/types.ts';
import { CldctlTest, CldctlTestContext } from '../../tests.ts';
import { DigitaloceanCredentials } from '../credentials.ts';
import { assertArrayIncludes, assertEquals } from 'std/testing/asserts.ts';

export class DigitalOceanDnsRecordTest implements CldctlTest<DigitaloceanCredentials> {
  name = 'Basic DNS Record Test';

  stacks = [
    {
      inputs: {
        type: 'dnsRecord',
        recordType: 'A',
        name: 'architest.dev',
        dnsZone: 'dnsZone',
        subdomain: 'subdomain.arc.architest.dev',
        content: '8.8.8.8',
        provider: 'digitalocean',
      } as ResourceInputs['dnsRecord'],
      serviceType: 'dnsRecord' as ResourceType,
      children: [
        {
          inputs: {
            type: 'dnsZone',
            name: 'arc.architest.dev',
            dnsName: 'arc.architest.dev',
            provider: 'digitalocean',
          } as ResourceInputs['dnsZone'],
          serviceType: 'dnsZone' as ResourceType,
        },
      ],
    },
  ];

  // deno-lint-ignore require-await
  validateCreate = async (context: CldctlTestContext<Partial<DigitaloceanCredentials>>) => {
    const dns_record = context.stacks[0];
    const dns_zone = context.stacks[0].children![0];
    const dns_record_inputs = dns_record.inputs as ResourceInputs['dnsRecord'];
    const dns_record_outputs = dns_record.outputs as ResourceOutputs['dnsRecord'];
    const dns_zone_outputs = dns_zone.outputs as ResourceOutputs['dnsZone'];

    assertEquals(dns_record_inputs.subdomain, dns_record_outputs.name);
    assertEquals(dns_record_inputs.subdomain, dns_record_outputs.id);
    assertEquals(dns_record_inputs.recordType, dns_record_outputs.recordType);
    assertArrayIncludes(dns_record_outputs.data, dns_record_inputs.content);
    assertArrayIncludes(dns_record_outputs.name, dns_zone_outputs.name);
  };
}
