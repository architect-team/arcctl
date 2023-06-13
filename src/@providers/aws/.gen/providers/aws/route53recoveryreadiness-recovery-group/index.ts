// https://www.terraform.io/docs/providers/aws/r/route53recoveryreadiness_recovery_group
// generated from terraform resource schema

import { Construct } from 'constructs';
import * as cdktf from 'cdktf';

// Configuration

export interface Route53RecoveryreadinessRecoveryGroupConfig extends cdktf.TerraformMetaArguments {
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/aws/r/route53recoveryreadiness_recovery_group#cells Route53RecoveryreadinessRecoveryGroup#cells}
  */
  readonly cells?: string[];
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/aws/r/route53recoveryreadiness_recovery_group#id Route53RecoveryreadinessRecoveryGroup#id}
  *
  * Please be aware that the id field is automatically added to all resources in Terraform providers using a Terraform provider SDK version below 2.
  * If you experience problems setting this value it might not be settable. Please take a look at the provider documentation to ensure it should be settable.
  */
  readonly id?: string;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/aws/r/route53recoveryreadiness_recovery_group#recovery_group_name Route53RecoveryreadinessRecoveryGroup#recovery_group_name}
  */
  readonly recoveryGroupName: string;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/aws/r/route53recoveryreadiness_recovery_group#tags Route53RecoveryreadinessRecoveryGroup#tags}
  */
  readonly tags?: { [key: string]: string };
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/aws/r/route53recoveryreadiness_recovery_group#tags_all Route53RecoveryreadinessRecoveryGroup#tags_all}
  */
  readonly tagsAll?: { [key: string]: string };
  /**
  * timeouts block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/aws/r/route53recoveryreadiness_recovery_group#timeouts Route53RecoveryreadinessRecoveryGroup#timeouts}
  */
  readonly timeouts?: Route53RecoveryreadinessRecoveryGroupTimeouts;
}
export interface Route53RecoveryreadinessRecoveryGroupTimeouts {
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/aws/r/route53recoveryreadiness_recovery_group#delete Route53RecoveryreadinessRecoveryGroup#delete}
  */
  readonly delete?: string;
}

export function route53RecoveryreadinessRecoveryGroupTimeoutsToTerraform(struct?: Route53RecoveryreadinessRecoveryGroupTimeoutsOutputReference | Route53RecoveryreadinessRecoveryGroupTimeouts | cdktf.IResolvable): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    delete: cdktf.stringToTerraform(struct!.delete),
  }
}

export class Route53RecoveryreadinessRecoveryGroupTimeoutsOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;
  private resolvableValue?: cdktf.IResolvable;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string) {
    super(terraformResource, terraformAttribute, false, 0);
  }

  public get internalValue(): Route53RecoveryreadinessRecoveryGroupTimeouts | cdktf.IResolvable | undefined {
    if (this.resolvableValue) {
      return this.resolvableValue;
    }
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._delete !== undefined) {
      hasAnyValues = true;
      internalValueResult.delete = this._delete;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: Route53RecoveryreadinessRecoveryGroupTimeouts | cdktf.IResolvable | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this.resolvableValue = undefined;
      this._delete = undefined;
    }
    else if (cdktf.Tokenization.isResolvable(value)) {
      this.isEmptyObject = false;
      this.resolvableValue = value;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this.resolvableValue = undefined;
      this._delete = value.delete;
    }
  }

  // delete - computed: false, optional: true, required: false
  private _delete?: string; 
  public get delete() {
    return this.getStringAttribute('delete');
  }
  public set delete(value: string) {
    this._delete = value;
  }
  public resetDelete() {
    this._delete = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get deleteInput() {
    return this._delete;
  }
}

/**
* Represents a {@link https://www.terraform.io/docs/providers/aws/r/route53recoveryreadiness_recovery_group aws_route53recoveryreadiness_recovery_group}
*/
export class Route53RecoveryreadinessRecoveryGroup extends cdktf.TerraformResource {

  // =================
  // STATIC PROPERTIES
  // =================
  public static readonly tfResourceType = "aws_route53recoveryreadiness_recovery_group";

  // ===========
  // INITIALIZER
  // ===========

  /**
  * Create a new {@link https://www.terraform.io/docs/providers/aws/r/route53recoveryreadiness_recovery_group aws_route53recoveryreadiness_recovery_group} Resource
  *
  * @param scope The scope in which to define this construct
  * @param id The scoped construct ID. Must be unique amongst siblings in the same scope
  * @param options Route53RecoveryreadinessRecoveryGroupConfig
  */
  public constructor(scope: Construct, id: string, config: Route53RecoveryreadinessRecoveryGroupConfig) {
    super(scope, id, {
      terraformResourceType: 'aws_route53recoveryreadiness_recovery_group',
      terraformGeneratorMetadata: {
        providerName: 'aws',
        providerVersion: '4.61.0',
        providerVersionConstraint: '4.61.0'
      },
      provider: config.provider,
      dependsOn: config.dependsOn,
      count: config.count,
      lifecycle: config.lifecycle,
      provisioners: config.provisioners,
      connection: config.connection,
      forEach: config.forEach
    });
    this._cells = config.cells;
    this._id = config.id;
    this._recoveryGroupName = config.recoveryGroupName;
    this._tags = config.tags;
    this._tagsAll = config.tagsAll;
    this._timeouts.internalValue = config.timeouts;
  }

  // ==========
  // ATTRIBUTES
  // ==========

  // arn - computed: true, optional: false, required: false
  public get arn() {
    return this.getStringAttribute('arn');
  }

  // cells - computed: false, optional: true, required: false
  private _cells?: string[]; 
  public get cells() {
    return this.getListAttribute('cells');
  }
  public set cells(value: string[]) {
    this._cells = value;
  }
  public resetCells() {
    this._cells = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get cellsInput() {
    return this._cells;
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

  // recovery_group_name - computed: false, optional: false, required: true
  private _recoveryGroupName?: string; 
  public get recoveryGroupName() {
    return this.getStringAttribute('recovery_group_name');
  }
  public set recoveryGroupName(value: string) {
    this._recoveryGroupName = value;
  }
  // Temporarily expose input value. Use with caution.
  public get recoveryGroupNameInput() {
    return this._recoveryGroupName;
  }

  // tags - computed: false, optional: true, required: false
  private _tags?: { [key: string]: string }; 
  public get tags() {
    return this.getStringMapAttribute('tags');
  }
  public set tags(value: { [key: string]: string }) {
    this._tags = value;
  }
  public resetTags() {
    this._tags = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get tagsInput() {
    return this._tags;
  }

  // tags_all - computed: true, optional: true, required: false
  private _tagsAll?: { [key: string]: string }; 
  public get tagsAll() {
    return this.getStringMapAttribute('tags_all');
  }
  public set tagsAll(value: { [key: string]: string }) {
    this._tagsAll = value;
  }
  public resetTagsAll() {
    this._tagsAll = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get tagsAllInput() {
    return this._tagsAll;
  }

  // timeouts - computed: false, optional: true, required: false
  private _timeouts = new Route53RecoveryreadinessRecoveryGroupTimeoutsOutputReference(this, "timeouts");
  public get timeouts() {
    return this._timeouts;
  }
  public putTimeouts(value: Route53RecoveryreadinessRecoveryGroupTimeouts) {
    this._timeouts.internalValue = value;
  }
  public resetTimeouts() {
    this._timeouts.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get timeoutsInput() {
    return this._timeouts.internalValue;
  }

  // =========
  // SYNTHESIS
  // =========

  protected synthesizeAttributes(): { [name: string]: any } {
    return {
      cells: cdktf.listMapper(cdktf.stringToTerraform, false)(this._cells),
      id: cdktf.stringToTerraform(this._id),
      recovery_group_name: cdktf.stringToTerraform(this._recoveryGroupName),
      tags: cdktf.hashMapper(cdktf.stringToTerraform)(this._tags),
      tags_all: cdktf.hashMapper(cdktf.stringToTerraform)(this._tagsAll),
      timeouts: route53RecoveryreadinessRecoveryGroupTimeoutsToTerraform(this._timeouts.internalValue),
    };
  }
}
