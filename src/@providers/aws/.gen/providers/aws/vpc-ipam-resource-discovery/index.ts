// https://www.terraform.io/docs/providers/aws/r/vpc_ipam_resource_discovery
// generated from terraform resource schema
import * as cdktf from 'cdktf';
import { Construct } from 'constructs';

// Configuration

export interface VpcIpamResourceDiscoveryConfig
  extends cdktf.TerraformMetaArguments {
  /**
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/aws/r/vpc_ipam_resource_discovery#description VpcIpamResourceDiscovery#description}
   */
  readonly description?: string;
  /**
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/aws/r/vpc_ipam_resource_discovery#id VpcIpamResourceDiscovery#id}
   *
   * Please be aware that the id field is automatically added to all resources in Terraform providers using a Terraform provider SDK version below 2.
   * If you experience problems setting this value it might not be settable. Please take a look at the provider documentation to ensure it should be settable.
   */
  readonly id?: string;
  /**
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/aws/r/vpc_ipam_resource_discovery#tags VpcIpamResourceDiscovery#tags}
   */
  readonly tags?: { [key: string]: string };
  /**
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/aws/r/vpc_ipam_resource_discovery#tags_all VpcIpamResourceDiscovery#tags_all}
   */
  readonly tagsAll?: { [key: string]: string };
  /**
   * operating_regions block
   *
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/aws/r/vpc_ipam_resource_discovery#operating_regions VpcIpamResourceDiscovery#operating_regions}
   */
  readonly operatingRegions:
    | VpcIpamResourceDiscoveryOperatingRegions[]
    | cdktf.IResolvable;
  /**
   * timeouts block
   *
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/aws/r/vpc_ipam_resource_discovery#timeouts VpcIpamResourceDiscovery#timeouts}
   */
  readonly timeouts?: VpcIpamResourceDiscoveryTimeouts;
}
export interface VpcIpamResourceDiscoveryOperatingRegions {
  /**
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/aws/r/vpc_ipam_resource_discovery#region_name VpcIpamResourceDiscovery#region_name}
   */
  readonly regionName: string;
}

export function vpcIpamResourceDiscoveryOperatingRegionsToTerraform(
  struct?: VpcIpamResourceDiscoveryOperatingRegions | cdktf.IResolvable,
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
    region_name: cdktf.stringToTerraform(struct!.regionName),
  };
}

export class VpcIpamResourceDiscoveryOperatingRegionsOutputReference extends cdktf.ComplexObject {
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
    | VpcIpamResourceDiscoveryOperatingRegions
    | cdktf.IResolvable
    | undefined {
    if (this.resolvableValue) {
      return this.resolvableValue;
    }
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._regionName !== undefined) {
      hasAnyValues = true;
      internalValueResult.regionName = this._regionName;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(
    value:
      | VpcIpamResourceDiscoveryOperatingRegions
      | cdktf.IResolvable
      | undefined,
  ) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this.resolvableValue = undefined;
      this._regionName = undefined;
    } else if (cdktf.Tokenization.isResolvable(value)) {
      this.isEmptyObject = false;
      this.resolvableValue = value;
    } else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this.resolvableValue = undefined;
      this._regionName = value.regionName;
    }
  }

  // region_name - computed: false, optional: false, required: true
  private _regionName?: string;
  public get regionName() {
    return this.getStringAttribute('region_name');
  }
  public set regionName(value: string) {
    this._regionName = value;
  }
  // Temporarily expose input value. Use with caution.
  public get regionNameInput() {
    return this._regionName;
  }
}

export class VpcIpamResourceDiscoveryOperatingRegionsList extends cdktf.ComplexList {
  public internalValue?:
    | VpcIpamResourceDiscoveryOperatingRegions[]
    | cdktf.IResolvable;

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
  public get(
    index: number,
  ): VpcIpamResourceDiscoveryOperatingRegionsOutputReference {
    return new VpcIpamResourceDiscoveryOperatingRegionsOutputReference(
      this.terraformResource,
      this.terraformAttribute,
      index,
      this.wrapsSet,
    );
  }
}
export interface VpcIpamResourceDiscoveryTimeouts {
  /**
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/aws/r/vpc_ipam_resource_discovery#create VpcIpamResourceDiscovery#create}
   */
  readonly create?: string;
  /**
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/aws/r/vpc_ipam_resource_discovery#delete VpcIpamResourceDiscovery#delete}
   */
  readonly delete?: string;
  /**
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/aws/r/vpc_ipam_resource_discovery#update VpcIpamResourceDiscovery#update}
   */
  readonly update?: string;
}

export function vpcIpamResourceDiscoveryTimeoutsToTerraform(
  struct?:
    | VpcIpamResourceDiscoveryTimeoutsOutputReference
    | VpcIpamResourceDiscoveryTimeouts
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

export class VpcIpamResourceDiscoveryTimeoutsOutputReference extends cdktf.ComplexObject {
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
    | VpcIpamResourceDiscoveryTimeouts
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
    value: VpcIpamResourceDiscoveryTimeouts | cdktf.IResolvable | undefined,
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
 * Represents a {@link https://www.terraform.io/docs/providers/aws/r/vpc_ipam_resource_discovery aws_vpc_ipam_resource_discovery}
 */
export class VpcIpamResourceDiscovery extends cdktf.TerraformResource {
  // =================
  // STATIC PROPERTIES
  // =================
  public static readonly tfResourceType = 'aws_vpc_ipam_resource_discovery';

  // ===========
  // INITIALIZER
  // ===========

  /**
   * Create a new {@link https://www.terraform.io/docs/providers/aws/r/vpc_ipam_resource_discovery aws_vpc_ipam_resource_discovery} Resource
   *
   * @param scope The scope in which to define this construct
   * @param id The scoped construct ID. Must be unique amongst siblings in the same scope
   * @param options VpcIpamResourceDiscoveryConfig
   */
  public constructor(
    scope: Construct,
    id: string,
    config: VpcIpamResourceDiscoveryConfig,
  ) {
    super(scope, id, {
      terraformResourceType: 'aws_vpc_ipam_resource_discovery',
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
    this._description = config.description;
    this._id = config.id;
    this._tags = config.tags;
    this._tagsAll = config.tagsAll;
    this._operatingRegions.internalValue = config.operatingRegions;
    this._timeouts.internalValue = config.timeouts;
  }

  // ==========
  // ATTRIBUTES
  // ==========

  // arn - computed: true, optional: false, required: false
  public get arn() {
    return this.getStringAttribute('arn');
  }

  // description - computed: false, optional: true, required: false
  private _description?: string;
  public get description() {
    return this.getStringAttribute('description');
  }
  public set description(value: string) {
    this._description = value;
  }
  public resetDescription() {
    this._description = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get descriptionInput() {
    return this._description;
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

  // ipam_resource_discovery_region - computed: true, optional: false, required: false
  public get ipamResourceDiscoveryRegion() {
    return this.getStringAttribute('ipam_resource_discovery_region');
  }

  // is_default - computed: true, optional: false, required: false
  public get isDefault() {
    return this.getBooleanAttribute('is_default');
  }

  // owner_id - computed: true, optional: false, required: false
  public get ownerId() {
    return this.getStringAttribute('owner_id');
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

  // operating_regions - computed: false, optional: false, required: true
  private _operatingRegions = new VpcIpamResourceDiscoveryOperatingRegionsList(
    this,
    'operating_regions',
    true,
  );
  public get operatingRegions() {
    return this._operatingRegions;
  }
  public putOperatingRegions(
    value: VpcIpamResourceDiscoveryOperatingRegions[] | cdktf.IResolvable,
  ) {
    this._operatingRegions.internalValue = value;
  }
  // Temporarily expose input value. Use with caution.
  public get operatingRegionsInput() {
    return this._operatingRegions.internalValue;
  }

  // timeouts - computed: false, optional: true, required: false
  private _timeouts = new VpcIpamResourceDiscoveryTimeoutsOutputReference(
    this,
    'timeouts',
  );
  public get timeouts() {
    return this._timeouts;
  }
  public putTimeouts(value: VpcIpamResourceDiscoveryTimeouts) {
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
      description: cdktf.stringToTerraform(this._description),
      id: cdktf.stringToTerraform(this._id),
      tags: cdktf.hashMapper(cdktf.stringToTerraform)(this._tags),
      tags_all: cdktf.hashMapper(cdktf.stringToTerraform)(this._tagsAll),
      operating_regions: cdktf.listMapper(
        vpcIpamResourceDiscoveryOperatingRegionsToTerraform,
        true,
      )(this._operatingRegions.internalValue),
      timeouts: vpcIpamResourceDiscoveryTimeoutsToTerraform(
        this._timeouts.internalValue,
      ),
    };
  }
}
