// https://www.terraform.io/docs/providers/aws/r/dynamodb_table_replica
// generated from terraform resource schema
import * as cdktf from 'cdktf';
import { Construct } from 'constructs';

// Configuration

export interface DynamodbTableReplicaAConfig
  extends cdktf.TerraformMetaArguments {
  /**
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/aws/r/dynamodb_table_replica#global_table_arn DynamodbTableReplicaA#global_table_arn}
   */
  readonly globalTableArn: string;
  /**
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/aws/r/dynamodb_table_replica#id DynamodbTableReplicaA#id}
   *
   * Please be aware that the id field is automatically added to all resources in Terraform providers using a Terraform provider SDK version below 2.
   * If you experience problems setting this value it might not be settable. Please take a look at the provider documentation to ensure it should be settable.
   */
  readonly id?: string;
  /**
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/aws/r/dynamodb_table_replica#kms_key_arn DynamodbTableReplicaA#kms_key_arn}
   */
  readonly kmsKeyArn?: string;
  /**
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/aws/r/dynamodb_table_replica#point_in_time_recovery DynamodbTableReplicaA#point_in_time_recovery}
   */
  readonly pointInTimeRecovery?: boolean | cdktf.IResolvable;
  /**
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/aws/r/dynamodb_table_replica#table_class_override DynamodbTableReplicaA#table_class_override}
   */
  readonly tableClassOverride?: string;
  /**
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/aws/r/dynamodb_table_replica#tags DynamodbTableReplicaA#tags}
   */
  readonly tags?: { [key: string]: string };
  /**
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/aws/r/dynamodb_table_replica#tags_all DynamodbTableReplicaA#tags_all}
   */
  readonly tagsAll?: { [key: string]: string };
  /**
   * timeouts block
   *
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/aws/r/dynamodb_table_replica#timeouts DynamodbTableReplicaA#timeouts}
   */
  readonly timeouts?: DynamodbTableReplicaTimeouts;
}
export interface DynamodbTableReplicaTimeouts {
  /**
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/aws/r/dynamodb_table_replica#create DynamodbTableReplicaA#create}
   */
  readonly create?: string;
  /**
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/aws/r/dynamodb_table_replica#delete DynamodbTableReplicaA#delete}
   */
  readonly delete?: string;
  /**
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/aws/r/dynamodb_table_replica#update DynamodbTableReplicaA#update}
   */
  readonly update?: string;
}

export function dynamodbTableReplicaTimeoutsToTerraform(
  struct?:
    | DynamodbTableReplicaTimeoutsOutputReference
    | DynamodbTableReplicaTimeouts
    | cdktf.IResolvable,
): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) {
    return struct;
  }
  if (cdktf.isComplexElement(struct)) {
    throw new Error(
      'A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration',
    );
  }
  return {
    create: cdktf.stringToTerraform(struct!.create),
    delete: cdktf.stringToTerraform(struct!.delete),
    update: cdktf.stringToTerraform(struct!.update),
  };
}

export class DynamodbTableReplicaTimeoutsOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;
  private resolvableValue?: cdktf.IResolvable;

  /**
   * @param terraformResource The parent resource
   * @param terraformAttribute The attribute on the parent resource this class is referencing
   */
  public constructor(
    terraformResource: cdktf.IInterpolatingParent,
    terraformAttribute: string,
  ) {
    super(terraformResource, terraformAttribute, false, 0);
  }

  public get internalValue():
    | DynamodbTableReplicaTimeouts
    | cdktf.IResolvable
    | undefined {
    if (this.resolvableValue) {
      return this.resolvableValue;
    }
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._create !== undefined) {
      hasAnyValues = true;
      internalValueResult.create = this._create;
    }
    if (this._delete !== undefined) {
      hasAnyValues = true;
      internalValueResult.delete = this._delete;
    }
    if (this._update !== undefined) {
      hasAnyValues = true;
      internalValueResult.update = this._update;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(
    value: DynamodbTableReplicaTimeouts | cdktf.IResolvable | undefined,
  ) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this.resolvableValue = undefined;
      this._create = undefined;
      this._delete = undefined;
      this._update = undefined;
    } else if (cdktf.Tokenization.isResolvable(value)) {
      this.isEmptyObject = false;
      this.resolvableValue = value;
    } else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this.resolvableValue = undefined;
      this._create = value.create;
      this._delete = value.delete;
      this._update = value.update;
    }
  }

  // create - computed: false, optional: true, required: false
  private _create?: string;
  public get create() {
    return this.getStringAttribute('create');
  }
  public set create(value: string) {
    this._create = value;
  }
  public resetCreate() {
    this._create = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get createInput() {
    return this._create;
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

  // update - computed: false, optional: true, required: false
  private _update?: string;
  public get update() {
    return this.getStringAttribute('update');
  }
  public set update(value: string) {
    this._update = value;
  }
  public resetUpdate() {
    this._update = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get updateInput() {
    return this._update;
  }
}

/**
 * Represents a {@link https://www.terraform.io/docs/providers/aws/r/dynamodb_table_replica aws_dynamodb_table_replica}
 */
export class DynamodbTableReplicaA extends cdktf.TerraformResource {
  // =================
  // STATIC PROPERTIES
  // =================
  public static readonly tfResourceType = 'aws_dynamodb_table_replica';

  // ===========
  // INITIALIZER
  // ===========

  /**
   * Create a new {@link https://www.terraform.io/docs/providers/aws/r/dynamodb_table_replica aws_dynamodb_table_replica} Resource
   *
   * @param scope The scope in which to define this construct
   * @param id The scoped construct ID. Must be unique amongst siblings in the same scope
   * @param options DynamodbTableReplicaAConfig
   */
  public constructor(
    scope: Construct,
    id: string,
    config: DynamodbTableReplicaAConfig,
  ) {
    super(scope, id, {
      terraformResourceType: 'aws_dynamodb_table_replica',
      terraformGeneratorMetadata: {
        providerName: 'aws',
        providerVersion: '4.61.0',
        providerVersionConstraint: '4.61.0',
      },
      provider: config.provider,
      dependsOn: config.dependsOn,
      count: config.count,
      lifecycle: config.lifecycle,
      provisioners: config.provisioners,
      connection: config.connection,
      forEach: config.forEach,
    });
    this._globalTableArn = config.globalTableArn;
    this._id = config.id;
    this._kmsKeyArn = config.kmsKeyArn;
    this._pointInTimeRecovery = config.pointInTimeRecovery;
    this._tableClassOverride = config.tableClassOverride;
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

  // global_table_arn - computed: false, optional: false, required: true
  private _globalTableArn?: string;
  public get globalTableArn() {
    return this.getStringAttribute('global_table_arn');
  }
  public set globalTableArn(value: string) {
    this._globalTableArn = value;
  }
  // Temporarily expose input value. Use with caution.
  public get globalTableArnInput() {
    return this._globalTableArn;
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

  // kms_key_arn - computed: true, optional: true, required: false
  private _kmsKeyArn?: string;
  public get kmsKeyArn() {
    return this.getStringAttribute('kms_key_arn');
  }
  public set kmsKeyArn(value: string) {
    this._kmsKeyArn = value;
  }
  public resetKmsKeyArn() {
    this._kmsKeyArn = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get kmsKeyArnInput() {
    return this._kmsKeyArn;
  }

  // point_in_time_recovery - computed: false, optional: true, required: false
  private _pointInTimeRecovery?: boolean | cdktf.IResolvable;
  public get pointInTimeRecovery() {
    return this.getBooleanAttribute('point_in_time_recovery');
  }
  public set pointInTimeRecovery(value: boolean | cdktf.IResolvable) {
    this._pointInTimeRecovery = value;
  }
  public resetPointInTimeRecovery() {
    this._pointInTimeRecovery = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get pointInTimeRecoveryInput() {
    return this._pointInTimeRecovery;
  }

  // table_class_override - computed: false, optional: true, required: false
  private _tableClassOverride?: string;
  public get tableClassOverride() {
    return this.getStringAttribute('table_class_override');
  }
  public set tableClassOverride(value: string) {
    this._tableClassOverride = value;
  }
  public resetTableClassOverride() {
    this._tableClassOverride = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get tableClassOverrideInput() {
    return this._tableClassOverride;
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
  private _timeouts = new DynamodbTableReplicaTimeoutsOutputReference(
    this,
    'timeouts',
  );
  public get timeouts() {
    return this._timeouts;
  }
  public putTimeouts(value: DynamodbTableReplicaTimeouts) {
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
      global_table_arn: cdktf.stringToTerraform(this._globalTableArn),
      id: cdktf.stringToTerraform(this._id),
      kms_key_arn: cdktf.stringToTerraform(this._kmsKeyArn),
      point_in_time_recovery: cdktf.booleanToTerraform(
        this._pointInTimeRecovery,
      ),
      table_class_override: cdktf.stringToTerraform(this._tableClassOverride),
      tags: cdktf.hashMapper(cdktf.stringToTerraform)(this._tags),
      tags_all: cdktf.hashMapper(cdktf.stringToTerraform)(this._tagsAll),
      timeouts: dynamodbTableReplicaTimeoutsToTerraform(
        this._timeouts.internalValue,
      ),
    };
  }
}
