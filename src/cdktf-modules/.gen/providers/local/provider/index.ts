// https://www.terraform.io/docs/providers/local
// generated from terraform resource schema

import { Construct } from 'constructs';
import * as cdktf from 'cdktf';

// Configuration

export interface LocalProviderConfig {
  /**
  * Alias name
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/local#alias LocalProvider#alias}
  */
  readonly alias?: string;
}

/**
* Represents a {@link https://www.terraform.io/docs/providers/local local}
*/
export class LocalProvider extends cdktf.TerraformProvider {

  // =================
  // STATIC PROPERTIES
  // =================
  public static readonly tfResourceType = "local";

  // ===========
  // INITIALIZER
  // ===========

  /**
  * Create a new {@link https://www.terraform.io/docs/providers/local local} Resource
  *
  * @param scope The scope in which to define this construct
  * @param id The scoped construct ID. Must be unique amongst siblings in the same scope
  * @param options LocalProviderConfig = {}
  */
  public constructor(scope: Construct, id: string, config: LocalProviderConfig = {}) {
    super(scope, id, {
      terraformResourceType: 'local',
      terraformGeneratorMetadata: {
        providerName: 'local',
        providerVersion: '2.4.0',
        providerVersionConstraint: '2.4.0'
      },
      terraformProviderSource: 'hashicorp/local'
    });
    this._alias = config.alias;
  }

  // ==========
  // ATTRIBUTES
  // ==========

  // alias - computed: false, optional: true, required: false
  private _alias?: string; 
  public get alias() {
    return this._alias;
  }
  public set alias(value: string | undefined) {
    this._alias = value;
  }
  public resetAlias() {
    this._alias = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get aliasInput() {
    return this._alias;
  }

  // =========
  // SYNTHESIS
  // =========

  protected synthesizeAttributes(): { [name: string]: any } {
    return {
      alias: cdktf.stringToTerraform(this._alias),
    };
  }
}
