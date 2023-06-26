# cldctl providers

Providers are arcctl plugins that can list, get, create, update, and/or delete the [resources](../%40resources/) supported by arcctl. Developers can register their cloud provider "accounts" with
arcctl in order to let the provider help them create cloud [resources](../%40resources/) more easily.

For anyone familiar with Terraform the concept is almost the same, but arcctl providers MUST conform to the input/output expectations of arcctl resources and cannot define their own resources. This helps the framework better serve the needs of developers by letting them focus on their applications instead of their infrastructure.

## Using providers

Since providers have to conform to the [resource](../%40resources/) definitions available, there really isn't much to learn about a provider except how to authenticate with it. Once you've registered an account with the provider, you'll be able to work with any of the resources it supports the same way you would with any other provider: through common commands like `list`, `get`, `create`, `update`, and `delete`.

## Registering accounts

Each provider uses different processes to issue credentials used by applications like arcctl. The CLI will prompt you for the required values, like API keys or username/password combos, but you'll have to refer to each specific provider to learn how to acquire the values.

```sh
$ arcctl add account <account-name> --provider <provider-name>
```

The command above will prompt you for credentials for `<provider-name>` and then register them as an account called `<account-name>` both the account and provider name are optional and you'll be prompted for them if you prefer to just run `arcctl add account`.

## Currently supported providers

- [x] [DigitalOcean](./digitalocean/)
- [x] [AWS](./aws/)
- [x] [Kubernetes](./kubernetes/)
- [x] [Docker](./docker/)
- [x] [local](./local/)
- [x] [postgres](./postgres/)
- [x] [traefik](./traefik/)

Don't see your preferred cloud provider? Go ahead and [file a request](https://github.com/architect-team/arcctl/issues/new?assignees=&labels=enhancement&projects=&template=feature_request.md&title=) for the provider.

Want to contribute a provider so that you and others can more easily interact with your favorite cloud providers? Check out the [provider contributing](./CONTRIBUTING.md) guidelines to learn more about authoring new providers.
