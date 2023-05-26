// https://www.terraform.io/docs/providers/postgresql/r/server
// generated from terraform resource schema

import { Construct } from 'constructs';
import * as cdktf from 'cdktf';

// Configuration

export interface ServerConfig extends cdktf.TerraformMetaArguments {
  /**
  * Automatically drop objects that depend on the server (such as user mappings), and in turn all objects that depend on those objects. Drop RESTRICT is the default
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql/r/server#drop_cascade Server#drop_cascade}
  */
  readonly dropCascade?: boolean | cdktf.IResolvable;
  /**
  * The name of the foreign-data wrapper that manages the server
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql/r/server#fdw_name Server#fdw_name}
  */
  readonly fdwName: string;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql/r/server#id Server#id}
  *
  * Please be aware that the id field is automatically added to all resources in Terraform providers using a Terraform provider SDK version below 2.
  * If you experience problems setting this value it might not be settable. Please take a look at the provider documentation to ensure it should be settable.
  */
  readonly id?: string;
  /**
  * This clause specifies the options for the server. The options typically define the connection details of the server, but the actual names and values are dependent on the server's foreign-data wrapper
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql/r/server#options Server#options}
  */
  readonly options?: { [key: string]: string };
  /**
  * The name of the foreign server to be created
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql/r/server#server_name Server#server_name}
  */
  readonly serverName: string;
  /**
  * The user name of the new owner of the foreign server
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql/r/server#server_owner Server#server_owner}
  */
  readonly serverOwner?: string;
  /**
  * Optional server type, potentially useful to foreign-data wrappers
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql/r/server#server_type Server#server_type}
  */
  readonly serverType?: string;
  /**
  * Optional server version, potentially useful to foreign-data wrappers.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql/r/server#server_version Server#server_version}
  */
  readonly serverVersion?: string;
}

/**
* Represents a {@link https://www.terraform.io/docs/providers/postgresql/r/server postgresql_server}
*/
export class Server extends cdktf.TerraformResource {

  // =================
  // STATIC PROPERTIES
  // =================
  public static readonly tfResourceType = "postgresql_server";

  // ===========
  // INITIALIZER
  // ===========

  /**
  * Create a new {@link https://www.terraform.io/docs/providers/postgresql/r/server postgresql_server} Resource
  *
  * @param scope The scope in which to define this construct
  * @param id The scoped construct ID. Must be unique amongst siblings in the same scope
  * @param options ServerConfig
  */
  public constructor(scope: Construct, id: string, config: ServerConfig) {
    super(scope, id, {
      terraformResourceType: 'postgresql_server',
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
    this._dropCascade = config.dropCascade;
    this._fdwName = config.fdwName;
    this._id = config.id;
    this._options = config.options;
    this._serverName = config.serverName;
    this._serverOwner = config.serverOwner;
    this._serverType = config.serverType;
    this._serverVersion = config.serverVersion;
  }

  // ==========
  // ATTRIBUTES
  // ==========

  // drop_cascade - computed: false, optional: true, required: false
  private _dropCascade?: boolean | cdktf.IResolvable; 
  public get dropCascade() {
    return this.getBooleanAttribute('drop_cascade');
  }
  public set dropCascade(value: boolean | cdktf.IResolvable) {
    this._dropCascade = value;
  }
  public resetDropCascade() {
    this._dropCascade = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get dropCascadeInput() {
    return this._dropCascade;
  }

  // fdw_name - computed: false, optional: false, required: true
  private _fdwName?: string; 
  public get fdwName() {
    return this.getStringAttribute('fdw_name');
  }
  public set fdwName(value: string) {
    this._fdwName = value;
  }
  // Temporarily expose input value. Use with caution.
  public get fdwNameInput() {
    return this._fdwName;
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

  // options - computed: false, optional: true, required: false
  private _options?: { [key: string]: string }; 
  public get options() {
    return this.getStringMapAttribute('options');
  }
  public set options(value: { [key: string]: string }) {
    this._options = value;
  }
  public resetOptions() {
    this._options = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get optionsInput() {
    return this._options;
  }

  // server_name - computed: false, optional: false, required: true
  private _serverName?: string; 
  public get serverName() {
    return this.getStringAttribute('server_name');
  }
  public set serverName(value: string) {
    this._serverName = value;
  }
  // Temporarily expose input value. Use with caution.
  public get serverNameInput() {
    return this._serverName;
  }

  // server_owner - computed: true, optional: true, required: false
  private _serverOwner?: string; 
  public get serverOwner() {
    return this.getStringAttribute('server_owner');
  }
  public set serverOwner(value: string) {
    this._serverOwner = value;
  }
  public resetServerOwner() {
    this._serverOwner = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get serverOwnerInput() {
    return this._serverOwner;
  }

  // server_type - computed: false, optional: true, required: false
  private _serverType?: string; 
  public get serverType() {
    return this.getStringAttribute('server_type');
  }
  public set serverType(value: string) {
    this._serverType = value;
  }
  public resetServerType() {
    this._serverType = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get serverTypeInput() {
    return this._serverType;
  }

  // server_version - computed: false, optional: true, required: false
  private _serverVersion?: string; 
  public get serverVersion() {
    return this.getStringAttribute('server_version');
  }
  public set serverVersion(value: string) {
    this._serverVersion = value;
  }
  public resetServerVersion() {
    this._serverVersion = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get serverVersionInput() {
    return this._serverVersion;
  }

  // =========
  // SYNTHESIS
  // =========

  protected synthesizeAttributes(): { [name: string]: any } {
    return {
      drop_cascade: cdktf.booleanToTerraform(this._dropCascade),
      fdw_name: cdktf.stringToTerraform(this._fdwName),
      id: cdktf.stringToTerraform(this._id),
      options: cdktf.hashMapper(cdktf.stringToTerraform)(this._options),
      server_name: cdktf.stringToTerraform(this._serverName),
      server_owner: cdktf.stringToTerraform(this._serverOwner),
      server_type: cdktf.stringToTerraform(this._serverType),
      server_version: cdktf.stringToTerraform(this._serverVersion),
    };
  }
}
