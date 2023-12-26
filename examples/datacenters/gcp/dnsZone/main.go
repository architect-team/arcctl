package main

import (
	"encoding/json"
	"errors"
	"os"
	"strings"

	"github.com/pulumi/pulumi-gcp/sdk/v5/go/gcp/dns"
	"github.com/pulumi/pulumi-gcp/sdk/v5/go/gcp/projects"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

type config struct {
	Name string `json:"name"`
}

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		inputs := os.Getenv("INPUTS")
		if inputs == "" {
			return errors.New("Missing configuration. Please provide it via the INPUTS environment variable.")
		}

		conf := config{}
		json.Unmarshal([]byte(inputs), &conf)

		projectService, err := projects.NewService(ctx, "dns-zone-service", &projects.ServiceArgs{
			Service:          pulumi.String("dns.googleapis.com"),
			DisableOnDestroy: pulumi.Bool(false),
		})

		zoneName := strings.ReplaceAll(conf.Name, ".", "-")
		zoneName = zoneName[:len(zoneName)-1]

		managedZone, err := dns.NewManagedZone(ctx, zoneName, &dns.ManagedZoneArgs{
			Name:    pulumi.String(zoneName),
			DnsName: pulumi.String(conf.Name),
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
