// https://www.terraform.io/docs/providers/template/r/dir
// generated from terraform resource schema

import { Construct } from 'constructs';
import * as cdktf from 'cdktf';

// Configuration

export interface DirConfig extends cdktf.TerraformMetaArguments {
  /**
  * Path to the directory where the templated files will be written
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/template/r/dir#destination_dir Dir#destination_dir}
  */
  readonly destinationDir: string;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/template/r/dir#id Dir#id}
  *
  * Please be aware that the id field is automatically added to all resources in Terraform providers using a Terraform provider SDK version below 2.
  * If you experience problems setting this value it might not be settable. Please take a look at the provider documentation to ensure it should be settable.
  */
  readonly id?: string;
  /**
  * Path to the directory where the files to template reside
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/template/r/dir#source_dir Dir#source_dir}
  */
  readonly sourceDir: string;
  /**
  * Variables to substitute
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/template/r/dir#vars Dir#vars}
  */
  readonly vars?: { [key: string]: string };
}

/**
* Represents a {@link https://www.terraform.io/docs/providers/template/r/dir template_dir}
*/
export class Dir extends cdktf.TerraformResource {

  // =================
  // STATIC PROPERTIES
  // =================
  public static readonly tfResourceType = "template_dir";

  // ===========
  // INITIALIZER
  // ===========

  /**
  * Create a new {@link https://www.terraform.io/docs/providers/template/r/dir template_dir} Resource
  *
  * @param scope The scope in which to define this construct
  * @param id The scoped construct ID. Must be unique amongst siblings in the same scope
  * @param options DirConfig
  */
  public constructor(scope: Construct, id: string, config: DirConfig) {
    super(scope, id, {
      terraformResourceType: 'template_dir',
      terraformGeneratorMetadata: {
        providerName: 'template',
        providerVersion: '2.2.0',
        providerVersionConstraint: '2.2.0'
      },
      provider: config.provider,
      dependsOn: config.dependsOn,
      count: config.count,
      lifecycle: config.lifecycle,
      provisioners: config.provisioners,
      connection: config.connection,
      forEach: config.forEach
    });
    this._destinationDir = config.destinationDir;
    this._id = config.id;
    this._sourceDir = config.sourceDir;
    this._vars = config.vars;
  }

  // ==========
  // ATTRIBUTES
  // ==========

  // destination_dir - computed: false, optional: false, required: true
  private _destinationDir?: string; 
  public get destinationDir() {
    return this.getStringAttribute('destination_dir');
  }
  public set destinationDir(value: string) {
    this._destinationDir = value;
  }
  // Temporarily expose input value. Use with caution.
  public get destinationDirInput() {
    return this._destinationDir;
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

  // source_dir - computed: false, optional: false, required: true
  private _sourceDir?: string; 
  public get sourceDir() {
    return this.getStringAttribute('source_dir');
  }
  public set sourceDir(value: string) {
    this._sourceDir = value;
  }
  // Temporarily expose input value. Use with caution.
  public get sourceDirInput() {
    return this._sourceDir;
  }

  // vars - computed: false, optional: true, required: false
  private _vars?: { [key: string]: string }; 
  public get vars() {
    return this.getStringMapAttribute('vars');
  }
  public set vars(value: { [key: string]: string }) {
    this._vars = value;
  }
  public resetVars() {
    this._vars = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get varsInput() {
    return this._vars;
  }

  // =========
  // SYNTHESIS
  // =========

  protected synthesizeAttributes(): { [name: string]: any } {
    return {
      destination_dir: cdktf.stringToTerraform(this._destinationDir),
      id: cdktf.stringToTerraform(this._id),
      source_dir: cdktf.stringToTerraform(this._sourceDir),
      vars: cdktf.hashMapper(cdktf.stringToTerraform)(this._vars),
    };
  }
}
