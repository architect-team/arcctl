import { expect } from 'chai';
import { ResourceInputs, ResourceOutputs, ResourceType } from '../../../@resources/types.js';
import { CldctlTest, CldctlTestContext } from '../../tests.js';
import { DigitaloceanCredentials } from '../credentials';

export class DigitalOceanDnsZoneTest implements CldctlTest<DigitaloceanCredentials> {
  name = 'Basic DNS Zone Test';

  stacks = [{
    inputs: {
      type: 'dnsZone',
      name: 'arc.architest.dev',
      dnsName: 'arc.architest.dev',
      provider: 'digitalocean',
    } as ResourceInputs['dnsZone'],
    serviceType: 'dnsZone' as ResourceType,
  }];

  validateCreate = async (context: CldctlTestContext<Partial<DigitaloceanCredentials>>) => {
    const dns_zone = context.stacks[0];
    const inputs = dns_zone.inputs as ResourceInputs['dnsZone'];
    const outputs = dns_zone.outputs as ResourceOutputs['dnsZone'];

    expect(inputs.name).to.equal(outputs.name);
    expect(inputs.dnsName).to.equal(outputs.name);
    expect(inputs.name).to.equal(outputs.id);
    expect(outputs.nameservers).length(0);
  }
}
