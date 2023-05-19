// https://www.terraform.io/docs/providers/digitalocean/r/volume
// generated from terraform resource schema

import { Construct } from 'constructs';
import * as cdktf from 'cdktf';

// Configuration

export interface VolumeConfig extends cdktf.TerraformMetaArguments {
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/volume#description Volume#description}
  */
  readonly description?: string;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/volume#filesystem_type Volume#filesystem_type}
  */
  readonly filesystemType?: string;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/volume#id Volume#id}
  *
  * Please be aware that the id field is automatically added to all resources in Terraform providers using a Terraform provider SDK version below 2.
  * If you experience problems setting this value it might not be settable. Please take a look at the provider documentation to ensure it should be settable.
  */
  readonly id?: string;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/volume#initial_filesystem_label Volume#initial_filesystem_label}
  */
  readonly initialFilesystemLabel?: string;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/volume#initial_filesystem_type Volume#initial_filesystem_type}
  */
  readonly initialFilesystemType?: string;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/volume#name Volume#name}
  */
  readonly name: string;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/volume#region Volume#region}
  */
  readonly region: string;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/volume#size Volume#size}
  */
  readonly size: number;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/volume#snapshot_id Volume#snapshot_id}
  */
  readonly snapshotId?: string;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/volume#tags Volume#tags}
  */
  readonly tags?: string[];
}

/**
* Represents a {@link https://www.terraform.io/docs/providers/digitalocean/r/volume digitalocean_volume}
*/
export class Volume extends cdktf.TerraformResource {

  // =================
  // STATIC PROPERTIES
  // =================
  public static readonly tfResourceType = "digitalocean_volume";

  // ===========
  // INITIALIZER
  // ===========

  /**
  * Create a new {@link https://www.terraform.io/docs/providers/digitalocean/r/volume digitalocean_volume} Resource
  *
  * @param scope The scope in which to define this construct
  * @param id The scoped construct ID. Must be unique amongst siblings in the same scope
  * @param options VolumeConfig
  */
  public constructor(scope: Construct, id: string, config: VolumeConfig) {
    super(scope, id, {
      terraformResourceType: 'digitalocean_volume',
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
    this._description = config.description;
    this._filesystemType = config.filesystemType;
    this._id = config.id;
    this._initialFilesystemLabel = config.initialFilesystemLabel;
    this._initialFilesystemType = config.initialFilesystemType;
    this._name = config.name;
    this._region = config.region;
    this._size = config.size;
    this._snapshotId = config.snapshotId;
    this._tags = config.tags;
  }

  // ==========
  // ATTRIBUTES
  // ==========

  // description - computed: false, optional: true, required: false
  private _description?: string; 
  public get description() {
    return this.getStringAttribute('description');
  }
  public set description(value: string) {
    this._description = value;
  }
  public resetDescription() {
    this._description = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get descriptionInput() {
    return this._description;
  }

  // droplet_ids - computed: true, optional: false, required: false
  public get dropletIds() {
    return cdktf.Token.asNumberList(cdktf.Fn.tolist(this.getNumberListAttribute('droplet_ids')));
  }

  // filesystem_label - computed: true, optional: false, required: false
  public get filesystemLabel() {
    return this.getStringAttribute('filesystem_label');
  }

  // filesystem_type - computed: true, optional: true, required: false
  private _filesystemType?: string; 
  public get filesystemType() {
    return this.getStringAttribute('filesystem_type');
  }
  public set filesystemType(value: string) {
    this._filesystemType = value;
  }
  public resetFilesystemType() {
    this._filesystemType = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get filesystemTypeInput() {
    return this._filesystemType;
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

  // initial_filesystem_label - computed: false, optional: true, required: false
  private _initialFilesystemLabel?: string; 
  public get initialFilesystemLabel() {
    return this.getStringAttribute('initial_filesystem_label');
  }
  public set initialFilesystemLabel(value: string) {
    this._initialFilesystemLabel = value;
  }
  public resetInitialFilesystemLabel() {
    this._initialFilesystemLabel = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get initialFilesystemLabelInput() {
    return this._initialFilesystemLabel;
  }

  // initial_filesystem_type - computed: false, optional: true, required: false
  private _initialFilesystemType?: string; 
  public get initialFilesystemType() {
    return this.getStringAttribute('initial_filesystem_type');
  }
  public set initialFilesystemType(value: string) {
    this._initialFilesystemType = value;
  }
  public resetInitialFilesystemType() {
    this._initialFilesystemType = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get initialFilesystemTypeInput() {
    return this._initialFilesystemType;
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

  // size - computed: false, optional: false, required: true
  private _size?: number; 
  public get size() {
    return this.getNumberAttribute('size');
  }
  public set size(value: number) {
    this._size = value;
  }
  // Temporarily expose input value. Use with caution.
  public get sizeInput() {
    return this._size;
  }

  // snapshot_id - computed: false, optional: true, required: false
  private _snapshotId?: string; 
  public get snapshotId() {
    return this.getStringAttribute('snapshot_id');
  }
  public set snapshotId(value: string) {
    this._snapshotId = value;
  }
  public resetSnapshotId() {
    this._snapshotId = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get snapshotIdInput() {
    return this._snapshotId;
  }

  // tags - computed: false, optional: true, required: false
  private _tags?: string[]; 
  public get tags() {
    return cdktf.Fn.tolist(this.getListAttribute('tags'));
  }
  public set tags(value: string[]) {
    this._tags = value;
  }
  public resetTags() {
    this._tags = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get tagsInput() {
    return this._tags;
  }

  // urn - computed: true, optional: false, required: false
  public get urn() {
    return this.getStringAttribute('urn');
  }

  // =========
  // SYNTHESIS
  // =========

  protected synthesizeAttributes(): { [name: string]: any } {
    return {
      description: cdktf.stringToTerraform(this._description),
      filesystem_type: cdktf.stringToTerraform(this._filesystemType),
      id: cdktf.stringToTerraform(this._id),
      initial_filesystem_label: cdktf.stringToTerraform(this._initialFilesystemLabel),
      initial_filesystem_type: cdktf.stringToTerraform(this._initialFilesystemType),
      name: cdktf.stringToTerraform(this._name),
      region: cdktf.stringToTerraform(this._region),
      size: cdktf.numberToTerraform(this._size),
      snapshot_id: cdktf.stringToTerraform(this._snapshotId),
      tags: cdktf.listMapper(cdktf.stringToTerraform, false)(this._tags),
    };
  }
}
