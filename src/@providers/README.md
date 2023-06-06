# cldctl providers

Providers are cldctl plugins that can list, get, create, update, and/or delete the [resources](../%40resources/) supported by cldctl. Developers can register the credentials for one or more provider with cldctl in order to let the plugin help them create cloud resources more easily.

For anyone familiar with Terraform the concept is almost the same, but cldctl providers MUST conform to the input/output expectations of cldctl resources and cannot define their own resources. This helps the framework better serve the needs of developers by letting them focus on their applications instead of their infrastructure.

## Using providers

Since providers have to conform to the [resource](../%40resources/) definitions available, there really isn't much to learn about a provider except how to authenticate with it. Once you've provided your credentials for the provider, you'll be able to work with any of the resources it supports the same way you would with any other provider: through common commands like `list`, `get`, `create`, `update`, and `delete`.

### Authenticating

Each provider uses different processes to issue credentials used by applications like cldctl. The CLI will prompt you for the required values, like API keys or username/password combos, but you'll have to refer to each specific provider to learn how to acquire the values:

```sh
$ cldctl add credentials
```

## Currently supported providers

- [x] [DigitalOcean](./digitalocean/)
- [x] [AWS](./aws/)
- [x] [Kubernetes](./kubernetes/)
- [ ] Google Cloud
- [ ] Azure
- [ ] Cloudflare
- [ ] Google Domains

Don't see your preferred cloud provider? Go ahead and [file a request](https://github.com/architect-team/cldctl/issues/new/choose) for the provider. We also welcome contributions, so keep scrolling to learn about provider creation:

## Creating a provider

Creating a providers can vary in difficulty, but the guts of a provider is based on one, simple class that describes which resources the provider supports and how it can interact with those resources:

```typescript
export class MyProvider extends Provider {
  /**
   * A unique name for the provider
   */
  abstract readonly type: string;

  /**
   * The schema of the credentials used to authenticate with the provider. Uses
   * JSON schema and the AJV package
   *
   * @see https://ajv.js.org/
   */
  static readonly CredentialsSchema = MyCredentialsSchema;

  /**
   * A set of resource types that this provider can interact with, and the
   * methods it supports
   */
  abstract readonly resources = {
    /**
     * The keys are names of cldctl resources that this provider supports
     */
    vpc: new MyVpcService(this.credentials),
  };
}
```

### Services

Services are a sub-resourcs of the provider framework that define how the provider interacts
with a specific resource type. Services can `list`, `get`, and `manage` the associated resources.

```ts
export class MyVpcService extends ResourceService<'vpc'> {
  async get(id: string): Promise<ResourceOutputs['vpc']> {
    const {
      data: { vpc },
    } = await this.client.vpc.getVpc({ vpc_id: id });
    return vpc;
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['vpc']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['vpc']>> {
    const {
      data: { vpcs },
    } = await this.client.vpc.listVpcs({});
    const regionVpcs = filterOptions?.region
      ? vpcs.filter((vpc) => {
        return vpc.region === filterOptions.region;
      })
      : vpcs;
    return {
      total: regionVpcs.length,
      rows: regionVpcs.map((vpc) => this.normalizeVpc(vpc)),
    };
  }

  manage = {
    validators: {
      name: (input: string) => {
        return (
          /^[\d.A-Za-z-]+$/.test(input) ||
          'Must be unique and contain alphanumeric characters, dashes, and periods only.'
        );
      },

      description: (input?: string) => {
        return (
          !input ||
          input.length <= 255 ||
          'Description must be less than 255 characters.'
        );
      },
    },

    presets: [
      // TODO
    ],

    module: MyVpcModule,
  };
}
```

### Modules

Modules are the last building block of the provider framework and dictate how the resource would be provisioned. Modules are a thin wrapper around [CDK for Terraform](https://developer.hashicorp.com/terraform/cdktf). You can use all the features of `cdktf`, and the only requirement is that you conform to the input/output spec of the resource type in the associated service:

```typescript
export class MyVpcModule extends ResourceModule<'vpc'> {
  outputs: ResourceOutputs['vpc'];

  constructor(scope: Construct, id: string, inputs: ResourceInputs['vpc']) {
    super(scope, id, inputs);

    const vpc = new MyVpc(this, 'vpc', {
      description: inputs.description,
      name: inputs.name,
      region: inputs.region,
    });

    this.outputs = {
      id: vpc.id,
      name: vpc.name,
      description: vpc.description,
      region: vpc.region,
      type: 'vpc',
    };
  }
}
```
