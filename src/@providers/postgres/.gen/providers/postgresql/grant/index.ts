// https://www.terraform.io/docs/providers/postgresql/r/grant
// generated from terraform resource schema

import { Construct } from 'constructs';
import * as cdktf from 'cdktf';

// Configuration

export interface GrantConfig extends cdktf.TerraformMetaArguments {
  /**
  * The specific columns to grant privileges on for this role
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql/r/grant#columns Grant#columns}
  */
  readonly columns?: string[];
  /**
  * The database to grant privileges on for this role
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql/r/grant#database Grant#database}
  */
  readonly database: string;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql/r/grant#id Grant#id}
  *
  * Please be aware that the id field is automatically added to all resources in Terraform providers using a Terraform provider SDK version below 2.
  * If you experience problems setting this value it might not be settable. Please take a look at the provider documentation to ensure it should be settable.
  */
  readonly id?: string;
  /**
  * The PostgreSQL object type to grant the privileges on (one of: database, function, procedure, routine, schema, sequence, table, foreign_data_wrapper, foreign_server, column)
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql/r/grant#object_type Grant#object_type}
  */
  readonly objectType: string;
  /**
  * The specific objects to grant privileges on for this role (empty means all objects of the requested type)
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql/r/grant#objects Grant#objects}
  */
  readonly objects?: string[];
  /**
  * The list of privileges to grant
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql/r/grant#privileges Grant#privileges}
  */
  readonly privileges: string[];
  /**
  * The name of the role to grant privileges on
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql/r/grant#role Grant#role}
  */
  readonly role: string;
  /**
  * The database schema to grant privileges on for this role
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql/r/grant#schema Grant#schema}
  */
  readonly schema?: string;
  /**
  * Permit the grant recipient to grant it to others
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql/r/grant#with_grant_option Grant#with_grant_option}
  */
  readonly withGrantOption?: boolean | cdktf.IResolvable;
}

/**
* Represents a {@link https://www.terraform.io/docs/providers/postgresql/r/grant postgresql_grant}
*/
export class Grant extends cdktf.TerraformResource {

  // =================
  // STATIC PROPERTIES
  // =================
  public static readonly tfResourceType = "postgresql_grant";

  // ===========
  // INITIALIZER
  // ===========

  /**
  * Create a new {@link https://www.terraform.io/docs/providers/postgresql/r/grant postgresql_grant} Resource
  *
  * @param scope The scope in which to define this construct
  * @param id The scoped construct ID. Must be unique amongst siblings in the same scope
  * @param options GrantConfig
  */
  public constructor(scope: Construct, id: string, config: GrantConfig) {
    super(scope, id, {
      terraformResourceType: 'postgresql_grant',
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
    this._columns = config.columns;
    this._database = config.database;
    this._id = config.id;
    this._objectType = config.objectType;
    this._objects = config.objects;
    this._privileges = config.privileges;
    this._role = config.role;
    this._schema = config.schema;
    this._withGrantOption = config.withGrantOption;
  }

  // ==========
  // ATTRIBUTES
  // ==========

  // columns - computed: false, optional: true, required: false
  private _columns?: string[]; 
  public get columns() {
    return cdktf.Fn.tolist(this.getListAttribute('columns'));
  }
  public set columns(value: string[]) {
    this._columns = value;
  }
  public resetColumns() {
    this._columns = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get columnsInput() {
    return this._columns;
  }

  // database - computed: false, optional: false, required: true
  private _database?: string; 
  public get database() {
    return this.getStringAttribute('database');
  }
  public set database(value: string) {
    this._database = value;
  }
  // Temporarily expose input value. Use with caution.
  public get databaseInput() {
    return this._database;
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

  // object_type - computed: false, optional: false, required: true
  private _objectType?: string; 
  public get objectType() {
    return this.getStringAttribute('object_type');
  }
  public set objectType(value: string) {
    this._objectType = value;
  }
  // Temporarily expose input value. Use with caution.
  public get objectTypeInput() {
    return this._objectType;
  }

  // objects - computed: false, optional: true, required: false
  private _objects?: string[]; 
  public get objects() {
    return cdktf.Fn.tolist(this.getListAttribute('objects'));
  }
  public set objects(value: string[]) {
    this._objects = value;
  }
  public resetObjects() {
    this._objects = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get objectsInput() {
    return this._objects;
  }

  // privileges - computed: false, optional: false, required: true
  private _privileges?: string[]; 
  public get privileges() {
    return cdktf.Fn.tolist(this.getListAttribute('privileges'));
  }
  public set privileges(value: string[]) {
    this._privileges = value;
  }
  // Temporarily expose input value. Use with caution.
  public get privilegesInput() {
    return this._privileges;
  }

  // role - computed: false, optional: false, required: true
  private _role?: string; 
  public get role() {
    return this.getStringAttribute('role');
  }
  public set role(value: string) {
    this._role = value;
  }
  // Temporarily expose input value. Use with caution.
  public get roleInput() {
    return this._role;
  }

  // schema - computed: false, optional: true, required: false
  private _schema?: string; 
  public get schema() {
    return this.getStringAttribute('schema');
  }
  public set schema(value: string) {
    this._schema = value;
  }
  public resetSchema() {
    this._schema = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get schemaInput() {
    return this._schema;
  }

  // with_grant_option - computed: false, optional: true, required: false
  private _withGrantOption?: boolean | cdktf.IResolvable; 
  public get withGrantOption() {
    return this.getBooleanAttribute('with_grant_option');
  }
  public set withGrantOption(value: boolean | cdktf.IResolvable) {
    this._withGrantOption = value;
  }
  public resetWithGrantOption() {
    this._withGrantOption = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get withGrantOptionInput() {
    return this._withGrantOption;
  }

  // =========
  // SYNTHESIS
  // =========

  protected synthesizeAttributes(): { [name: string]: any } {
    return {
      columns: cdktf.listMapper(cdktf.stringToTerraform, false)(this._columns),
      database: cdktf.stringToTerraform(this._database),
      id: cdktf.stringToTerraform(this._id),
      object_type: cdktf.stringToTerraform(this._objectType),
      objects: cdktf.listMapper(cdktf.stringToTerraform, false)(this._objects),
      privileges: cdktf.listMapper(cdktf.stringToTerraform, false)(this._privileges),
      role: cdktf.stringToTerraform(this._role),
      schema: cdktf.stringToTerraform(this._schema),
      with_grant_option: cdktf.booleanToTerraform(this._withGrantOption),
    };
  }
}
