using System;
using System.Collections.Generic;
using Pulumi;
using Pulumi.Gcp.Dns;
using Pulumi.Gcp.Projects;

return await Deployment.RunAsync(() =>
{
    var config = new Config();

    var dnsRecordService = new Service("dns-record-service", new ServiceArgs {
        ServiceName = "dns.googleapis.com",
        DisableOnDestroy = false
    });
    var customResourceOptions = new CustomResourceOptions {
        DependsOn = { dnsRecordService }
    };

    string dnsZoneName = config.Require("dnsZone").Replace('.', '-');

    var dnsManagedZoneArgs = new GetManagedZoneInvokeArgs {
        Name = dnsZoneName
    };
    var managedZone = GetManagedZone.Invoke(dnsManagedZoneArgs);
    var dnsName = managedZone.Apply(getManagedZoneResult => getManagedZoneResult.DnsName);
    var managedZoneName = managedZone.Apply(getManagedZoneResult => getManagedZoneResult.Name);

    string subdomain = config.Require("subdomain");
    string name = subdomain.EndsWith('.') ? subdomain : $"{subdomain}.";

    var dnsRecordSetArgs = new RecordSetArgs {
        Name = Output.Format($"{name}{dnsName}"),
        ManagedZone = managedZoneName,
        Type = config.Require("recordType"),
        Rrdatas = !string.IsNullOrEmpty(config.Get("content")) ? config.Require("content").Split(' ') : Array.Empty<string>(),
        Ttl = !string.IsNullOrEmpty(config.Get("ttl")) ? int.Parse(config.Require("ttl")) : 12 * 60 * 60
    };
    var dnsRecordSet = new RecordSet("dns-record", dnsRecordSetArgs, customResourceOptions);

    return new Dictionary<string, object?>
    {
        ["id"] = dnsRecordSet.Name,
        ["name"] = dnsRecordSet.Name,
        ["managedZone"] = dnsRecordSet.ManagedZone,
        ["recordType"] = dnsRecordSet.Type,
        ["data"] = dnsRecordSet.Rrdatas
    };
});
