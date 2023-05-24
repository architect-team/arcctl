// https://www.terraform.io/docs/providers/digitalocean/d/ssh_key
// generated from terraform resource schema

import { Construct } from 'npm:constructs';
import * as cdktf from 'npm:cdktf';

// Configuration

export interface DataDigitaloceanSshKeyConfig
  extends cdktf.TerraformMetaArguments {
  /**
   * name of the ssh key
   *
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/d/ssh_key#name DataDigitaloceanSshKey#name}
   */
  readonly name: string;
}

/**
 * Represents a {@link https://www.terraform.io/docs/providers/digitalocean/d/ssh_key digitalocean_ssh_key}
 */
export class DataDigitaloceanSshKey extends cdktf.TerraformDataSource {
  // =================
  // STATIC PROPERTIES
  // =================
  public static readonly tfResourceType = 'digitalocean_ssh_key';

  // ===========
  // INITIALIZER
  // ===========

  /**
   * Create a new {@link https://www.terraform.io/docs/providers/digitalocean/d/ssh_key digitalocean_ssh_key} Data Source
   *
   * @param scope The scope in which to define this construct
   * @param id The scoped construct ID. Must be unique amongst siblings in the same scope
   * @param options DataDigitaloceanSshKeyConfig
   */
  public constructor(
    scope: Construct,
    id: string,
    config: DataDigitaloceanSshKeyConfig,
  ) {
    super(scope, id, {
      terraformResourceType: 'digitalocean_ssh_key',
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
    this._name = config.name;
  }

  // ==========
  // ATTRIBUTES
  // ==========

  // fingerprint - computed: true, optional: false, required: false
  public get fingerprint() {
    return this.getStringAttribute('fingerprint');
  }

  // id - computed: true, optional: false, required: false
  public get id() {
    return this.getNumberAttribute('id');
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

  // public_key - computed: true, optional: false, required: false
  public get publicKey() {
    return this.getStringAttribute('public_key');
  }

  // =========
  // SYNTHESIS
  // =========

  protected synthesizeAttributes(): { [name: string]: any } {
    return {
      name: cdktf.stringToTerraform(this._name),
    };
  }
}
