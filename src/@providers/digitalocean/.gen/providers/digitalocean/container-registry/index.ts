// https://www.terraform.io/docs/providers/digitalocean/r/container_registry
// generated from terraform resource schema
import * as cdktf from 'cdktf';
import { Construct } from 'constructs';

// Configuration

export interface ContainerRegistryConfig extends cdktf.TerraformMetaArguments {
  /**
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/container_registry#id ContainerRegistry#id}
   *
   * Please be aware that the id field is automatically added to all resources in Terraform providers using a Terraform provider SDK version below 2.
   * If you experience problems setting this value it might not be settable. Please take a look at the provider documentation to ensure it should be settable.
   */
  readonly id?: string;
  /**
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/container_registry#name ContainerRegistry#name}
   */
  readonly name: string;
  /**
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/container_registry#region ContainerRegistry#region}
   */
  readonly region?: string;
  /**
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/container_registry#subscription_tier_slug ContainerRegistry#subscription_tier_slug}
   */
  readonly subscriptionTierSlug: string;
}

/**
 * Represents a {@link https://www.terraform.io/docs/providers/digitalocean/r/container_registry digitalocean_container_registry}
 */
export class ContainerRegistry extends cdktf.TerraformResource {
  // =================
  // STATIC PROPERTIES
  // =================
  public static readonly tfResourceType = 'digitalocean_container_registry';

  // ===========
  // INITIALIZER
  // ===========

  /**
   * Create a new {@link https://www.terraform.io/docs/providers/digitalocean/r/container_registry digitalocean_container_registry} Resource
   *
   * @param scope The scope in which to define this construct
   * @param id The scoped construct ID. Must be unique amongst siblings in the same scope
   * @param options ContainerRegistryConfig
   */
  public constructor(
    scope: Construct,
    id: string,
    config: ContainerRegistryConfig,
  ) {
    super(scope, id, {
      terraformResourceType: 'digitalocean_container_registry',
      terraformGeneratorMetadata: {
        providerName: 'digitalocean',
        providerVersion: '2.26.0',
        providerVersionConstraint: '2.26.0',
      },
      provider: config.provider,
      dependsOn: config.dependsOn,
      count: config.count,
      lifecycle: config.lifecycle,
      provisioners: config.provisioners,
      connection: config.connection,
      forEach: config.forEach,
    });
    this._id = config.id;
    this._name = config.name;
    this._region = config.region;
    this._subscriptionTierSlug = config.subscriptionTierSlug;
  }

  // ==========
  // ATTRIBUTES
  // ==========

  // created_at - computed: true, optional: false, required: false
  public get createdAt() {
    return this.getStringAttribute('created_at');
  }

  // endpoint - computed: true, optional: false, required: false
  public get endpoint() {
    return this.getStringAttribute('endpoint');
  }

  // id - computed: true, optional: true, required: false
  private _id?: string;
  public get id() {
    return this.getStringAttribute('id');
  }
  public set id(value: string) {
    this._id = value;
  }
  public resetId() {
    this._id = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get idInput() {
    return this._id;
  }

  // name - computed: false, optional: false, required: true
  private _name?: string;
  public get name() {
    return this.getStringAttribute('name');
  }
  public set name(value: string) {
    this._name = value;
  }
  // Temporarily expose input value. Use with caution.
  public get nameInput() {
    return this._name;
  }

  // region - computed: true, optional: true, required: false
  private _region?: string;
  public get region() {
    return this.getStringAttribute('region');
  }
  public set region(value: string) {
    this._region = value;
  }
  public resetRegion() {
    this._region = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get regionInput() {
    return this._region;
  }

  // server_url - computed: true, optional: false, required: false
  public get serverUrl() {
    return this.getStringAttribute('server_url');
  }

  // storage_usage_bytes - computed: true, optional: false, required: false
  public get storageUsageBytes() {
    return this.getNumberAttribute('storage_usage_bytes');
  }

  // subscription_tier_slug - computed: false, optional: false, required: true
  private _subscriptionTierSlug?: string;
  public get subscriptionTierSlug() {
    return this.getStringAttribute('subscription_tier_slug');
  }
  public set subscriptionTierSlug(value: string) {
    this._subscriptionTierSlug = value;
  }
  // Temporarily expose input value. Use with caution.
  public get subscriptionTierSlugInput() {
    return this._subscriptionTierSlug;
  }

  // =========
  // SYNTHESIS
  // =========

  protected synthesizeAttributes(): { [name: string]: any } {
    return {
      id: cdktf.stringToTerraform(this._id),
      name: cdktf.stringToTerraform(this._name),
      region: cdktf.stringToTerraform(this._region),
      subscription_tier_slug: cdktf.stringToTerraform(
        this._subscriptionTierSlug,
      ),
    };
  }
}
