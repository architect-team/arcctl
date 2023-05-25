// https://www.terraform.io/docs/providers/digitalocean/d/droplet
// generated from terraform resource schema
import * as cdktf from 'cdktf';
import { Construct } from 'constructs';

// Configuration

export interface DataDigitaloceanDropletConfig
  extends cdktf.TerraformMetaArguments {
  /**
   * id of the Droplet
   *
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/d/droplet#id DataDigitaloceanDroplet#id}
   *
   * Please be aware that the id field is automatically added to all resources in Terraform providers using a Terraform provider SDK version below 2.
   * If you experience problems setting this value it might not be settable. Please take a look at the provider documentation to ensure it should be settable.
   */
  readonly id?: number;
  /**
   * name of the Droplet
   *
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/d/droplet#name DataDigitaloceanDroplet#name}
   */
  readonly name?: string;
  /**
   * unique tag of the Droplet
   *
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/d/droplet#tag DataDigitaloceanDroplet#tag}
   */
  readonly tag?: string;
}

/**
 * Represents a {@link https://www.terraform.io/docs/providers/digitalocean/d/droplet digitalocean_droplet}
 */
export class DataDigitaloceanDroplet extends cdktf.TerraformDataSource {
  // =================
  // STATIC PROPERTIES
  // =================
  public static readonly tfResourceType = 'digitalocean_droplet';

  // ===========
  // INITIALIZER
  // ===========

  /**
   * Create a new {@link https://www.terraform.io/docs/providers/digitalocean/d/droplet digitalocean_droplet} Data Source
   *
   * @param scope The scope in which to define this construct
   * @param id The scoped construct ID. Must be unique amongst siblings in the same scope
   * @param options DataDigitaloceanDropletConfig = {}
   */
  public constructor(
    scope: Construct,
    id: string,
    config: DataDigitaloceanDropletConfig = {},
  ) {
    super(scope, id, {
      terraformResourceType: 'digitalocean_droplet',
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
    this._tag = config.tag;
  }

  // ==========
  // ATTRIBUTES
  // ==========

  // backups - computed: true, optional: false, required: false
  public get backups() {
    return this.getBooleanAttribute('backups');
  }

  // created_at - computed: true, optional: false, required: false
  public get createdAt() {
    return this.getStringAttribute('created_at');
  }

  // disk - computed: true, optional: false, required: false
  public get disk() {
    return this.getNumberAttribute('disk');
  }

  // id - computed: true, optional: true, required: false
  private _id?: number;
  public get id() {
    return this.getNumberAttribute('id');
  }
  public set id(value: number) {
    this._id = value;
  }
  public resetId() {
    this._id = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get idInput() {
    return this._id;
  }

  // image - computed: true, optional: false, required: false
  public get image() {
    return this.getStringAttribute('image');
  }

  // ipv4_address - computed: true, optional: false, required: false
  public get ipv4Address() {
    return this.getStringAttribute('ipv4_address');
  }

  // ipv4_address_private - computed: true, optional: false, required: false
  public get ipv4AddressPrivate() {
    return this.getStringAttribute('ipv4_address_private');
  }

  // ipv6 - computed: true, optional: false, required: false
  public get ipv6() {
    return this.getBooleanAttribute('ipv6');
  }

  // ipv6_address - computed: true, optional: false, required: false
  public get ipv6Address() {
    return this.getStringAttribute('ipv6_address');
  }

  // ipv6_address_private - computed: true, optional: false, required: false
  public get ipv6AddressPrivate() {
    return this.getStringAttribute('ipv6_address_private');
  }

  // locked - computed: true, optional: false, required: false
  public get locked() {
    return this.getBooleanAttribute('locked');
  }

  // memory - computed: true, optional: false, required: false
  public get memory() {
    return this.getNumberAttribute('memory');
  }

  // monitoring - computed: true, optional: false, required: false
  public get monitoring() {
    return this.getBooleanAttribute('monitoring');
  }

  // name - computed: true, optional: true, required: false
  private _name?: string;
  public get name() {
    return this.getStringAttribute('name');
  }
  public set name(value: string) {
    this._name = value;
  }
  public resetName() {
    this._name = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get nameInput() {
    return this._name;
  }

  // price_hourly - computed: true, optional: false, required: false
  public get priceHourly() {
    return this.getNumberAttribute('price_hourly');
  }

  // price_monthly - computed: true, optional: false, required: false
  public get priceMonthly() {
    return this.getNumberAttribute('price_monthly');
  }

  // private_networking - computed: true, optional: false, required: false
  public get privateNetworking() {
    return this.getBooleanAttribute('private_networking');
  }

  // region - computed: true, optional: false, required: false
  public get region() {
    return this.getStringAttribute('region');
  }

  // size - computed: true, optional: false, required: false
  public get size() {
    return this.getStringAttribute('size');
  }

  // status - computed: true, optional: false, required: false
  public get status() {
    return this.getStringAttribute('status');
  }

  // tag - computed: false, optional: true, required: false
  private _tag?: string;
  public get tag() {
    return this.getStringAttribute('tag');
  }
  public set tag(value: string) {
    this._tag = value;
  }
  public resetTag() {
    this._tag = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get tagInput() {
    return this._tag;
  }

  // tags - computed: true, optional: false, required: false
  public get tags() {
    return cdktf.Fn.tolist(this.getListAttribute('tags'));
  }

  // urn - computed: true, optional: false, required: false
  public get urn() {
    return this.getStringAttribute('urn');
  }

  // vcpus - computed: true, optional: false, required: false
  public get vcpus() {
    return this.getNumberAttribute('vcpus');
  }

  // volume_ids - computed: true, optional: false, required: false
  public get volumeIds() {
    return cdktf.Fn.tolist(this.getListAttribute('volume_ids'));
  }

  // vpc_uuid - computed: true, optional: false, required: false
  public get vpcUuid() {
    return this.getStringAttribute('vpc_uuid');
  }

  // =========
  // SYNTHESIS
  // =========

  protected synthesizeAttributes(): { [name: string]: any } {
    return {
      id: cdktf.numberToTerraform(this._id),
      name: cdktf.stringToTerraform(this._name),
      tag: cdktf.stringToTerraform(this._tag),
    };
  }
}
