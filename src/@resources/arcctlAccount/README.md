# arcctlAccount

This resource is a special, reserved resource for use by arcctl. It represents
an account that will be registered with arcctl to be used to create cloud
resources in another cloud provider.

Want to create and query accounts? Check out the [providers](../../%40providers/)
documentation to learn how to register and remove cloud accounts.

```sh
$ arcctl list accounts

$ acctl get account <account-name>

$ arcctl add account <account-name> --provider <provider-type>

$ arcctl remove account <account-name>
```
