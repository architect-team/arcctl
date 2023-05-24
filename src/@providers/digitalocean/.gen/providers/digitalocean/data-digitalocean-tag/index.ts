// https://www.terraform.io/docs/providers/digitalocean/d/tag
// generated from terraform resource schema

import { Construct } from 'npm:constructs';
import * as cdktf from 'npm:cdktf';

// Configuration

export interface DataDigitaloceanTagConfig
  extends cdktf.TerraformMetaArguments {
  /**
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/d/tag#id DataDigitaloceanTag#id}
   *
   * Please be aware that the id field is automatically added to all resources in Terraform providers using a Terraform provider SDK version below 2.
   * If you experience problems setting this value it might not be settable. Please take a look at the provider documentation to ensure it should be settable.
   */
  readonly id?: string;
  /**
   * name of the tag
   *
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/d/tag#name DataDigitaloceanTag#name}
   */
  readonly name: string;
}

/**
 * Represents a {@link https://www.terraform.io/docs/providers/digitalocean/d/tag digitalocean_tag}
 */
export class DataDigitaloceanTag extends cdktf.TerraformDataSource {
  // =================
  // STATIC PROPERTIES
  // =================
  public static readonly tfResourceType = 'digitalocean_tag';

  // ===========
  // INITIALIZER
  // ===========

  /**
   * Create a new {@link https://www.terraform.io/docs/providers/digitalocean/d/tag digitalocean_tag} Data Source
   *
   * @param scope The scope in which to define this construct
   * @param id The scoped construct ID. Must be unique amongst siblings in the same scope
   * @param options DataDigitaloceanTagConfig
   */
  public constructor(
    scope: Construct,
    id: string,
    config: DataDigitaloceanTagConfig,
  ) {
    super(scope, id, {
      terraformResourceType: 'digitalocean_tag',
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
  }

  // ==========
  // ATTRIBUTES
  // ==========

  // databases_count - computed: true, optional: false, required: false
  public get databasesCount() {
    return this.getNumberAttribute('databases_count');
  }

  // droplets_count - computed: true, optional: false, required: false
  public get dropletsCount() {
    return this.getNumberAttribute('droplets_count');
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

  // images_count - computed: true, optional: false, required: false
  public get imagesCount() {
    return this.getNumberAttribute('images_count');
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

  // total_resource_count - computed: true, optional: false, required: false
  public get totalResourceCount() {
    return this.getNumberAttribute('total_resource_count');
  }

  // volume_snapshots_count - computed: true, optional: false, required: false
  public get volumeSnapshotsCount() {
    return this.getNumberAttribute('volume_snapshots_count');
  }

  // volumes_count - computed: true, optional: false, required: false
  public get volumesCount() {
    return this.getNumberAttribute('volumes_count');
  }

  // =========
  // SYNTHESIS
  // =========

  protected synthesizeAttributes(): { [name: string]: any } {
    return {
      id: cdktf.stringToTerraform(this._id),
      name: cdktf.stringToTerraform(this._name),
    };
  }
}
