// https://www.terraform.io/docs/providers/postgresql/r/replication_slot
// generated from terraform resource schema

import { Construct } from 'constructs';
import * as cdktf from 'cdktf';

// Configuration

export interface ReplicationSlotConfig extends cdktf.TerraformMetaArguments {
  /**
  * Sets the database to add the replication slot to
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql/r/replication_slot#database ReplicationSlot#database}
  */
  readonly database?: string;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql/r/replication_slot#id ReplicationSlot#id}
  *
  * Please be aware that the id field is automatically added to all resources in Terraform providers using a Terraform provider SDK version below 2.
  * If you experience problems setting this value it might not be settable. Please take a look at the provider documentation to ensure it should be settable.
  */
  readonly id?: string;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql/r/replication_slot#name ReplicationSlot#name}
  */
  readonly name: string;
  /**
  * Sets the output plugin to use
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql/r/replication_slot#plugin ReplicationSlot#plugin}
  */
  readonly plugin: string;
}

/**
* Represents a {@link https://www.terraform.io/docs/providers/postgresql/r/replication_slot postgresql_replication_slot}
*/
export class ReplicationSlot extends cdktf.TerraformResource {

  // =================
  // STATIC PROPERTIES
  // =================
  public static readonly tfResourceType = "postgresql_replication_slot";

  // ===========
  // INITIALIZER
  // ===========

  /**
  * Create a new {@link https://www.terraform.io/docs/providers/postgresql/r/replication_slot postgresql_replication_slot} Resource
  *
  * @param scope The scope in which to define this construct
  * @param id The scoped construct ID. Must be unique amongst siblings in the same scope
  * @param options ReplicationSlotConfig
  */
  public constructor(scope: Construct, id: string, config: ReplicationSlotConfig) {
    super(scope, id, {
      terraformResourceType: 'postgresql_replication_slot',
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
    this._database = config.database;
    this._id = config.id;
    this._name = config.name;
    this._plugin = config.plugin;
  }

  // ==========
  // ATTRIBUTES
  // ==========

  // database - computed: true, optional: true, required: false
  private _database?: string; 
  public get database() {
    return this.getStringAttribute('database');
  }
  public set database(value: string) {
    this._database = value;
  }
  public resetDatabase() {
    this._database = undefined;
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

  // plugin - computed: false, optional: false, required: true
  private _plugin?: string; 
  public get plugin() {
    return this.getStringAttribute('plugin');
  }
  public set plugin(value: string) {
    this._plugin = value;
  }
  // Temporarily expose input value. Use with caution.
  public get pluginInput() {
    return this._plugin;
  }

  // =========
  // SYNTHESIS
  // =========

  protected synthesizeAttributes(): { [name: string]: any } {
    return {
      database: cdktf.stringToTerraform(this._database),
      id: cdktf.stringToTerraform(this._id),
      name: cdktf.stringToTerraform(this._name),
      plugin: cdktf.stringToTerraform(this._plugin),
    };
  }
}
