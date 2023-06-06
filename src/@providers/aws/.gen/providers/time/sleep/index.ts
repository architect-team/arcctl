// https://www.terraform.io/docs/providers/time/r/sleep
// generated from terraform resource schema
import * as cdktf from 'cdktf';
import { Construct } from 'constructs';

// Configuration

export interface SleepConfig extends cdktf.TerraformMetaArguments {
  /**
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/time/r/sleep#create_duration Sleep#create_duration}
   */
  readonly createDuration?: string;
  /**
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/time/r/sleep#destroy_duration Sleep#destroy_duration}
   */
  readonly destroyDuration?: string;
  /**
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/time/r/sleep#id Sleep#id}
   *
   * Please be aware that the id field is automatically added to all resources in Terraform providers using a Terraform provider SDK version below 2.
   * If you experience problems setting this value it might not be settable. Please take a look at the provider documentation to ensure it should be settable.
   */
  readonly id?: string;
  /**
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/time/r/sleep#triggers Sleep#triggers}
   */
  readonly triggers?: { [key: string]: string };
}

/**
 * Represents a {@link https://www.terraform.io/docs/providers/time/r/sleep time_sleep}
 */
export class Sleep extends cdktf.TerraformResource {
  // =================
  // STATIC PROPERTIES
  // =================
  public static readonly tfResourceType = 'time_sleep';

  // ===========
  // INITIALIZER
  // ===========

  /**
   * Create a new {@link https://www.terraform.io/docs/providers/time/r/sleep time_sleep} Resource
   *
   * @param scope The scope in which to define this construct
   * @param id The scoped construct ID. Must be unique amongst siblings in the same scope
   * @param options SleepConfig = {}
   */
  public constructor(scope: Construct, id: string, config: SleepConfig = {}) {
    super(scope, id, {
      terraformResourceType: 'time_sleep',
      terraformGeneratorMetadata: {
        providerName: 'time',
        providerVersion: '0.5.0',
        providerVersionConstraint: '0.5.0',
      },
      provider: config.provider,
      dependsOn: config.dependsOn,
      count: config.count,
      lifecycle: config.lifecycle,
      provisioners: config.provisioners,
      connection: config.connection,
      forEach: config.forEach,
    });
    this._createDuration = config.createDuration;
    this._destroyDuration = config.destroyDuration;
    this._id = config.id;
    this._triggers = config.triggers;
  }

  // ==========
  // ATTRIBUTES
  // ==========

  // create_duration - computed: false, optional: true, required: false
  private _createDuration?: string;
  public get createDuration() {
    return this.getStringAttribute('create_duration');
  }
  public set createDuration(value: string) {
    this._createDuration = value;
  }
  public resetCreateDuration() {
    this._createDuration = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get createDurationInput() {
    return this._createDuration;
  }

  // destroy_duration - computed: false, optional: true, required: false
  private _destroyDuration?: string;
  public get destroyDuration() {
    return this.getStringAttribute('destroy_duration');
  }
  public set destroyDuration(value: string) {
    this._destroyDuration = value;
  }
  public resetDestroyDuration() {
    this._destroyDuration = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get destroyDurationInput() {
    return this._destroyDuration;
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

  // =========
  // SYNTHESIS
  // =========

  protected synthesizeAttributes(): { [name: string]: any } {
    return {
      create_duration: cdktf.stringToTerraform(this._createDuration),
      destroy_duration: cdktf.stringToTerraform(this._destroyDuration),
      id: cdktf.stringToTerraform(this._id),
      triggers: cdktf.hashMapper(cdktf.stringToTerraform)(this._triggers),
    };
  }
}
