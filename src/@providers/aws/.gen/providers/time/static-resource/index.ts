// https://www.terraform.io/docs/providers/time/r/static
// generated from terraform resource schema

import { Construct } from 'npm:constructs';
import * as cdktf from 'cdktf';

// Configuration

export interface StaticResourceConfig extends cdktf.TerraformMetaArguments {
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/time/r/static#id StaticResource#id}
  *
  * Please be aware that the id field is automatically added to all resources in Terraform providers using a Terraform provider SDK version below 2.
  * If you experience problems setting this value it might not be settable. Please take a look at the provider documentation to ensure it should be settable.
  */
  readonly id?: string;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/time/r/static#rfc3339 StaticResource#rfc3339}
  */
  readonly rfc3339?: string;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/time/r/static#triggers StaticResource#triggers}
  */
  readonly triggers?: { [key: string]: string };
}

/**
* Represents a {@link https://www.terraform.io/docs/providers/time/r/static time_static}
*/
export class StaticResource extends cdktf.TerraformResource {

  // =================
  // STATIC PROPERTIES
  // =================
  public static readonly tfResourceType = "time_static";

  // ===========
  // INITIALIZER
  // ===========

  /**
  * Create a new {@link https://www.terraform.io/docs/providers/time/r/static time_static} Resource
  *
  * @param scope The scope in which to define this construct
  * @param id The scoped construct ID. Must be unique amongst siblings in the same scope
  * @param options StaticResourceConfig = {}
  */
  public constructor(scope: Construct, id: string, config: StaticResourceConfig = {}) {
    super(scope, id, {
      terraformResourceType: 'time_static',
      terraformGeneratorMetadata: {
        providerName: 'time',
        providerVersion: '0.5.0',
        providerVersionConstraint: '0.5.0'
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
    this._rfc3339 = config.rfc3339;
    this._triggers = config.triggers;
  }

  // ==========
  // ATTRIBUTES
  // ==========

  // day - computed: true, optional: false, required: false
  public get day() {
    return this.getNumberAttribute('day');
  }

  // hour - computed: true, optional: false, required: false
  public get hour() {
    return this.getNumberAttribute('hour');
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

  // minute - computed: true, optional: false, required: false
  public get minute() {
    return this.getNumberAttribute('minute');
  }

  // month - computed: true, optional: false, required: false
  public get month() {
    return this.getNumberAttribute('month');
  }

  // rfc3339 - computed: true, optional: true, required: false
  private _rfc3339?: string;
  public get rfc3339() {
    return this.getStringAttribute('rfc3339');
  }
  public set rfc3339(value: string) {
    this._rfc3339 = value;
  }
  public resetRfc3339() {
    this._rfc3339 = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get rfc3339Input() {
    return this._rfc3339;
  }

  // second - computed: true, optional: false, required: false
  public get second() {
    return this.getNumberAttribute('second');
  }

  // triggers - computed: false, optional: true, required: false
  private _triggers?: { [key: string]: string };
  public get triggers() {
    return this.getStringMapAttribute('triggers');
  }
  public set triggers(value: { [key: string]: string }) {
    this._triggers = value;
  }
  public resetTriggers() {
    this._triggers = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get triggersInput() {
    return this._triggers;
  }

  // unix - computed: true, optional: false, required: false
  public get unix() {
    return this.getNumberAttribute('unix');
  }

  // year - computed: true, optional: false, required: false
  public get year() {
    return this.getNumberAttribute('year');
  }

  // =========
  // SYNTHESIS
  // =========

  protected synthesizeAttributes(): { [name: string]: any } {
    return {
      id: cdktf.stringToTerraform(this._id),
      rfc3339: cdktf.stringToTerraform(this._rfc3339),
      triggers: cdktf.hashMapper(cdktf.stringToTerraform)(this._triggers),
    };
  }
}
