// https://www.terraform.io/docs/providers/aws/d/ec2_host
// generated from terraform resource schema

import { Construct } from 'npm:constructs';
import * as cdktf from 'npm:cdktf';

// Configuration

export interface DataAwsEc2HostConfig extends cdktf.TerraformMetaArguments {
  /**
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/aws/d/ec2_host#host_id DataAwsEc2Host#host_id}
   */
  readonly hostId?: string;
  /**
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/aws/d/ec2_host#id DataAwsEc2Host#id}
   *
   * Please be aware that the id field is automatically added to all resources in Terraform providers using a Terraform provider SDK version below 2.
   * If you experience problems setting this value it might not be settable. Please take a look at the provider documentation to ensure it should be settable.
   */
  readonly id?: string;
  /**
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/aws/d/ec2_host#tags DataAwsEc2Host#tags}
   */
  readonly tags?: { [key: string]: string };
  /**
   * filter block
   *
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/aws/d/ec2_host#filter DataAwsEc2Host#filter}
   */
  readonly filter?: DataAwsEc2HostFilter[] | cdktf.IResolvable;
  /**
   * timeouts block
   *
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/aws/d/ec2_host#timeouts DataAwsEc2Host#timeouts}
   */
  readonly timeouts?: DataAwsEc2HostTimeouts;
}
export interface DataAwsEc2HostFilter {
  /**
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/aws/d/ec2_host#name DataAwsEc2Host#name}
   */
  readonly name: string;
  /**
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/aws/d/ec2_host#values DataAwsEc2Host#values}
   */
  readonly values: string[];
}

export function dataAwsEc2HostFilterToTerraform(
  struct?: DataAwsEc2HostFilter | cdktf.IResolvable,
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
    name: cdktf.stringToTerraform(struct!.name),
    values: cdktf.listMapper(cdktf.stringToTerraform, false)(struct!.values),
  };
}

export class DataAwsEc2HostFilterOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;
  private resolvableValue?: cdktf.IResolvable;

  /**
   * @param terraformResource The parent resource
   * @param terraformAttribute The attribute on the parent resource this class is referencing
   * @param complexObjectIndex the index of this item in the list
   * @param complexObjectIsFromSet whether the list is wrapping a set (will add tolist() to be able to access an item via an index)
   */
  public constructor(
    terraformResource: cdktf.IInterpolatingParent,
    terraformAttribute: string,
    complexObjectIndex: number,
    complexObjectIsFromSet: boolean,
  ) {
    super(
      terraformResource,
      terraformAttribute,
      complexObjectIsFromSet,
      complexObjectIndex,
    );
  }

  public get internalValue():
    | DataAwsEc2HostFilter
    | cdktf.IResolvable
    | undefined {
    if (this.resolvableValue) {
      return this.resolvableValue;
    }
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._name !== undefined) {
      hasAnyValues = true;
      internalValueResult.name = this._name;
    }
    if (this._values !== undefined) {
      hasAnyValues = true;
      internalValueResult.values = this._values;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(
    value: DataAwsEc2HostFilter | cdktf.IResolvable | undefined,
  ) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this.resolvableValue = undefined;
      this._name = undefined;
      this._values = undefined;
    } else if (cdktf.Tokenization.isResolvable(value)) {
      this.isEmptyObject = false;
      this.resolvableValue = value;
    } else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this.resolvableValue = undefined;
      this._name = value.name;
      this._values = value.values;
    }
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

  // values - computed: false, optional: false, required: true
  private _values?: string[];
  public get values() {
    return this.getListAttribute('values');
  }
  public set values(value: string[]) {
    this._values = value;
  }
  // Temporarily expose input value. Use with caution.
  public get valuesInput() {
    return this._values;
  }
}

export class DataAwsEc2HostFilterList extends cdktf.ComplexList {
  public internalValue?: DataAwsEc2HostFilter[] | cdktf.IResolvable;

  /**
   * @param terraformResource The parent resource
   * @param terraformAttribute The attribute on the parent resource this class is referencing
   * @param wrapsSet whether the list is wrapping a set (will add tolist() to be able to access an item via an index)
   */
  constructor(
    protected terraformResource: cdktf.IInterpolatingParent,
    protected terraformAttribute: string,
    protected wrapsSet: boolean,
  ) {
    super(terraformResource, terraformAttribute, wrapsSet);
  }

  /**
   * @param index the index of the item to return
   */
  public get(index: number): DataAwsEc2HostFilterOutputReference {
    return new DataAwsEc2HostFilterOutputReference(
      this.terraformResource,
      this.terraformAttribute,
      index,
      this.wrapsSet,
    );
  }
}
export interface DataAwsEc2HostTimeouts {
  /**
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/aws/d/ec2_host#read DataAwsEc2Host#read}
   */
  readonly read?: string;
}

export function dataAwsEc2HostTimeoutsToTerraform(
  struct?:
    | DataAwsEc2HostTimeoutsOutputReference
    | DataAwsEc2HostTimeouts
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
    read: cdktf.stringToTerraform(struct!.read),
  };
}

export class DataAwsEc2HostTimeoutsOutputReference extends cdktf.ComplexObject {
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
    | DataAwsEc2HostTimeouts
    | cdktf.IResolvable
    | undefined {
    if (this.resolvableValue) {
      return this.resolvableValue;
    }
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._read !== undefined) {
      hasAnyValues = true;
      internalValueResult.read = this._read;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(
    value: DataAwsEc2HostTimeouts | cdktf.IResolvable | undefined,
  ) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this.resolvableValue = undefined;
      this._read = undefined;
    } else if (cdktf.Tokenization.isResolvable(value)) {
      this.isEmptyObject = false;
      this.resolvableValue = value;
    } else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this.resolvableValue = undefined;
      this._read = value.read;
    }
  }

  // read - computed: false, optional: true, required: false
  private _read?: string;
  public get read() {
    return this.getStringAttribute('read');
  }
  public set read(value: string) {
    this._read = value;
  }
  public resetRead() {
    this._read = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get readInput() {
    return this._read;
  }
}

/**
 * Represents a {@link https://www.terraform.io/docs/providers/aws/d/ec2_host aws_ec2_host}
 */
export class DataAwsEc2Host extends cdktf.TerraformDataSource {
  // =================
  // STATIC PROPERTIES
  // =================
  public static readonly tfResourceType = 'aws_ec2_host';

  // ===========
  // INITIALIZER
  // ===========

  /**
   * Create a new {@link https://www.terraform.io/docs/providers/aws/d/ec2_host aws_ec2_host} Data Source
   *
   * @param scope The scope in which to define this construct
   * @param id The scoped construct ID. Must be unique amongst siblings in the same scope
   * @param options DataAwsEc2HostConfig = {}
   */
  public constructor(
    scope: Construct,
    id: string,
    config: DataAwsEc2HostConfig = {},
  ) {
    super(scope, id, {
      terraformResourceType: 'aws_ec2_host',
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
    this._hostId = config.hostId;
    this._id = config.id;
    this._tags = config.tags;
    this._filter.internalValue = config.filter;
    this._timeouts.internalValue = config.timeouts;
  }

  // ==========
  // ATTRIBUTES
  // ==========

  // arn - computed: true, optional: false, required: false
  public get arn() {
    return this.getStringAttribute('arn');
  }

  // auto_placement - computed: true, optional: false, required: false
  public get autoPlacement() {
    return this.getStringAttribute('auto_placement');
  }

  // availability_zone - computed: true, optional: false, required: false
  public get availabilityZone() {
    return this.getStringAttribute('availability_zone');
  }

  // cores - computed: true, optional: false, required: false
  public get cores() {
    return this.getNumberAttribute('cores');
  }

  // host_id - computed: true, optional: true, required: false
  private _hostId?: string;
  public get hostId() {
    return this.getStringAttribute('host_id');
  }
  public set hostId(value: string) {
    this._hostId = value;
  }
  public resetHostId() {
    this._hostId = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get hostIdInput() {
    return this._hostId;
  }

  // host_recovery - computed: true, optional: false, required: false
  public get hostRecovery() {
    return this.getStringAttribute('host_recovery');
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

  // instance_family - computed: true, optional: false, required: false
  public get instanceFamily() {
    return this.getStringAttribute('instance_family');
  }

  // instance_type - computed: true, optional: false, required: false
  public get instanceType() {
    return this.getStringAttribute('instance_type');
  }

  // outpost_arn - computed: true, optional: false, required: false
  public get outpostArn() {
    return this.getStringAttribute('outpost_arn');
  }

  // owner_id - computed: true, optional: false, required: false
  public get ownerId() {
    return this.getStringAttribute('owner_id');
  }

  // sockets - computed: true, optional: false, required: false
  public get sockets() {
    return this.getNumberAttribute('sockets');
  }

  // tags - computed: true, optional: true, required: false
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

  // total_vcpus - computed: true, optional: false, required: false
  public get totalVcpus() {
    return this.getNumberAttribute('total_vcpus');
  }

  // filter - computed: false, optional: true, required: false
  private _filter = new DataAwsEc2HostFilterList(this, 'filter', true);
  public get filter() {
    return this._filter;
  }
  public putFilter(value: DataAwsEc2HostFilter[] | cdktf.IResolvable) {
    this._filter.internalValue = value;
  }
  public resetFilter() {
    this._filter.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get filterInput() {
    return this._filter.internalValue;
  }

  // timeouts - computed: false, optional: true, required: false
  private _timeouts = new DataAwsEc2HostTimeoutsOutputReference(
    this,
    'timeouts',
  );
  public get timeouts() {
    return this._timeouts;
  }
  public putTimeouts(value: DataAwsEc2HostTimeouts) {
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
      host_id: cdktf.stringToTerraform(this._hostId),
      id: cdktf.stringToTerraform(this._id),
      tags: cdktf.hashMapper(cdktf.stringToTerraform)(this._tags),
      filter: cdktf.listMapper(
        dataAwsEc2HostFilterToTerraform,
        true,
      )(this._filter.internalValue),
      timeouts: dataAwsEc2HostTimeoutsToTerraform(this._timeouts.internalValue),
    };
  }
}
