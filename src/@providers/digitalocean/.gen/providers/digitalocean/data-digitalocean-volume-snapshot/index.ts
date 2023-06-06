// https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/data-sources/volume_snapshot
// generated from terraform resource schema

import { Construct } from 'constructs';
import * as cdktf from 'cdktf';

// Configuration

export interface DataDigitaloceanVolumeSnapshotConfig extends cdktf.TerraformMetaArguments {
  /**
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/data-sources/volume_snapshot#id DataDigitaloceanVolumeSnapshot#id}
  *
  * Please be aware that the id field is automatically added to all resources in Terraform providers using a Terraform provider SDK version below 2.
  * If you experience problems setting this value it might not be settable. Please take a look at the provider documentation to ensure it should be settable.
  */
  readonly id?: string;
  /**
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/data-sources/volume_snapshot#most_recent DataDigitaloceanVolumeSnapshot#most_recent}
  */
  readonly mostRecent?: boolean | cdktf.IResolvable;
  /**
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/data-sources/volume_snapshot#name DataDigitaloceanVolumeSnapshot#name}
  */
  readonly name?: string;
  /**
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/data-sources/volume_snapshot#name_regex DataDigitaloceanVolumeSnapshot#name_regex}
  */
  readonly nameRegex?: string;
  /**
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/data-sources/volume_snapshot#region DataDigitaloceanVolumeSnapshot#region}
  */
  readonly region?: string;
}

/**
* Represents a {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/data-sources/volume_snapshot digitalocean_volume_snapshot}
*/
export class DataDigitaloceanVolumeSnapshot extends cdktf.TerraformDataSource {

  // =================
  // STATIC PROPERTIES
  // =================
  public static readonly tfResourceType = "digitalocean_volume_snapshot";

  // ===========
  // INITIALIZER
  // ===========

  /**
  * Create a new {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/data-sources/volume_snapshot digitalocean_volume_snapshot} Data Source
  *
  * @param scope The scope in which to define this construct
  * @param id The scoped construct ID. Must be unique amongst siblings in the same scope
  * @param options DataDigitaloceanVolumeSnapshotConfig = {}
  */
  public constructor(scope: Construct, id: string, config: DataDigitaloceanVolumeSnapshotConfig = {}) {
    super(scope, id, {
      terraformResourceType: 'digitalocean_volume_snapshot',
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
    this._id = config.id;
    this._mostRecent = config.mostRecent;
    this._name = config.name;
    this._nameRegex = config.nameRegex;
    this._region = config.region;
  }

  // ==========
  // ATTRIBUTES
  // ==========

  // created_at - computed: true, optional: false, required: false
  public get createdAt() {
    return this.getStringAttribute('created_at');
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

  // min_disk_size - computed: true, optional: false, required: false
  public get minDiskSize() {
    return this.getNumberAttribute('min_disk_size');
  }

  // most_recent - computed: false, optional: true, required: false
  private _mostRecent?: boolean | cdktf.IResolvable; 
  public get mostRecent() {
    return this.getBooleanAttribute('most_recent');
  }
  public set mostRecent(value: boolean | cdktf.IResolvable) {
    this._mostRecent = value;
  }
  public resetMostRecent() {
    this._mostRecent = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get mostRecentInput() {
    return this._mostRecent;
  }

  // name - computed: false, optional: true, required: false
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

  // name_regex - computed: false, optional: true, required: false
  private _nameRegex?: string; 
  public get nameRegex() {
    return this.getStringAttribute('name_regex');
  }
  public set nameRegex(value: string) {
    this._nameRegex = value;
  }
  public resetNameRegex() {
    this._nameRegex = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get nameRegexInput() {
    return this._nameRegex;
  }

  // region - computed: false, optional: true, required: false
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

  // regions - computed: true, optional: false, required: false
  public get regions() {
    return cdktf.Fn.tolist(this.getListAttribute('regions'));
  }

  // size - computed: true, optional: false, required: false
  public get size() {
    return this.getNumberAttribute('size');
  }

  // tags - computed: true, optional: false, required: false
  public get tags() {
    return cdktf.Fn.tolist(this.getListAttribute('tags'));
  }

  // volume_id - computed: true, optional: false, required: false
  public get volumeId() {
    return this.getStringAttribute('volume_id');
  }

  // =========
  // SYNTHESIS
  // =========

  protected synthesizeAttributes(): { [name: string]: any } {
    return {
      id: cdktf.stringToTerraform(this._id),
      most_recent: cdktf.booleanToTerraform(this._mostRecent),
      name: cdktf.stringToTerraform(this._name),
      name_regex: cdktf.stringToTerraform(this._nameRegex),
      region: cdktf.stringToTerraform(this._region),
    };
  }
}
