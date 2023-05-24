// https://www.terraform.io/docs/providers/digitalocean/d/account
// generated from terraform resource schema

import { Construct } from 'constructs';
import * as cdktf from 'cdktf';

// Configuration

export interface DataDigitaloceanAccountConfig extends cdktf.TerraformMetaArguments {
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/d/account#id DataDigitaloceanAccount#id}
  *
  * Please be aware that the id field is automatically added to all resources in Terraform providers using a Terraform provider SDK version below 2.
  * If you experience problems setting this value it might not be settable. Please take a look at the provider documentation to ensure it should be settable.
  */
  readonly id?: string;
}

/**
* Represents a {@link https://www.terraform.io/docs/providers/digitalocean/d/account digitalocean_account}
*/
export class DataDigitaloceanAccount extends cdktf.TerraformDataSource {

  // =================
  // STATIC PROPERTIES
  // =================
  public static readonly tfResourceType = "digitalocean_account";

  // ===========
  // INITIALIZER
  // ===========

  /**
  * Create a new {@link https://www.terraform.io/docs/providers/digitalocean/d/account digitalocean_account} Data Source
  *
  * @param scope The scope in which to define this construct
  * @param id The scoped construct ID. Must be unique amongst siblings in the same scope
  * @param options DataDigitaloceanAccountConfig = {}
  */
  public constructor(scope: Construct, id: string, config: DataDigitaloceanAccountConfig = {}) {
    super(scope, id, {
      terraformResourceType: 'digitalocean_account',
      terraformGeneratorMetadata: {
        providerName: 'digitalocean',
        providerVersion: '2.28.1',
        providerVersionConstraint: '2.28.1'
      },
      provider: config.provider,
      dependsOn: config.dependsOn,
      count: config.count,
      lifecycle: config.lifecycle,
      provisioners: config.provisioners,
      connection: config.connection,
      forEach: config.forEach
    });
    this._id = config.id;
  }

  // ==========
  // ATTRIBUTES
  // ==========

  // droplet_limit - computed: true, optional: false, required: false
  public get dropletLimit() {
    return this.getNumberAttribute('droplet_limit');
  }

  // email - computed: true, optional: false, required: false
  public get email() {
    return this.getStringAttribute('email');
  }

  // email_verified - computed: true, optional: false, required: false
  public get emailVerified() {
    return this.getBooleanAttribute('email_verified');
  }

  // floating_ip_limit - computed: true, optional: false, required: false
  public get floatingIpLimit() {
    return this.getNumberAttribute('floating_ip_limit');
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

  // status - computed: true, optional: false, required: false
  public get status() {
    return this.getStringAttribute('status');
  }

  // status_message - computed: true, optional: false, required: false
  public get statusMessage() {
    return this.getStringAttribute('status_message');
  }

  // uuid - computed: true, optional: false, required: false
  public get uuid() {
    return this.getStringAttribute('uuid');
  }

  // =========
  // SYNTHESIS
  // =========

  protected synthesizeAttributes(): { [name: string]: any } {
    return {
      id: cdktf.stringToTerraform(this._id),
    };
  }
}
