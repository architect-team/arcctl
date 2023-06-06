// https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/volume_attachment
// generated from terraform resource schema

import { Construct } from 'constructs';
import * as cdktf from 'cdktf';

// Configuration

export interface VolumeAttachmentConfig extends cdktf.TerraformMetaArguments {
  /**
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/volume_attachment#droplet_id VolumeAttachment#droplet_id}
  */
  readonly dropletId: number;
  /**
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/volume_attachment#id VolumeAttachment#id}
  *
  * Please be aware that the id field is automatically added to all resources in Terraform providers using a Terraform provider SDK version below 2.
  * If you experience problems setting this value it might not be settable. Please take a look at the provider documentation to ensure it should be settable.
  */
  readonly id?: string;
  /**
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/volume_attachment#volume_id VolumeAttachment#volume_id}
  */
  readonly volumeId: string;
}

/**
* Represents a {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/volume_attachment digitalocean_volume_attachment}
*/
export class VolumeAttachment extends cdktf.TerraformResource {

  // =================
  // STATIC PROPERTIES
  // =================
  public static readonly tfResourceType = "digitalocean_volume_attachment";

  // ===========
  // INITIALIZER
  // ===========

  /**
  * Create a new {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/volume_attachment digitalocean_volume_attachment} Resource
  *
  * @param scope The scope in which to define this construct
  * @param id The scoped construct ID. Must be unique amongst siblings in the same scope
  * @param options VolumeAttachmentConfig
  */
  public constructor(scope: Construct, id: string, config: VolumeAttachmentConfig) {
    super(scope, id, {
      terraformResourceType: 'digitalocean_volume_attachment',
      terraformGeneratorMetadata: {
        providerName: 'digitalocean',
        providerVersion: '2.28.1',
        providerVersionConstraint: '2.28.1'
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
    this._volumeId = config.volumeId;
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

  // volume_id - computed: false, optional: false, required: true
  private _volumeId?: string; 
  public get volumeId() {
    return this.getStringAttribute('volume_id');
  }
  public set volumeId(value: string) {
    this._volumeId = value;
  }
  // Temporarily expose input value. Use with caution.
  public get volumeIdInput() {
    return this._volumeId;
  }

  // =========
  // SYNTHESIS
  // =========

  protected synthesizeAttributes(): { [name: string]: any } {
    return {
      droplet_id: cdktf.numberToTerraform(this._dropletId),
      id: cdktf.stringToTerraform(this._id),
      volume_id: cdktf.stringToTerraform(this._volumeId),
    };
  }
}
