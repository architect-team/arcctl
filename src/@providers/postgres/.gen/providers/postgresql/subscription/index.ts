// https://www.terraform.io/docs/providers/postgresql/r/subscription
// generated from terraform resource schema

import { Construct } from 'constructs';
import * as cdktf from 'cdktf';

// Configuration

export interface SubscriptionConfig extends cdktf.TerraformMetaArguments {
  /**
  * The connection string to the publisher. It should follow the keyword/value format (https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql/r/subscription#conninfo Subscription#conninfo}
  */
  readonly conninfo: string;
  /**
  * Specifies whether the command should create the replication slot on the publisher
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql/r/subscription#create_slot Subscription#create_slot}
  */
  readonly createSlot?: boolean | cdktf.IResolvable;
  /**
  * Sets the database to add the subscription for
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql/r/subscription#database Subscription#database}
  */
  readonly database?: string;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql/r/subscription#id Subscription#id}
  *
  * Please be aware that the id field is automatically added to all resources in Terraform providers using a Terraform provider SDK version below 2.
  * If you experience problems setting this value it might not be settable. Please take a look at the provider documentation to ensure it should be settable.
  */
  readonly id?: string;
  /**
  * The name of the subscription
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql/r/subscription#name Subscription#name}
  */
  readonly name: string;
  /**
  * Names of the publications on the publisher to subscribe to
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql/r/subscription#publications Subscription#publications}
  */
  readonly publications: string[];
  /**
  * Name of the replication slot to use. The default behavior is to use the name of the subscription for the slot name
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql/r/subscription#slot_name Subscription#slot_name}
  */
  readonly slotName?: string;
}

/**
* Represents a {@link https://www.terraform.io/docs/providers/postgresql/r/subscription postgresql_subscription}
*/
export class Subscription extends cdktf.TerraformResource {

  // =================
  // STATIC PROPERTIES
  // =================
  public static readonly tfResourceType = "postgresql_subscription";

  // ===========
  // INITIALIZER
  // ===========

  /**
  * Create a new {@link https://www.terraform.io/docs/providers/postgresql/r/subscription postgresql_subscription} Resource
  *
  * @param scope The scope in which to define this construct
  * @param id The scoped construct ID. Must be unique amongst siblings in the same scope
  * @param options SubscriptionConfig
  */
  public constructor(scope: Construct, id: string, config: SubscriptionConfig) {
    super(scope, id, {
      terraformResourceType: 'postgresql_subscription',
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
    this._conninfo = config.conninfo;
    this._createSlot = config.createSlot;
    this._database = config.database;
    this._id = config.id;
    this._name = config.name;
    this._publications = config.publications;
    this._slotName = config.slotName;
  }

  // ==========
  // ATTRIBUTES
  // ==========

  // conninfo - computed: false, optional: false, required: true
  private _conninfo?: string; 
  public get conninfo() {
    return this.getStringAttribute('conninfo');
  }
  public set conninfo(value: string) {
    this._conninfo = value;
  }
  // Temporarily expose input value. Use with caution.
  public get conninfoInput() {
    return this._conninfo;
  }

  // create_slot - computed: false, optional: true, required: false
  private _createSlot?: boolean | cdktf.IResolvable; 
  public get createSlot() {
    return this.getBooleanAttribute('create_slot');
  }
  public set createSlot(value: boolean | cdktf.IResolvable) {
    this._createSlot = value;
  }
  public resetCreateSlot() {
    this._createSlot = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get createSlotInput() {
    return this._createSlot;
  }

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

  // publications - computed: false, optional: false, required: true
  private _publications?: string[]; 
  public get publications() {
    return cdktf.Fn.tolist(this.getListAttribute('publications'));
  }
  public set publications(value: string[]) {
    this._publications = value;
  }
  // Temporarily expose input value. Use with caution.
  public get publicationsInput() {
    return this._publications;
  }

  // slot_name - computed: false, optional: true, required: false
  private _slotName?: string; 
  public get slotName() {
    return this.getStringAttribute('slot_name');
  }
  public set slotName(value: string) {
    this._slotName = value;
  }
  public resetSlotName() {
    this._slotName = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get slotNameInput() {
    return this._slotName;
  }

  // =========
  // SYNTHESIS
  // =========

  protected synthesizeAttributes(): { [name: string]: any } {
    return {
      conninfo: cdktf.stringToTerraform(this._conninfo),
      create_slot: cdktf.booleanToTerraform(this._createSlot),
      database: cdktf.stringToTerraform(this._database),
      id: cdktf.stringToTerraform(this._id),
      name: cdktf.stringToTerraform(this._name),
      publications: cdktf.listMapper(cdktf.stringToTerraform, false)(this._publications),
      slot_name: cdktf.stringToTerraform(this._slotName),
    };
  }
}
