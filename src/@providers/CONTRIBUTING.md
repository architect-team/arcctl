# Provider contribution guidelines

There are hundreds of unique cloud providers in the world that arcctl can interface with, but we need your help to integrate with them all. We've put a lot of thought into the creation process for providers to make it as easy as possible for developers to contribute to our growing set of plugins.

## Creating a provider

Creating a providers can vary in difficulty, but the guts of a provider is based on one, simple class that describes which resources the provider supports and how it can interact with those resources:

```typescript
export class MyProvider extends Provider {
  /**
   * A unique name for the provider
   */
  readonly type: string = 'digitalocean';

  /**
   * The schema of the credentials used to authenticate with the provider. Uses
   * JSON schema and the AJV package
   *
   * @see https://ajv.js.org/
   */
  static readonly CredentialsSchema = {
    type: 'object',
    properties: {
      token: {
        type: 'string',
        description: '',
      },
    },
    required: ['Digitalocean API token'],
    additionalProperties: false,
  };

  /**
   * A set of resource types that this provider can interact with, and the
   * methods it supports
   */
  readonly resources = {
    /**
     * The keys are names of cldctl resources that this provider supports
     */
    vpc: new MyVpcService(this.credentials),
  };

  /**
   * A method used to validate the credentials associated with the account
   */
  public async testCredentials(): Promise<boolean> {
    try {
      const dots = createApiClient({ token: this.credentials.token });
      await dots.account.getAccount();
    } catch {
      return false;
    }
    return true;
  }
}
```

## Services

Services are a sub-resourcs of the provider framework that define how the provider interacts
with a specific resource type.

### Read-only services

Some resource types, like [regions](../%40resources/region/) or [database sizes](../%40resources/databaseSize/), aren't able to be "created" by end users. They are controlled by the cloud provider themselves.

However, the ability to query the available options is extremely helpful for form filling and input validation when creating related resource types. For that reason it can be handy for providers to
define read-only services to support the `get` and `list` functions for the resource type:

```ts
export class MyRegionService extends ResourceService<'region', MyProviderCredentials> {
  async get(id: string): Promise<ResourceOutputs['region'] | undefined> {
    const {
      data: { region },
    } = await this.client.region.getRegion({ region_id: id });
    return region;
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['region']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['region']>> {
    const {
      data: { regions },
    } = await this.client.region.listRegions({});
    return {
      total: regions.length,
      rows: regions.map((region) => this.normalizeRegion(region)),
    };
  }
}
```

### CRUD services

CRUD resource services define simple `create`, `update`, and `delete` methods to mirror common REST
API behavior. This provides a very intuitive experience for provider authors who are used to wiring
together API calls.

```typescript
export class MyVpcService extends CrudResourceService<'vpc', MyProviderCredentials> {
  async get(id: string) {
    // ...
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['vpc']>,
    pagingOptions?: Partial<PagingOptions>,
  ) {
    // ...
  }

  create(
    subscriber: Subscriber<string>,
    inputs: ResourceInputs['vpc'],
  ): Promise<ResourceOutputs['vpc']> {
    // - Create new resource from inputs and return output values
    // - Throw errors where necessary
    // - Use subscriber.next('...') to share status updates with end-users
  }

  update(
    subscriber: Subscriber<string>,
    id: string,
    inputs: DeepPartial<ResourceInputs['vpc']>,
  ): Promise<ResourceOutputs['vpc']> {
    // - Update existing resource matching the ID with new input values
    // - Throw errors where necessary
    // - Use subscriber.next('...') to share status updates with end-users
  }

  delete(subscriber: Subscriber<string>, id: string): Promise<void> {
    // - Delete an existing resource matching the ID
    // - Throw errors where necessary
    // - Use subscriber.next('...') to share status updates with end-users
  }
}
```

### Terraform services

Crud services are great for simple cloud operations that require only one or two API calls, but for more complex resources it can become tedious and error prone. To make this easier, arcctl services can leverage Terraform instead of defining individual `create`, `update`, and `delete` methods. The most important part of this service is the `construct` field which references a [CDK module (learn more)](#cdk-modules).

```typescript
export class MyService extends TerraformResourceService<'vpc', MyProviderCredentials> {
  /**
   * Version of terraform this service expects
   */
  readonly terraform_version = '1.4.5';

  /**
   * CDK Module to use for the service. See below for details.
   */
  readonly construct = MyServiceModule;

  // ---
  // Still needs the get and list functions for read flows
  // ---

  async get(id: string) {
    // ...
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['vpc']>,
    pagingOptions?: Partial<PagingOptions>,
  ) {
    // ...
  }
}
```

#### CDK Modules

Modules contain all the resource creation logic for Terraform services. Modules are a thin wrapper around [CDK for Terraform](https://developer.hashicorp.com/terraform/cdktf). You can use all the features of `cdktf`, and the only requirement is that you conform to the input/output spec of the resource type in the associated service:

```typescript
export class MyVpcModule extends ResourceModule<'vpc', MyProviderCredentials> {
  outputs: ResourceOutputs['vpc'];

  /**
   * Behaves just like a CDK module. Use the constructor to define what
   * infrastructure and resources to create.
   */
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

  /**
   * In order to power update/deletion of terraform resources, we need a way to
   * recover state. This method allows you to return a dictionary of terraform
   * resource IDs and the associated cloud resource IDs that match. You can freely
   * make HTTP calls to retrieve sub-resources.
   */
  genImports(
    resourceId: string,
    credentials: MyProviderCredentials,
  ): Promise<Record<string, string>> {
    return Promise.resolve({
      [this.getResourceRef(this.cluster)]: resourceId,
    });
  }
}
```
