import { assertArrayIncludes, assertEquals, assertStringIncludes } from 'std/testing/asserts.ts';
import { ResourceInputs, ResourceOutputs, ResourceType } from '../../../@resources/types.ts';
import { CldctlTest, CldctlTestContext } from '../../tests.ts';
import { GoogleCloudCredentials } from '../credentials.ts';

export class GoogleCloudDnsRecordTest implements CldctlTest<GoogleCloudCredentials> {
  name = 'Basic DNS Record Test';

  stacks = [
    {
      inputs: {
        type: 'dnsRecord',
        recordType: 'A',
        name: 'architest.dev',
        dnsZone: 'dnsZone',
        subdomain: 'subdomain',
        content: '8.8.8.8',
        provider: 'gcp',
      } as ResourceInputs['dnsRecord'],
      serviceType: 'dnsRecord' as ResourceType,
      children: [
        {
          inputs: {
            type: 'dnsZone',
            name: 'architest',
            dnsName: 'arc.architest.dev.',
            provider: 'gcp',
          } as ResourceInputs['dnsZone'],
          serviceType: 'dnsZone' as ResourceType,
        },
      ],
    },
  ];

  validateCreate = async (context: CldctlTestContext<Partial<GoogleCloudCredentials>>) => {
    const dns_record = context.stacks[0];
    const dns_zone = context.stacks[0].children![0];
    const dns_record_inputs = dns_record.inputs as ResourceInputs['dnsRecord'];
    const dns_record_outputs = dns_record.outputs as ResourceOutputs['dnsRecord'];
    const dns_zone_inputs = dns_zone!.inputs as ResourceInputs['dnsZone'];

    assertStringIncludes(dns_record_outputs.name, dns_record_inputs.subdomain);
    assertStringIncludes(dns_record_outputs.id, dns_record_inputs.subdomain);
    assertEquals(dns_record_inputs.recordType, dns_record_outputs.recordType);
    assertArrayIncludes(dns_record_outputs.data, dns_record_inputs.content);
    assertStringIncludes(dns_record_outputs.managedZone, dns_zone_inputs.name);
  };
}
