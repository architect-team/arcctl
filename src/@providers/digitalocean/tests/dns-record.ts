import { expect } from 'chai';
import {
  ResourceInputs,
  ResourceOutputs,
  ResourceType,
} from '../../../@resources/types.ts';
import { CldctlTest, CldctlTestContext } from '../../tests.ts';
import { DigitaloceanCredentials } from '../credentials';

export class DigitalOceanDnsRecordTest
  implements CldctlTest<DigitaloceanCredentials>
{
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

  validateCreate = async (
    context: CldctlTestContext<Partial<DigitaloceanCredentials>>,
  ) => {
    const dns_record = context.stacks[0];
    const dns_zone = context.stacks[0].children![0];
    const dns_record_inputs = dns_record.inputs as ResourceInputs['dnsRecord'];
    const dns_record_outputs =
      dns_record.outputs as ResourceOutputs['dnsRecord'];
    const dns_zone_outputs = dns_zone.outputs as ResourceOutputs['dnsZone'];

    expect(dns_record_inputs.subdomain).to.equal(dns_record_outputs.name);
    expect(dns_record_inputs.subdomain).to.equal(dns_record_outputs.id);
    expect(dns_record_inputs.recordType).to.equal(
      dns_record_outputs.recordType,
    );
    expect(dns_record_outputs.data).includes(dns_record_inputs.content);
    expect(dns_record_outputs.name).includes(dns_zone_outputs.name);
  };
}
