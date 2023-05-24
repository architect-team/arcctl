// https://www.terraform.io/docs/providers/digitalocean/r/floating_ip_assignment
// generated from terraform resource schema

import { Construct } from 'npm:constructs';
import * as cdktf from 'cdktf';

// Configuration

export interface FloatingIpAssignmentConfig extends cdktf.TerraformMetaArguments {
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/floating_ip_assignment#droplet_id FloatingIpAssignment#droplet_id}
  */
  readonly dropletId: number;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/floating_ip_assignment#id FloatingIpAssignment#id}
  *
  * Please be aware that the id field is automatically added to all resources in Terraform providers using a Terraform provider SDK version below 2.
  * If you experience problems setting this value it might not be settable. Please take a look at the provider documentation to ensure it should be settable.
  */
  readonly id?: string;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/floating_ip_assignment#ip_address FloatingIpAssignment#ip_address}
  */
  readonly ipAddress: string;
}

/**
* Represents a {@link https://www.terraform.io/docs/providers/digitalocean/r/floating_ip_assignment digitalocean_floating_ip_assignment}
*/
export class FloatingIpAssignment extends cdktf.TerraformResource {

  // =================
  // STATIC PROPERTIES
  // =================
  public static readonly tfResourceType = "digitalocean_floating_ip_assignment";

  // ===========
  // INITIALIZER
  // ===========

  /**
  * Create a new {@link https://www.terraform.io/docs/providers/digitalocean/r/floating_ip_assignment digitalocean_floating_ip_assignment} Resource
  *
  * @param scope The scope in which to define this construct
  * @param id The scoped construct ID. Must be unique amongst siblings in the same scope
  * @param options FloatingIpAssignmentConfig
  */
  public constructor(scope: Construct, id: string, config: FloatingIpAssignmentConfig) {
    super(scope, id, {
      terraformResourceType: 'digitalocean_floating_ip_assignment',
      terraformGeneratorMetadata: {
        providerName: 'digitalocean',
        providerVersion: '2.26.0',
        providerVersionConstraint: '2.26.0'
      },
      provider: config.provider,
      dependsOn: config.dependsOn,
      count: config.count,
      lifecycle: config.lifecycle,
      provisioners: config.provisioners,
      connection: config.connection,
      forEach: config.forEach
    });
    this._dropletId = config.dropletId;
    this._id = config.id;
    this._ipAddress = config.ipAddress;
  }

  // ==========
  // ATTRIBUTES
  // ==========

  // droplet_id - computed: false, optional: false, required: true
  private _dropletId?: number;
  public get dropletId() {
    return this.getNumberAttribute('droplet_id');
  }
  public set dropletId(value: number) {
    this._dropletId = value;
  }
  // Temporarily expose input value. Use with caution.
  public get dropletIdInput() {
    return this._dropletId;
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

  // ip_address - computed: false, optional: false, required: true
  private _ipAddress?: string;
  public get ipAddress() {
    return this.getStringAttribute('ip_address');
  }
  public set ipAddress(value: string) {
    this._ipAddress = value;
  }
  // Temporarily expose input value. Use with caution.
  public get ipAddressInput() {
    return this._ipAddress;
  }

  // =========
  // SYNTHESIS
  // =========

  protected synthesizeAttributes(): { [name: string]: any } {
    return {
      droplet_id: cdktf.numberToTerraform(this._dropletId),
      id: cdktf.stringToTerraform(this._id),
      ip_address: cdktf.stringToTerraform(this._ipAddress),
    };
  }
}
