// https://www.terraform.io/docs/providers/template/r/file
// generated from terraform resource schema

import { Construct } from 'constructs';
import * as cdktf from 'cdktf';

// Configuration

export interface FileConfig extends cdktf.TerraformMetaArguments {
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/template/r/file#filename File#filename}
  */
  readonly filename?: string;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/template/r/file#id File#id}
  *
  * Please be aware that the id field is automatically added to all resources in Terraform providers using a Terraform provider SDK version below 2.
  * If you experience problems setting this value it might not be settable. Please take a look at the provider documentation to ensure it should be settable.
  */
  readonly id?: string;
  /**
  * Contents of the template
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/template/r/file#template File#template}
  */
  readonly template?: string;
  /**
  * variables to substitute
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/template/r/file#vars File#vars}
  */
  readonly vars?: { [key: string]: string };
}

/**
* Represents a {@link https://www.terraform.io/docs/providers/template/r/file template_file}
*/
export class File extends cdktf.TerraformResource {

  // =================
  // STATIC PROPERTIES
  // =================
  public static readonly tfResourceType = "template_file";

  // ===========
  // INITIALIZER
  // ===========

  /**
  * Create a new {@link https://www.terraform.io/docs/providers/template/r/file template_file} Resource
  *
  * @param scope The scope in which to define this construct
  * @param id The scoped construct ID. Must be unique amongst siblings in the same scope
  * @param options FileConfig = {}
  */
  public constructor(scope: Construct, id: string, config: FileConfig = {}) {
    super(scope, id, {
      terraformResourceType: 'template_file',
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
    this._filename = config.filename;
    this._id = config.id;
    this._template = config.template;
    this._vars = config.vars;
  }

  // ==========
  // ATTRIBUTES
  // ==========

  // filename - computed: false, optional: true, required: false
  private _filename?: string; 
  public get filename() {
    return this.getStringAttribute('filename');
  }
  public set filename(value: string) {
    this._filename = value;
  }
  public resetFilename() {
    this._filename = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get filenameInput() {
    return this._filename;
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

  // rendered - computed: true, optional: false, required: false
  public get rendered() {
    return this.getStringAttribute('rendered');
  }

  // template - computed: false, optional: true, required: false
  private _template?: string; 
  public get template() {
    return this.getStringAttribute('template');
  }
  public set template(value: string) {
    this._template = value;
  }
  public resetTemplate() {
    this._template = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get templateInput() {
    return this._template;
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
      filename: cdktf.stringToTerraform(this._filename),
      id: cdktf.stringToTerraform(this._id),
      template: cdktf.stringToTerraform(this._template),
      vars: cdktf.hashMapper(cdktf.stringToTerraform)(this._vars),
    };
  }
}
