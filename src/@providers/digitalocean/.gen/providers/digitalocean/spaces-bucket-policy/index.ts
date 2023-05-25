// https://www.terraform.io/docs/providers/digitalocean/r/spaces_bucket_policy
// generated from terraform resource schema
import * as cdktf from 'cdktf';
import { Construct } from 'constructs';

// Configuration

export interface SpacesBucketPolicyConfig extends cdktf.TerraformMetaArguments {
  /**
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/spaces_bucket_policy#bucket SpacesBucketPolicy#bucket}
   */
  readonly bucket: string;
  /**
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/spaces_bucket_policy#id SpacesBucketPolicy#id}
   *
   * Please be aware that the id field is automatically added to all resources in Terraform providers using a Terraform provider SDK version below 2.
   * If you experience problems setting this value it might not be settable. Please take a look at the provider documentation to ensure it should be settable.
   */
  readonly id?: string;
  /**
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/spaces_bucket_policy#policy SpacesBucketPolicy#policy}
   */
  readonly policy: string;
  /**
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/spaces_bucket_policy#region SpacesBucketPolicy#region}
   */
  readonly region: string;
}

/**
 * Represents a {@link https://www.terraform.io/docs/providers/digitalocean/r/spaces_bucket_policy digitalocean_spaces_bucket_policy}
 */
export class SpacesBucketPolicy extends cdktf.TerraformResource {
  // =================
  // STATIC PROPERTIES
  // =================
  public static readonly tfResourceType = 'digitalocean_spaces_bucket_policy';

  // ===========
  // INITIALIZER
  // ===========

  /**
   * Create a new {@link https://www.terraform.io/docs/providers/digitalocean/r/spaces_bucket_policy digitalocean_spaces_bucket_policy} Resource
   *
   * @param scope The scope in which to define this construct
   * @param id The scoped construct ID. Must be unique amongst siblings in the same scope
   * @param options SpacesBucketPolicyConfig
   */
  public constructor(
    scope: Construct,
    id: string,
    config: SpacesBucketPolicyConfig,
  ) {
    super(scope, id, {
      terraformResourceType: 'digitalocean_spaces_bucket_policy',
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
    this._bucket = config.bucket;
    this._id = config.id;
    this._policy = config.policy;
    this._region = config.region;
  }

  // ==========
  // ATTRIBUTES
  // ==========

  // bucket - computed: false, optional: false, required: true
  private _bucket?: string;
  public get bucket() {
    return this.getStringAttribute('bucket');
  }
  public set bucket(value: string) {
    this._bucket = value;
  }
  // Temporarily expose input value. Use with caution.
  public get bucketInput() {
    return this._bucket;
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

  // policy - computed: false, optional: false, required: true
  private _policy?: string;
  public get policy() {
    return this.getStringAttribute('policy');
  }
  public set policy(value: string) {
    this._policy = value;
  }
  // Temporarily expose input value. Use with caution.
  public get policyInput() {
    return this._policy;
  }

  // region - computed: false, optional: false, required: true
  private _region?: string;
  public get region() {
    return this.getStringAttribute('region');
  }
  public set region(value: string) {
    this._region = value;
  }
  // Temporarily expose input value. Use with caution.
  public get regionInput() {
    return this._region;
  }

  // =========
  // SYNTHESIS
  // =========

  protected synthesizeAttributes(): { [name: string]: any } {
    return {
      bucket: cdktf.stringToTerraform(this._bucket),
      id: cdktf.stringToTerraform(this._id),
      policy: cdktf.stringToTerraform(this._policy),
      region: cdktf.stringToTerraform(this._region),
    };
  }
}
