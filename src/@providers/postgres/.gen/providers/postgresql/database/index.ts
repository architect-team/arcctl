// https://www.terraform.io/docs/providers/postgresql/r/database
// generated from terraform resource schema

import { Construct } from 'constructs';
import * as cdktf from 'cdktf';

// Configuration

export interface DatabaseConfig extends cdktf.TerraformMetaArguments {
  /**
  * If false then no one can connect to this database
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql/r/database#allow_connections Database#allow_connections}
  */
  readonly allowConnections?: boolean | cdktf.IResolvable;
  /**
  * How many concurrent connections can be made to this database
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql/r/database#connection_limit Database#connection_limit}
  */
  readonly connectionLimit?: number;
  /**
  * Character set encoding to use in the new database
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql/r/database#encoding Database#encoding}
  */
  readonly encoding?: string;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql/r/database#id Database#id}
  *
  * Please be aware that the id field is automatically added to all resources in Terraform providers using a Terraform provider SDK version below 2.
  * If you experience problems setting this value it might not be settable. Please take a look at the provider documentation to ensure it should be settable.
  */
  readonly id?: string;
  /**
  * If true, then this database can be cloned by any user with CREATEDB privileges
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql/r/database#is_template Database#is_template}
  */
  readonly isTemplate?: boolean | cdktf.IResolvable;
  /**
  * Collation order (LC_COLLATE) to use in the new database
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql/r/database#lc_collate Database#lc_collate}
  */
  readonly lcCollate?: string;
  /**
  * Character classification (LC_CTYPE) to use in the new database
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql/r/database#lc_ctype Database#lc_ctype}
  */
  readonly lcCtype?: string;
  /**
  * The PostgreSQL database name to connect to
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql/r/database#name Database#name}
  */
  readonly name: string;
  /**
  * The ROLE which owns the database
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql/r/database#owner Database#owner}
  */
  readonly owner?: string;
  /**
  * The name of the tablespace that will be associated with the new database
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql/r/database#tablespace_name Database#tablespace_name}
  */
  readonly tablespaceName?: string;
  /**
  * The name of the template from which to create the new database
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql/r/database#template Database#template}
  */
  readonly template?: string;
}

/**
* Represents a {@link https://www.terraform.io/docs/providers/postgresql/r/database postgresql_database}
*/
export class Database extends cdktf.TerraformResource {

  // =================
  // STATIC PROPERTIES
  // =================
  public static readonly tfResourceType = "postgresql_database";

  // ===========
  // INITIALIZER
  // ===========

  /**
  * Create a new {@link https://www.terraform.io/docs/providers/postgresql/r/database postgresql_database} Resource
  *
  * @param scope The scope in which to define this construct
  * @param id The scoped construct ID. Must be unique amongst siblings in the same scope
  * @param options DatabaseConfig
  */
  public constructor(scope: Construct, id: string, config: DatabaseConfig) {
    super(scope, id, {
      terraformResourceType: 'postgresql_database',
      terraformGeneratorMetadata: {
        providerName: 'postgresql',
        providerVersion: '1.19.0',
        providerVersionConstraint: '1.19.0'
      },
      provider: config.provider,
      dependsOn: config.dependsOn,
      count: config.count,
      lifecycle: config.lifecycle,
      provisioners: config.provisioners,
      connection: config.connection,
      forEach: config.forEach
    });
    this._allowConnections = config.allowConnections;
    this._connectionLimit = config.connectionLimit;
    this._encoding = config.encoding;
    this._id = config.id;
    this._isTemplate = config.isTemplate;
    this._lcCollate = config.lcCollate;
    this._lcCtype = config.lcCtype;
    this._name = config.name;
    this._owner = config.owner;
    this._tablespaceName = config.tablespaceName;
    this._template = config.template;
  }

  // ==========
  // ATTRIBUTES
  // ==========

  // allow_connections - computed: false, optional: true, required: false
  private _allowConnections?: boolean | cdktf.IResolvable; 
  public get allowConnections() {
    return this.getBooleanAttribute('allow_connections');
  }
  public set allowConnections(value: boolean | cdktf.IResolvable) {
    this._allowConnections = value;
  }
  public resetAllowConnections() {
    this._allowConnections = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get allowConnectionsInput() {
    return this._allowConnections;
  }

  // connection_limit - computed: false, optional: true, required: false
  private _connectionLimit?: number; 
  public get connectionLimit() {
    return this.getNumberAttribute('connection_limit');
  }
  public set connectionLimit(value: number) {
    this._connectionLimit = value;
  }
  public resetConnectionLimit() {
    this._connectionLimit = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get connectionLimitInput() {
    return this._connectionLimit;
  }

  // encoding - computed: true, optional: true, required: false
  private _encoding?: string; 
  public get encoding() {
    return this.getStringAttribute('encoding');
  }
  public set encoding(value: string) {
    this._encoding = value;
  }
  public resetEncoding() {
    this._encoding = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get encodingInput() {
    return this._encoding;
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

  // is_template - computed: true, optional: true, required: false
  private _isTemplate?: boolean | cdktf.IResolvable; 
  public get isTemplate() {
    return this.getBooleanAttribute('is_template');
  }
  public set isTemplate(value: boolean | cdktf.IResolvable) {
    this._isTemplate = value;
  }
  public resetIsTemplate() {
    this._isTemplate = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get isTemplateInput() {
    return this._isTemplate;
  }

  // lc_collate - computed: true, optional: true, required: false
  private _lcCollate?: string; 
  public get lcCollate() {
    return this.getStringAttribute('lc_collate');
  }
  public set lcCollate(value: string) {
    this._lcCollate = value;
  }
  public resetLcCollate() {
    this._lcCollate = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get lcCollateInput() {
    return this._lcCollate;
  }

  // lc_ctype - computed: true, optional: true, required: false
  private _lcCtype?: string; 
  public get lcCtype() {
    return this.getStringAttribute('lc_ctype');
  }
  public set lcCtype(value: string) {
    this._lcCtype = value;
  }
  public resetLcCtype() {
    this._lcCtype = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get lcCtypeInput() {
    return this._lcCtype;
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

  // owner - computed: true, optional: true, required: false
  private _owner?: string; 
  public get owner() {
    return this.getStringAttribute('owner');
  }
  public set owner(value: string) {
    this._owner = value;
  }
  public resetOwner() {
    this._owner = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get ownerInput() {
    return this._owner;
  }

  // tablespace_name - computed: true, optional: true, required: false
  private _tablespaceName?: string; 
  public get tablespaceName() {
    return this.getStringAttribute('tablespace_name');
  }
  public set tablespaceName(value: string) {
    this._tablespaceName = value;
  }
  public resetTablespaceName() {
    this._tablespaceName = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get tablespaceNameInput() {
    return this._tablespaceName;
  }

  // template - computed: true, optional: true, required: false
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

  // =========
  // SYNTHESIS
  // =========

  protected synthesizeAttributes(): { [name: string]: any } {
    return {
      allow_connections: cdktf.booleanToTerraform(this._allowConnections),
      connection_limit: cdktf.numberToTerraform(this._connectionLimit),
      encoding: cdktf.stringToTerraform(this._encoding),
      id: cdktf.stringToTerraform(this._id),
      is_template: cdktf.booleanToTerraform(this._isTemplate),
      lc_collate: cdktf.stringToTerraform(this._lcCollate),
      lc_ctype: cdktf.stringToTerraform(this._lcCtype),
      name: cdktf.stringToTerraform(this._name),
      owner: cdktf.stringToTerraform(this._owner),
      tablespace_name: cdktf.stringToTerraform(this._tablespaceName),
      template: cdktf.stringToTerraform(this._template),
    };
  }
}
