// https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/data-sources/loadbalancer
// generated from terraform resource schema

import { Construct } from 'constructs';
import * as cdktf from 'cdktf';

// Configuration

export interface DataDigitaloceanLoadbalancerConfig extends cdktf.TerraformMetaArguments {
  /**
  * id of the load balancer
  * 
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/data-sources/loadbalancer#id DataDigitaloceanLoadbalancer#id}
  *
  * Please be aware that the id field is automatically added to all resources in Terraform providers using a Terraform provider SDK version below 2.
  * If you experience problems setting this value it might not be settable. Please take a look at the provider documentation to ensure it should be settable.
  */
  readonly id?: string;
  /**
  * name of the load balancer
  * 
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/data-sources/loadbalancer#name DataDigitaloceanLoadbalancer#name}
  */
  readonly name?: string;
}
export interface DataDigitaloceanLoadbalancerFirewall {
}

export function dataDigitaloceanLoadbalancerFirewallToTerraform(struct?: DataDigitaloceanLoadbalancerFirewall): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
  }
}

export class DataDigitaloceanLoadbalancerFirewallOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  * @param complexObjectIndex the index of this item in the list
  * @param complexObjectIsFromSet whether the list is wrapping a set (will add tolist() to be able to access an item via an index)
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string, complexObjectIndex: number, complexObjectIsFromSet: boolean) {
    super(terraformResource, terraformAttribute, complexObjectIsFromSet, complexObjectIndex);
  }

  public get internalValue(): DataDigitaloceanLoadbalancerFirewall | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: DataDigitaloceanLoadbalancerFirewall | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
    }
  }

  // allow - computed: true, optional: false, required: false
  public get allow() {
    return cdktf.Fn.tolist(this.getListAttribute('allow'));
  }

  // deny - computed: true, optional: false, required: false
  public get deny() {
    return cdktf.Fn.tolist(this.getListAttribute('deny'));
  }
}

export class DataDigitaloceanLoadbalancerFirewallList extends cdktf.ComplexList {

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  * @param wrapsSet whether the list is wrapping a set (will add tolist() to be able to access an item via an index)
  */
  constructor(protected terraformResource: cdktf.IInterpolatingParent, protected terraformAttribute: string, protected wrapsSet: boolean) {
    super(terraformResource, terraformAttribute, wrapsSet)
  }

  /**
  * @param index the index of the item to return
  */
  public get(index: number): DataDigitaloceanLoadbalancerFirewallOutputReference {
    return new DataDigitaloceanLoadbalancerFirewallOutputReference(this.terraformResource, this.terraformAttribute, index, this.wrapsSet);
  }
}
export interface DataDigitaloceanLoadbalancerForwardingRule {
}

export function dataDigitaloceanLoadbalancerForwardingRuleToTerraform(struct?: DataDigitaloceanLoadbalancerForwardingRule): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
  }
}

export class DataDigitaloceanLoadbalancerForwardingRuleOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  * @param complexObjectIndex the index of this item in the list
  * @param complexObjectIsFromSet whether the list is wrapping a set (will add tolist() to be able to access an item via an index)
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string, complexObjectIndex: number, complexObjectIsFromSet: boolean) {
    super(terraformResource, terraformAttribute, complexObjectIsFromSet, complexObjectIndex);
  }

  public get internalValue(): DataDigitaloceanLoadbalancerForwardingRule | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: DataDigitaloceanLoadbalancerForwardingRule | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
    }
  }

  // certificate_id - computed: true, optional: false, required: false
  public get certificateId() {
    return this.getStringAttribute('certificate_id');
  }

  // certificate_name - computed: true, optional: false, required: false
  public get certificateName() {
    return this.getStringAttribute('certificate_name');
  }

  // entry_port - computed: true, optional: false, required: false
  public get entryPort() {
    return this.getNumberAttribute('entry_port');
  }

  // entry_protocol - computed: true, optional: false, required: false
  public get entryProtocol() {
    return this.getStringAttribute('entry_protocol');
  }

  // target_port - computed: true, optional: false, required: false
  public get targetPort() {
    return this.getNumberAttribute('target_port');
  }

  // target_protocol - computed: true, optional: false, required: false
  public get targetProtocol() {
    return this.getStringAttribute('target_protocol');
  }

  // tls_passthrough - computed: true, optional: false, required: false
  public get tlsPassthrough() {
    return this.getBooleanAttribute('tls_passthrough');
  }
}

export class DataDigitaloceanLoadbalancerForwardingRuleList extends cdktf.ComplexList {

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  * @param wrapsSet whether the list is wrapping a set (will add tolist() to be able to access an item via an index)
  */
  constructor(protected terraformResource: cdktf.IInterpolatingParent, protected terraformAttribute: string, protected wrapsSet: boolean) {
    super(terraformResource, terraformAttribute, wrapsSet)
  }

  /**
  * @param index the index of the item to return
  */
  public get(index: number): DataDigitaloceanLoadbalancerForwardingRuleOutputReference {
    return new DataDigitaloceanLoadbalancerForwardingRuleOutputReference(this.terraformResource, this.terraformAttribute, index, this.wrapsSet);
  }
}
export interface DataDigitaloceanLoadbalancerHealthcheck {
}

export function dataDigitaloceanLoadbalancerHealthcheckToTerraform(struct?: DataDigitaloceanLoadbalancerHealthcheck): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
  }
}

export class DataDigitaloceanLoadbalancerHealthcheckOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  * @param complexObjectIndex the index of this item in the list
  * @param complexObjectIsFromSet whether the list is wrapping a set (will add tolist() to be able to access an item via an index)
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string, complexObjectIndex: number, complexObjectIsFromSet: boolean) {
    super(terraformResource, terraformAttribute, complexObjectIsFromSet, complexObjectIndex);
  }

  public get internalValue(): DataDigitaloceanLoadbalancerHealthcheck | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: DataDigitaloceanLoadbalancerHealthcheck | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
    }
  }

  // check_interval_seconds - computed: true, optional: false, required: false
  public get checkIntervalSeconds() {
    return this.getNumberAttribute('check_interval_seconds');
  }

  // healthy_threshold - computed: true, optional: false, required: false
  public get healthyThreshold() {
    return this.getNumberAttribute('healthy_threshold');
  }

  // path - computed: true, optional: false, required: false
  public get path() {
    return this.getStringAttribute('path');
  }

  // port - computed: true, optional: false, required: false
  public get port() {
    return this.getNumberAttribute('port');
  }

  // protocol - computed: true, optional: false, required: false
  public get protocol() {
    return this.getStringAttribute('protocol');
  }

  // response_timeout_seconds - computed: true, optional: false, required: false
  public get responseTimeoutSeconds() {
    return this.getNumberAttribute('response_timeout_seconds');
  }

  // unhealthy_threshold - computed: true, optional: false, required: false
  public get unhealthyThreshold() {
    return this.getNumberAttribute('unhealthy_threshold');
  }
}

export class DataDigitaloceanLoadbalancerHealthcheckList extends cdktf.ComplexList {

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  * @param wrapsSet whether the list is wrapping a set (will add tolist() to be able to access an item via an index)
  */
  constructor(protected terraformResource: cdktf.IInterpolatingParent, protected terraformAttribute: string, protected wrapsSet: boolean) {
    super(terraformResource, terraformAttribute, wrapsSet)
  }

  /**
  * @param index the index of the item to return
  */
  public get(index: number): DataDigitaloceanLoadbalancerHealthcheckOutputReference {
    return new DataDigitaloceanLoadbalancerHealthcheckOutputReference(this.terraformResource, this.terraformAttribute, index, this.wrapsSet);
  }
}
export interface DataDigitaloceanLoadbalancerStickySessions {
}

export function dataDigitaloceanLoadbalancerStickySessionsToTerraform(struct?: DataDigitaloceanLoadbalancerStickySessions): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
  }
}

export class DataDigitaloceanLoadbalancerStickySessionsOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  * @param complexObjectIndex the index of this item in the list
  * @param complexObjectIsFromSet whether the list is wrapping a set (will add tolist() to be able to access an item via an index)
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string, complexObjectIndex: number, complexObjectIsFromSet: boolean) {
    super(terraformResource, terraformAttribute, complexObjectIsFromSet, complexObjectIndex);
  }

  public get internalValue(): DataDigitaloceanLoadbalancerStickySessions | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: DataDigitaloceanLoadbalancerStickySessions | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
    }
  }

  // cookie_name - computed: true, optional: false, required: false
  public get cookieName() {
    return this.getStringAttribute('cookie_name');
  }

  // cookie_ttl_seconds - computed: true, optional: false, required: false
  public get cookieTtlSeconds() {
    return this.getNumberAttribute('cookie_ttl_seconds');
  }

  // type - computed: true, optional: false, required: false
  public get type() {
    return this.getStringAttribute('type');
  }
}

export class DataDigitaloceanLoadbalancerStickySessionsList extends cdktf.ComplexList {

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  * @param wrapsSet whether the list is wrapping a set (will add tolist() to be able to access an item via an index)
  */
  constructor(protected terraformResource: cdktf.IInterpolatingParent, protected terraformAttribute: string, protected wrapsSet: boolean) {
    super(terraformResource, terraformAttribute, wrapsSet)
  }

  /**
  * @param index the index of the item to return
  */
  public get(index: number): DataDigitaloceanLoadbalancerStickySessionsOutputReference {
    return new DataDigitaloceanLoadbalancerStickySessionsOutputReference(this.terraformResource, this.terraformAttribute, index, this.wrapsSet);
  }
}

/**
* Represents a {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/data-sources/loadbalancer digitalocean_loadbalancer}
*/
export class DataDigitaloceanLoadbalancer extends cdktf.TerraformDataSource {

  // =================
  // STATIC PROPERTIES
  // =================
  public static readonly tfResourceType = "digitalocean_loadbalancer";

  // ===========
  // INITIALIZER
  // ===========

  /**
  * Create a new {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/data-sources/loadbalancer digitalocean_loadbalancer} Data Source
  *
  * @param scope The scope in which to define this construct
  * @param id The scoped construct ID. Must be unique amongst siblings in the same scope
  * @param options DataDigitaloceanLoadbalancerConfig = {}
  */
  public constructor(scope: Construct, id: string, config: DataDigitaloceanLoadbalancerConfig = {}) {
    super(scope, id, {
      terraformResourceType: 'digitalocean_loadbalancer',
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
    this._name = config.name;
  }

  // ==========
  // ATTRIBUTES
  // ==========

  // algorithm - computed: true, optional: false, required: false
  public get algorithm() {
    return this.getStringAttribute('algorithm');
  }

  // disable_lets_encrypt_dns_records - computed: true, optional: false, required: false
  public get disableLetsEncryptDnsRecords() {
    return this.getBooleanAttribute('disable_lets_encrypt_dns_records');
  }

  // droplet_ids - computed: true, optional: false, required: false
  public get dropletIds() {
    return cdktf.Token.asNumberList(cdktf.Fn.tolist(this.getNumberListAttribute('droplet_ids')));
  }

  // droplet_tag - computed: true, optional: false, required: false
  public get dropletTag() {
    return this.getStringAttribute('droplet_tag');
  }

  // enable_backend_keepalive - computed: true, optional: false, required: false
  public get enableBackendKeepalive() {
    return this.getBooleanAttribute('enable_backend_keepalive');
  }

  // enable_proxy_protocol - computed: true, optional: false, required: false
  public get enableProxyProtocol() {
    return this.getBooleanAttribute('enable_proxy_protocol');
  }

  // firewall - computed: true, optional: false, required: false
  private _firewall = new DataDigitaloceanLoadbalancerFirewallList(this, "firewall", false);
  public get firewall() {
    return this._firewall;
  }

  // forwarding_rule - computed: true, optional: false, required: false
  private _forwardingRule = new DataDigitaloceanLoadbalancerForwardingRuleList(this, "forwarding_rule", true);
  public get forwardingRule() {
    return this._forwardingRule;
  }

  // healthcheck - computed: true, optional: false, required: false
  private _healthcheck = new DataDigitaloceanLoadbalancerHealthcheckList(this, "healthcheck", false);
  public get healthcheck() {
    return this._healthcheck;
  }

  // http_idle_timeout_seconds - computed: true, optional: false, required: false
  public get httpIdleTimeoutSeconds() {
    return this.getNumberAttribute('http_idle_timeout_seconds');
  }

  // id - computed: false, optional: true, required: false
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

  // ip - computed: true, optional: false, required: false
  public get ip() {
    return this.getStringAttribute('ip');
  }

  // name - computed: false, optional: true, required: false
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

  // project_id - computed: true, optional: false, required: false
  public get projectId() {
    return this.getStringAttribute('project_id');
  }

  // redirect_http_to_https - computed: true, optional: false, required: false
  public get redirectHttpToHttps() {
    return this.getBooleanAttribute('redirect_http_to_https');
  }

  // region - computed: true, optional: false, required: false
  public get region() {
    return this.getStringAttribute('region');
  }

  // size - computed: true, optional: false, required: false
  public get size() {
    return this.getStringAttribute('size');
  }

  // size_unit - computed: true, optional: false, required: false
  public get sizeUnit() {
    return this.getNumberAttribute('size_unit');
  }

  // status - computed: true, optional: false, required: false
  public get status() {
    return this.getStringAttribute('status');
  }

  // sticky_sessions - computed: true, optional: false, required: false
  private _stickySessions = new DataDigitaloceanLoadbalancerStickySessionsList(this, "sticky_sessions", false);
  public get stickySessions() {
    return this._stickySessions;
  }

  // urn - computed: true, optional: false, required: false
  public get urn() {
    return this.getStringAttribute('urn');
  }

  // vpc_uuid - computed: true, optional: false, required: false
  public get vpcUuid() {
    return this.getStringAttribute('vpc_uuid');
  }

  // =========
  // SYNTHESIS
  // =========

  protected synthesizeAttributes(): { [name: string]: any } {
    return {
      id: cdktf.stringToTerraform(this._id),
      name: cdktf.stringToTerraform(this._name),
    };
  }
}
