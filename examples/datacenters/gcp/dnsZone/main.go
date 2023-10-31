package main

import (
	"strings"

	"github.com/pulumi/pulumi-gcp/sdk/v5/go/gcp/dns"
	"github.com/pulumi/pulumi-gcp/sdk/v5/go/gcp/projects"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi/config"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		conf := config.New(ctx, "")

		projectService, err := projects.NewService(ctx, "dns-zone-service", &projects.ServiceArgs{
			Service:          pulumi.String("dns.googleapis.com"),
			DisableOnDestroy: pulumi.Bool(false),
		})

		zoneName := strings.ReplaceAll(conf.Require("name"), ".", "-")
		zoneName = zoneName[:len(zoneName)-1]

		managedZone, err := dns.NewManagedZone(ctx, zoneName, &dns.ManagedZoneArgs{
			Name:    pulumi.String(zoneName),
			DnsName: pulumi.String(conf.Require("name")),
		},
			pulumi.DependsOn([]pulumi.Resource{projectService}),
		)
		if err != nil {
			return err
		}

		ctx.Export("id", managedZone.Name)
		ctx.Export("name", managedZone.DnsName)
		ctx.Export("nameservers", managedZone.NameServers)

		return nil
	})
}
