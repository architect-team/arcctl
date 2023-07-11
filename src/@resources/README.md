# Architect Resources

In order to ensure that applications are portable, Architect has curated a set of
cloud resource "contracts" that help [component](../components/) developers collaborate with
[datacenter](../datacenters/) operators. Components are must be able to be converted
into a graph of these resources, and in doing so datacenters can predict what types of
resources need to be created and write rules for how they should be enriched.

In this folder, you'll find a list of all the resources supported by Architect. To learn more
about any particular resource, simply open up the resource folder and check out its
own README.

---

In addition to enabling large scale CI/CD, arcctl is great for experimenting with cloud
[providers](../%40providers/) by creating and managing individual cloud resources. Check out
the docs below to learn how to interface with the different resource types supported by your
favorite cloud [providers](../%40providers/) and tools.

## Retrieving resource details

You can easily list all the matching resources in your cloud account with `arcctl list`.
All fields are optional and you'll be prompted for everything you need:

```sh
# List all the VPCs in my digital ocean account
$ arcctl list <resource-type> --account <account-name>

# You'll be prompted for an account to list resources from
$ arcctl list <resource-type>

# You'll be prompted for both an account and resource type
$ arcctl list
```

Want to query a specific resource? Use the `arcctl get` command. Just like with the list
command, all fields are optional and you'll be prompted for everything you need.

```sh
# Retrieve the details of a single resource
$ arcctl get <resource-type> <resource-id> --account <account-name>
```

## Creating resources

Want to create a VPC, a kubernetes cluster, or maybe a dns record? Use `arcctl create`
to create individual cloud resources on any supported cloud [provider](../%40providers/).

```sh
# You'll be prompted for each input the resource type requires
$ arcctl create <resource-type> --account <account-name>

# You'll be prompted for an account that supports the specified resource type
$ arcctl create <resource-type>

# You'll be prompted for an account, resource type, and the required inputs for creating the resource
$ arcctl create
```

## Destroying resources

Need to clean up your resources when you're done? Run `arcctl destroy` to remove cloud resources
and keep your cloud bill small! Don't worry, you'll get a confirmation prompt before the
resource gets deleted.

```sh
# Delete the specified resource
$ arcctl destroy <resource-type> <resource-id> --account <account-name>

# You'll be prompted for a resource matching the resource type to destroy
$ arcctl destroy <resource-type> --account <account-name>

# You'll be prompted for an account, resource type, and specific resource to destroy
$ arcctl destroy
```
