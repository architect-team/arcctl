// https://www.terraform.io/docs/providers/aws/d/lb
// generated from terraform resource schema
import * as cdktf from 'cdktf';
import { Construct } from 'constructs';

// Configuration

export interface DataAwsLbConfig extends cdktf.TerraformMetaArguments {
  /**
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/aws/d/lb#arn DataAwsLb#arn}
   */
  readonly arn?: string;
  /**
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/aws/d/lb#id DataAwsLb#id}
   *
   * Please be aware that the id field is automatically added to all resources in Terraform providers using a Terraform provider SDK version below 2.
   * If you experience problems setting this value it might not be settable. Please take a look at the provider documentation to ensure it should be settable.
   */
  readonly id?: string;
  /**
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/aws/d/lb#name DataAwsLb#name}
   */
  readonly name?: string;
  /**
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/aws/d/lb#tags DataAwsLb#tags}
   */
  readonly tags?: { [key: string]: string };
  /**
   * timeouts block
   *
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/aws/d/lb#timeouts DataAwsLb#timeouts}
   */
  readonly timeouts?: DataAwsLbTimeouts;
}
export interface DataAwsLbAccessLogs {}

export function dataAwsLbAccessLogsToTerraform(
  struct?: DataAwsLbAccessLogs,
): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) {
    return struct;
  }
  if (cdktf.isComplexElement(struct)) {
    throw new Error(
      'A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration',
    );
  }
  return {};
}

export class DataAwsLbAccessLogsOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;

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

  public get internalValue(): DataAwsLbAccessLogs | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: DataAwsLbAccessLogs | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
    } else {
      this.isEmptyObject = Object.keys(value).length === 0;
    }
  }

  // bucket - computed: true, optional: false, required: false
  public get bucket() {
    return this.getStringAttribute('bucket');
  }

  // enabled - computed: true, optional: false, required: false
  public get enabled() {
    return this.getBooleanAttribute('enabled');
  }

  // prefix - computed: true, optional: false, required: false
  public get prefix() {
    return this.getStringAttribute('prefix');
  }
}

export class DataAwsLbAccessLogsList extends cdktf.ComplexList {
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
  public get(index: number): DataAwsLbAccessLogsOutputReference {
    return new DataAwsLbAccessLogsOutputReference(
      this.terraformResource,
      this.terraformAttribute,
      index,
      this.wrapsSet,
    );
  }
}
export interface DataAwsLbSubnetMapping {}

export function dataAwsLbSubnetMappingToTerraform(
  struct?: DataAwsLbSubnetMapping,
): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) {
    return struct;
  }
  if (cdktf.isComplexElement(struct)) {
    throw new Error(
      'A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration',
    );
  }
  return {};
}

export class DataAwsLbSubnetMappingOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;

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

  public get internalValue(): DataAwsLbSubnetMapping | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: DataAwsLbSubnetMapping | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
    } else {
      this.isEmptyObject = Object.keys(value).length === 0;
    }
  }

  // allocation_id - computed: true, optional: false, required: false
  public get allocationId() {
    return this.getStringAttribute('allocation_id');
  }

  // ipv6_address - computed: true, optional: false, required: false
  public get ipv6Address() {
    return this.getStringAttribute('ipv6_address');
  }

  // outpost_id - computed: true, optional: false, required: false
  public get outpostId() {
    return this.getStringAttribute('outpost_id');
  }

  // private_ipv4_address - computed: true, optional: false, required: false
  public get privateIpv4Address() {
    return this.getStringAttribute('private_ipv4_address');
  }

  // subnet_id - computed: true, optional: false, required: false
  public get subnetId() {
    return this.getStringAttribute('subnet_id');
  }
}

export class DataAwsLbSubnetMappingList extends cdktf.ComplexList {
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
  public get(index: number): DataAwsLbSubnetMappingOutputReference {
    return new DataAwsLbSubnetMappingOutputReference(
      this.terraformResource,
      this.terraformAttribute,
      index,
      this.wrapsSet,
    );
  }
}
export interface DataAwsLbTimeouts {
  /**
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/aws/d/lb#read DataAwsLb#read}
   */
  readonly read?: string;
}

export function dataAwsLbTimeoutsToTerraform(
  struct?:
    | DataAwsLbTimeoutsOutputReference
    | DataAwsLbTimeouts
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

export class DataAwsLbTimeoutsOutputReference extends cdktf.ComplexObject {
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
    | DataAwsLbTimeouts
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
    value: DataAwsLbTimeouts | cdktf.IResolvable | undefined,
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
 * Represents a {@link https://www.terraform.io/docs/providers/aws/d/lb aws_lb}
 */
export class DataAwsLb extends cdktf.TerraformDataSource {
  // =================
  // STATIC PROPERTIES
  // =================
  public static readonly tfResourceType = 'aws_lb';

  // ===========
  // INITIALIZER
  // ===========

  /**
   * Create a new {@link https://www.terraform.io/docs/providers/aws/d/lb aws_lb} Data Source
   *
   * @param scope The scope in which to define this construct
   * @param id The scoped construct ID. Must be unique amongst siblings in the same scope
   * @param options DataAwsLbConfig = {}
   */
  public constructor(
    scope: Construct,
    id: string,
    config: DataAwsLbConfig = {},
  ) {
    super(scope, id, {
      terraformResourceType: 'aws_lb',
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
    this._arn = config.arn;
    this._id = config.id;
    this._name = config.name;
    this._tags = config.tags;
    this._timeouts.internalValue = config.timeouts;
  }

  // ==========
  // ATTRIBUTES
  // ==========

  // access_logs - computed: true, optional: false, required: false
  private _accessLogs = new DataAwsLbAccessLogsList(this, 'access_logs', false);
  public get accessLogs() {
    return this._accessLogs;
  }

  // arn - computed: true, optional: true, required: false
  private _arn?: string;
  public get arn() {
    return this.getStringAttribute('arn');
  }
  public set arn(value: string) {
    this._arn = value;
  }
  public resetArn() {
    this._arn = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get arnInput() {
    return this._arn;
  }

  // arn_suffix - computed: true, optional: false, required: false
  public get arnSuffix() {
    return this.getStringAttribute('arn_suffix');
  }

  // customer_owned_ipv4_pool - computed: true, optional: false, required: false
  public get customerOwnedIpv4Pool() {
    return this.getStringAttribute('customer_owned_ipv4_pool');
  }

  // desync_mitigation_mode - computed: true, optional: false, required: false
  public get desyncMitigationMode() {
    return this.getStringAttribute('desync_mitigation_mode');
  }

  // dns_name - computed: true, optional: false, required: false
  public get dnsName() {
    return this.getStringAttribute('dns_name');
  }

  // drop_invalid_header_fields - computed: true, optional: false, required: false
  public get dropInvalidHeaderFields() {
    return this.getBooleanAttribute('drop_invalid_header_fields');
  }

  // enable_cross_zone_load_balancing - computed: true, optional: false, required: false
  public get enableCrossZoneLoadBalancing() {
    return this.getBooleanAttribute('enable_cross_zone_load_balancing');
  }

  // enable_deletion_protection - computed: true, optional: false, required: false
  public get enableDeletionProtection() {
    return this.getBooleanAttribute('enable_deletion_protection');
  }

  // enable_http2 - computed: true, optional: false, required: false
  public get enableHttp2() {
    return this.getBooleanAttribute('enable_http2');
  }

  // enable_tls_version_and_cipher_suite_headers - computed: true, optional: false, required: false
  public get enableTlsVersionAndCipherSuiteHeaders() {
    return this.getBooleanAttribute(
      'enable_tls_version_and_cipher_suite_headers',
    );
  }

  // enable_waf_fail_open - computed: true, optional: false, required: false
  public get enableWafFailOpen() {
    return this.getBooleanAttribute('enable_waf_fail_open');
  }

  // enable_xff_client_port - computed: true, optional: false, required: false
  public get enableXffClientPort() {
    return this.getBooleanAttribute('enable_xff_client_port');
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

  // idle_timeout - computed: true, optional: false, required: false
  public get idleTimeout() {
    return this.getNumberAttribute('idle_timeout');
  }

  // internal - computed: true, optional: false, required: false
  public get internal() {
    return this.getBooleanAttribute('internal');
  }

  // ip_address_type - computed: true, optional: false, required: false
  public get ipAddressType() {
    return this.getStringAttribute('ip_address_type');
  }

  // load_balancer_type - computed: true, optional: false, required: false
  public get loadBalancerType() {
    return this.getStringAttribute('load_balancer_type');
  }

  // name - computed: true, optional: true, required: false
  private _name?: string;
  public get name() {
    return this.getStringAttribute('name');
  }
  public set name(value: string) {
    this._name = value;
  }
  public resetName() {
    this._name = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get nameInput() {
    return this._name;
  }

  // preserve_host_header - computed: true, optional: false, required: false
  public get preserveHostHeader() {
    return this.getBooleanAttribute('preserve_host_header');
  }

  // security_groups - computed: true, optional: false, required: false
  public get securityGroups() {
    return cdktf.Fn.tolist(this.getListAttribute('security_groups'));
  }

  // subnet_mapping - computed: true, optional: false, required: false
  private _subnetMapping = new DataAwsLbSubnetMappingList(
    this,
    'subnet_mapping',
    true,
  );
  public get subnetMapping() {
    return this._subnetMapping;
  }

  // subnets - computed: true, optional: false, required: false
  public get subnets() {
    return cdktf.Fn.tolist(this.getListAttribute('subnets'));
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

  // vpc_id - computed: true, optional: false, required: false
  public get vpcId() {
    return this.getStringAttribute('vpc_id');
  }

  // xff_header_processing_mode - computed: true, optional: false, required: false
  public get xffHeaderProcessingMode() {
    return this.getStringAttribute('xff_header_processing_mode');
  }

  // zone_id - computed: true, optional: false, required: false
  public get zoneId() {
    return this.getStringAttribute('zone_id');
  }

  // timeouts - computed: false, optional: true, required: false
  private _timeouts = new DataAwsLbTimeoutsOutputReference(this, 'timeouts');
  public get timeouts() {
    return this._timeouts;
  }
  public putTimeouts(value: DataAwsLbTimeouts) {
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
      arn: cdktf.stringToTerraform(this._arn),
      id: cdktf.stringToTerraform(this._id),
      name: cdktf.stringToTerraform(this._name),
      tags: cdktf.hashMapper(cdktf.stringToTerraform)(this._tags),
      timeouts: dataAwsLbTimeoutsToTerraform(this._timeouts.internalValue),
    };
  }
}
