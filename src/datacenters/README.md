# ArcCtl Datacenters

ArcCtl datacenters are packages of configuration and rules dictating how
cloud resources should behave. Datacenters can create datacenter-wide
resources, environment-scoped resources, and can even mutate application
resources derived from components deployed to the datacenter.

The separation of datacenters from [components](../components/) and [environments](../environments/)
was done for two reasons:

1. To enable developer the freedom and power to deploy and create environments themselves, and
2. To give operators a way to control application behavior without compromising developer self-service

With datacenters, operators can configure the API gateway, service mesh, databases, DNS providers and
other global utilities and rules for all environments hosted by the datacenter. ArcCtl will automatically
match the cloud resources developers deploy with the rules of the datacenter to ensure everything gets
enriched the way ops teams need. Basically, datacenters let you make your own PaaS.

## Creating datacenters

Creating datacenters from existing templates is easy. All you have to do is run `arcctl apply datacenter`
and point to your configuration file. If the datacenter declares variables, you will be prompted for the
values at creation time:

```sh
$ arcctl apply datacenter digitalocean ./v1/examples/digitalocean.yml
 ? account: The docker account to use for this datacenter
 ❯ docker (docker)
   Add a new account
```

Once you've provided all the variable values (if any), arcctl will immediately start creating the
datacenter-scoped resources and then register the datacenter:

```
 ? account: The docker account to use for this datacenter › docker (docker)
⠴ Applying changes
  Name              Type           Action  Status    Time
  service-registry  volume         create  complete  0s
  network           namespace      create  complete  0s
  jaeger            deployment     create  complete  0s
  gateway           deployment     create  complete  0s
  local-gateway     arcctlAccount  create  complete  0s
Datacenter created successfully
```

## Updating datacenters

Datacenters can be updated as easily as they can be created. Simply provide a new
datacenter configuration file, and arcctl will propogate the changes:

```sh
$ arcctl apply datacenter digitalocean ./v1/examples/digitalocean.yml
```

Note that for datacenters that are actively hosting environments, changes to the datacenter
will also update all the hosted environments (where relevant) to ensure the environment
resources match the new criteria.

## Cleaning up datacenters

When you're ready to wind down a datacenter, all you have to do is run `arcctl destroy datacenter`.

```sh
$ arcctl destroy datacenter digitalocean
```

If the datacenter is actively hosting environments, all environments will also be cleaned up and removed.

## The datacenter configuration file

ArcCtl uses versioning to allow its core schemas to grow and evolve. To learn how to author a datacenter
configuration file, select a schema version below:

- [v1 (latest)](./v1/)
