// https://www.terraform.io/docs/providers/digitalocean/r/loadbalancer
// generated from terraform resource schema

import { Construct } from 'constructs';
import * as cdktf from 'cdktf';

// Configuration

export interface LoadbalancerConfig extends cdktf.TerraformMetaArguments {
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/loadbalancer#algorithm Loadbalancer#algorithm}
  */
  readonly algorithm?: string;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/loadbalancer#disable_lets_encrypt_dns_records Loadbalancer#disable_lets_encrypt_dns_records}
  */
  readonly disableLetsEncryptDnsRecords?: boolean | cdktf.IResolvable;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/loadbalancer#droplet_ids Loadbalancer#droplet_ids}
  */
  readonly dropletIds?: number[];
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/loadbalancer#droplet_tag Loadbalancer#droplet_tag}
  */
  readonly dropletTag?: string;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/loadbalancer#enable_backend_keepalive Loadbalancer#enable_backend_keepalive}
  */
  readonly enableBackendKeepalive?: boolean | cdktf.IResolvable;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/loadbalancer#enable_proxy_protocol Loadbalancer#enable_proxy_protocol}
  */
  readonly enableProxyProtocol?: boolean | cdktf.IResolvable;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/loadbalancer#http_idle_timeout_seconds Loadbalancer#http_idle_timeout_seconds}
  */
  readonly httpIdleTimeoutSeconds?: number;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/loadbalancer#id Loadbalancer#id}
  *
  * Please be aware that the id field is automatically added to all resources in Terraform providers using a Terraform provider SDK version below 2.
  * If you experience problems setting this value it might not be settable. Please take a look at the provider documentation to ensure it should be settable.
  */
  readonly id?: string;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/loadbalancer#name Loadbalancer#name}
  */
  readonly name: string;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/loadbalancer#project_id Loadbalancer#project_id}
  */
  readonly projectId?: string;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/loadbalancer#redirect_http_to_https Loadbalancer#redirect_http_to_https}
  */
  readonly redirectHttpToHttps?: boolean | cdktf.IResolvable;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/loadbalancer#region Loadbalancer#region}
  */
  readonly region: string;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/loadbalancer#size Loadbalancer#size}
  */
  readonly size?: string;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/loadbalancer#size_unit Loadbalancer#size_unit}
  */
  readonly sizeUnit?: number;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/loadbalancer#vpc_uuid Loadbalancer#vpc_uuid}
  */
  readonly vpcUuid?: string;
  /**
  * firewall block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/loadbalancer#firewall Loadbalancer#firewall}
  */
  readonly firewall?: LoadbalancerFirewall;
  /**
  * forwarding_rule block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/loadbalancer#forwarding_rule Loadbalancer#forwarding_rule}
  */
  readonly forwardingRule: LoadbalancerForwardingRule[] | cdktf.IResolvable;
  /**
  * healthcheck block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/loadbalancer#healthcheck Loadbalancer#healthcheck}
  */
  readonly healthcheck?: LoadbalancerHealthcheck;
  /**
  * sticky_sessions block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/loadbalancer#sticky_sessions Loadbalancer#sticky_sessions}
  */
  readonly stickySessions?: LoadbalancerStickySessions;
}
export interface LoadbalancerFirewall {
  /**
  * the rules for ALLOWING traffic to the LB (strings in the form: 'ip:1.2.3.4' or 'cidr:1.2.0.0/16')
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/loadbalancer#allow Loadbalancer#allow}
  */
  readonly allow?: string[];
  /**
  * the rules for DENYING traffic to the LB (strings in the form: 'ip:1.2.3.4' or 'cidr:1.2.0.0/16')
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/loadbalancer#deny Loadbalancer#deny}
  */
  readonly deny?: string[];
}

export function loadbalancerFirewallToTerraform(struct?: LoadbalancerFirewallOutputReference | LoadbalancerFirewall): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    allow: cdktf.listMapper(cdktf.stringToTerraform, false)(struct!.allow),
    deny: cdktf.listMapper(cdktf.stringToTerraform, false)(struct!.deny),
  }
}

export class LoadbalancerFirewallOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string) {
    super(terraformResource, terraformAttribute, false, 0);
  }

  public get internalValue(): LoadbalancerFirewall | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._allow !== undefined) {
      hasAnyValues = true;
      internalValueResult.allow = this._allow;
    }
    if (this._deny !== undefined) {
      hasAnyValues = true;
      internalValueResult.deny = this._deny;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: LoadbalancerFirewall | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this._allow = undefined;
      this._deny = undefined;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this._allow = value.allow;
      this._deny = value.deny;
    }
  }

  // allow - computed: false, optional: true, required: false
  private _allow?: string[]; 
  public get allow() {
    return this.getListAttribute('allow');
  }
  public set allow(value: string[]) {
    this._allow = value;
  }
  public resetAllow() {
    this._allow = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get allowInput() {
    return this._allow;
  }

  // deny - computed: false, optional: true, required: false
  private _deny?: string[]; 
  public get deny() {
    return this.getListAttribute('deny');
  }
  public set deny(value: string[]) {
    this._deny = value;
  }
  public resetDeny() {
    this._deny = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get denyInput() {
    return this._deny;
  }
}
export interface LoadbalancerForwardingRule {
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/loadbalancer#certificate_id Loadbalancer#certificate_id}
  */
  readonly certificateId?: string;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/loadbalancer#certificate_name Loadbalancer#certificate_name}
  */
  readonly certificateName?: string;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/loadbalancer#entry_port Loadbalancer#entry_port}
  */
  readonly entryPort: number;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/loadbalancer#entry_protocol Loadbalancer#entry_protocol}
  */
  readonly entryProtocol: string;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/loadbalancer#target_port Loadbalancer#target_port}
  */
  readonly targetPort: number;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/loadbalancer#target_protocol Loadbalancer#target_protocol}
  */
  readonly targetProtocol: string;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/loadbalancer#tls_passthrough Loadbalancer#tls_passthrough}
  */
  readonly tlsPassthrough?: boolean | cdktf.IResolvable;
}

export function loadbalancerForwardingRuleToTerraform(struct?: LoadbalancerForwardingRule | cdktf.IResolvable): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    certificate_id: cdktf.stringToTerraform(struct!.certificateId),
    certificate_name: cdktf.stringToTerraform(struct!.certificateName),
    entry_port: cdktf.numberToTerraform(struct!.entryPort),
    entry_protocol: cdktf.stringToTerraform(struct!.entryProtocol),
    target_port: cdktf.numberToTerraform(struct!.targetPort),
    target_protocol: cdktf.stringToTerraform(struct!.targetProtocol),
    tls_passthrough: cdktf.booleanToTerraform(struct!.tlsPassthrough),
  }
}

export class LoadbalancerForwardingRuleOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;
  private resolvableValue?: cdktf.IResolvable;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  * @param complexObjectIndex the index of this item in the list
  * @param complexObjectIsFromSet whether the list is wrapping a set (will add tolist() to be able to access an item via an index)
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string, complexObjectIndex: number, complexObjectIsFromSet: boolean) {
    super(terraformResource, terraformAttribute, complexObjectIsFromSet, complexObjectIndex);
  }

  public get internalValue(): LoadbalancerForwardingRule | cdktf.IResolvable | undefined {
    if (this.resolvableValue) {
      return this.resolvableValue;
    }
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._certificateId !== undefined) {
      hasAnyValues = true;
      internalValueResult.certificateId = this._certificateId;
    }
    if (this._certificateName !== undefined) {
      hasAnyValues = true;
      internalValueResult.certificateName = this._certificateName;
    }
    if (this._entryPort !== undefined) {
      hasAnyValues = true;
      internalValueResult.entryPort = this._entryPort;
    }
    if (this._entryProtocol !== undefined) {
      hasAnyValues = true;
      internalValueResult.entryProtocol = this._entryProtocol;
    }
    if (this._targetPort !== undefined) {
      hasAnyValues = true;
      internalValueResult.targetPort = this._targetPort;
    }
    if (this._targetProtocol !== undefined) {
      hasAnyValues = true;
      internalValueResult.targetProtocol = this._targetProtocol;
    }
    if (this._tlsPassthrough !== undefined) {
      hasAnyValues = true;
      internalValueResult.tlsPassthrough = this._tlsPassthrough;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: LoadbalancerForwardingRule | cdktf.IResolvable | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this.resolvableValue = undefined;
      this._certificateId = undefined;
      this._certificateName = undefined;
      this._entryPort = undefined;
      this._entryProtocol = undefined;
      this._targetPort = undefined;
      this._targetProtocol = undefined;
      this._tlsPassthrough = undefined;
    }
    else if (cdktf.Tokenization.isResolvable(value)) {
      this.isEmptyObject = false;
      this.resolvableValue = value;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this.resolvableValue = undefined;
      this._certificateId = value.certificateId;
      this._certificateName = value.certificateName;
      this._entryPort = value.entryPort;
      this._entryProtocol = value.entryProtocol;
      this._targetPort = value.targetPort;
      this._targetProtocol = value.targetProtocol;
      this._tlsPassthrough = value.tlsPassthrough;
    }
  }

  // certificate_id - computed: true, optional: true, required: false
  private _certificateId?: string; 
  public get certificateId() {
    return this.getStringAttribute('certificate_id');
  }
  public set certificateId(value: string) {
    this._certificateId = value;
  }
  public resetCertificateId() {
    this._certificateId = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get certificateIdInput() {
    return this._certificateId;
  }

  // certificate_name - computed: true, optional: true, required: false
  private _certificateName?: string; 
  public get certificateName() {
    return this.getStringAttribute('certificate_name');
  }
  public set certificateName(value: string) {
    this._certificateName = value;
  }
  public resetCertificateName() {
    this._certificateName = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get certificateNameInput() {
    return this._certificateName;
  }

  // entry_port - computed: false, optional: false, required: true
  private _entryPort?: number; 
  public get entryPort() {
    return this.getNumberAttribute('entry_port');
  }
  public set entryPort(value: number) {
    this._entryPort = value;
  }
  // Temporarily expose input value. Use with caution.
  public get entryPortInput() {
    return this._entryPort;
  }

  // entry_protocol - computed: false, optional: false, required: true
  private _entryProtocol?: string; 
  public get entryProtocol() {
    return this.getStringAttribute('entry_protocol');
  }
  public set entryProtocol(value: string) {
    this._entryProtocol = value;
  }
  // Temporarily expose input value. Use with caution.
  public get entryProtocolInput() {
    return this._entryProtocol;
  }

  // target_port - computed: false, optional: false, required: true
  private _targetPort?: number; 
  public get targetPort() {
    return this.getNumberAttribute('target_port');
  }
  public set targetPort(value: number) {
    this._targetPort = value;
  }
  // Temporarily expose input value. Use with caution.
  public get targetPortInput() {
    return this._targetPort;
  }

  // target_protocol - computed: false, optional: false, required: true
  private _targetProtocol?: string; 
  public get targetProtocol() {
    return this.getStringAttribute('target_protocol');
  }
  public set targetProtocol(value: string) {
    this._targetProtocol = value;
  }
  // Temporarily expose input value. Use with caution.
  public get targetProtocolInput() {
    return this._targetProtocol;
  }

  // tls_passthrough - computed: false, optional: true, required: false
  private _tlsPassthrough?: boolean | cdktf.IResolvable; 
  public get tlsPassthrough() {
    return this.getBooleanAttribute('tls_passthrough');
  }
  public set tlsPassthrough(value: boolean | cdktf.IResolvable) {
    this._tlsPassthrough = value;
  }
  public resetTlsPassthrough() {
    this._tlsPassthrough = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get tlsPassthroughInput() {
    return this._tlsPassthrough;
  }
}

export class LoadbalancerForwardingRuleList extends cdktf.ComplexList {
  public internalValue? : LoadbalancerForwardingRule[] | cdktf.IResolvable

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
  public get(index: number): LoadbalancerForwardingRuleOutputReference {
    return new LoadbalancerForwardingRuleOutputReference(this.terraformResource, this.terraformAttribute, index, this.wrapsSet);
  }
}
export interface LoadbalancerHealthcheck {
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/loadbalancer#check_interval_seconds Loadbalancer#check_interval_seconds}
  */
  readonly checkIntervalSeconds?: number;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/loadbalancer#healthy_threshold Loadbalancer#healthy_threshold}
  */
  readonly healthyThreshold?: number;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/loadbalancer#path Loadbalancer#path}
  */
  readonly path?: string;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/loadbalancer#port Loadbalancer#port}
  */
  readonly port: number;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/loadbalancer#protocol Loadbalancer#protocol}
  */
  readonly protocol: string;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/loadbalancer#response_timeout_seconds Loadbalancer#response_timeout_seconds}
  */
  readonly responseTimeoutSeconds?: number;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/loadbalancer#unhealthy_threshold Loadbalancer#unhealthy_threshold}
  */
  readonly unhealthyThreshold?: number;
}

export function loadbalancerHealthcheckToTerraform(struct?: LoadbalancerHealthcheckOutputReference | LoadbalancerHealthcheck): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    check_interval_seconds: cdktf.numberToTerraform(struct!.checkIntervalSeconds),
    healthy_threshold: cdktf.numberToTerraform(struct!.healthyThreshold),
    path: cdktf.stringToTerraform(struct!.path),
    port: cdktf.numberToTerraform(struct!.port),
    protocol: cdktf.stringToTerraform(struct!.protocol),
    response_timeout_seconds: cdktf.numberToTerraform(struct!.responseTimeoutSeconds),
    unhealthy_threshold: cdktf.numberToTerraform(struct!.unhealthyThreshold),
  }
}

export class LoadbalancerHealthcheckOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string) {
    super(terraformResource, terraformAttribute, false, 0);
  }

  public get internalValue(): LoadbalancerHealthcheck | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._checkIntervalSeconds !== undefined) {
      hasAnyValues = true;
      internalValueResult.checkIntervalSeconds = this._checkIntervalSeconds;
    }
    if (this._healthyThreshold !== undefined) {
      hasAnyValues = true;
      internalValueResult.healthyThreshold = this._healthyThreshold;
    }
    if (this._path !== undefined) {
      hasAnyValues = true;
      internalValueResult.path = this._path;
    }
    if (this._port !== undefined) {
      hasAnyValues = true;
      internalValueResult.port = this._port;
    }
    if (this._protocol !== undefined) {
      hasAnyValues = true;
      internalValueResult.protocol = this._protocol;
    }
    if (this._responseTimeoutSeconds !== undefined) {
      hasAnyValues = true;
      internalValueResult.responseTimeoutSeconds = this._responseTimeoutSeconds;
    }
    if (this._unhealthyThreshold !== undefined) {
      hasAnyValues = true;
      internalValueResult.unhealthyThreshold = this._unhealthyThreshold;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: LoadbalancerHealthcheck | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this._checkIntervalSeconds = undefined;
      this._healthyThreshold = undefined;
      this._path = undefined;
      this._port = undefined;
      this._protocol = undefined;
      this._responseTimeoutSeconds = undefined;
      this._unhealthyThreshold = undefined;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this._checkIntervalSeconds = value.checkIntervalSeconds;
      this._healthyThreshold = value.healthyThreshold;
      this._path = value.path;
      this._port = value.port;
      this._protocol = value.protocol;
      this._responseTimeoutSeconds = value.responseTimeoutSeconds;
      this._unhealthyThreshold = value.unhealthyThreshold;
    }
  }

  // check_interval_seconds - computed: false, optional: true, required: false
  private _checkIntervalSeconds?: number; 
  public get checkIntervalSeconds() {
    return this.getNumberAttribute('check_interval_seconds');
  }
  public set checkIntervalSeconds(value: number) {
    this._checkIntervalSeconds = value;
  }
  public resetCheckIntervalSeconds() {
    this._checkIntervalSeconds = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get checkIntervalSecondsInput() {
    return this._checkIntervalSeconds;
  }

  // healthy_threshold - computed: false, optional: true, required: false
  private _healthyThreshold?: number; 
  public get healthyThreshold() {
    return this.getNumberAttribute('healthy_threshold');
  }
  public set healthyThreshold(value: number) {
    this._healthyThreshold = value;
  }
  public resetHealthyThreshold() {
    this._healthyThreshold = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get healthyThresholdInput() {
    return this._healthyThreshold;
  }

  // path - computed: false, optional: true, required: false
  private _path?: string; 
  public get path() {
    return this.getStringAttribute('path');
  }
  public set path(value: string) {
    this._path = value;
  }
  public resetPath() {
    this._path = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get pathInput() {
    return this._path;
  }

  // port - computed: false, optional: false, required: true
  private _port?: number; 
  public get port() {
    return this.getNumberAttribute('port');
  }
  public set port(value: number) {
    this._port = value;
  }
  // Temporarily expose input value. Use with caution.
  public get portInput() {
    return this._port;
  }

  // protocol - computed: false, optional: false, required: true
  private _protocol?: string; 
  public get protocol() {
    return this.getStringAttribute('protocol');
  }
  public set protocol(value: string) {
    this._protocol = value;
  }
  // Temporarily expose input value. Use with caution.
  public get protocolInput() {
    return this._protocol;
  }

  // response_timeout_seconds - computed: false, optional: true, required: false
  private _responseTimeoutSeconds?: number; 
  public get responseTimeoutSeconds() {
    return this.getNumberAttribute('response_timeout_seconds');
  }
  public set responseTimeoutSeconds(value: number) {
    this._responseTimeoutSeconds = value;
  }
  public resetResponseTimeoutSeconds() {
    this._responseTimeoutSeconds = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get responseTimeoutSecondsInput() {
    return this._responseTimeoutSeconds;
  }

  // unhealthy_threshold - computed: false, optional: true, required: false
  private _unhealthyThreshold?: number; 
  public get unhealthyThreshold() {
    return this.getNumberAttribute('unhealthy_threshold');
  }
  public set unhealthyThreshold(value: number) {
    this._unhealthyThreshold = value;
  }
  public resetUnhealthyThreshold() {
    this._unhealthyThreshold = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get unhealthyThresholdInput() {
    return this._unhealthyThreshold;
  }
}
export interface LoadbalancerStickySessions {
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/loadbalancer#cookie_name Loadbalancer#cookie_name}
  */
  readonly cookieName?: string;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/loadbalancer#cookie_ttl_seconds Loadbalancer#cookie_ttl_seconds}
  */
  readonly cookieTtlSeconds?: number;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/loadbalancer#type Loadbalancer#type}
  */
  readonly type?: string;
}

export function loadbalancerStickySessionsToTerraform(struct?: LoadbalancerStickySessionsOutputReference | LoadbalancerStickySessions): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    cookie_name: cdktf.stringToTerraform(struct!.cookieName),
    cookie_ttl_seconds: cdktf.numberToTerraform(struct!.cookieTtlSeconds),
    type: cdktf.stringToTerraform(struct!.type),
  }
}

export class LoadbalancerStickySessionsOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string) {
    super(terraformResource, terraformAttribute, false, 0);
  }

  public get internalValue(): LoadbalancerStickySessions | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._cookieName !== undefined) {
      hasAnyValues = true;
      internalValueResult.cookieName = this._cookieName;
    }
    if (this._cookieTtlSeconds !== undefined) {
      hasAnyValues = true;
      internalValueResult.cookieTtlSeconds = this._cookieTtlSeconds;
    }
    if (this._type !== undefined) {
      hasAnyValues = true;
      internalValueResult.type = this._type;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: LoadbalancerStickySessions | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this._cookieName = undefined;
      this._cookieTtlSeconds = undefined;
      this._type = undefined;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this._cookieName = value.cookieName;
      this._cookieTtlSeconds = value.cookieTtlSeconds;
      this._type = value.type;
    }
  }

  // cookie_name - computed: false, optional: true, required: false
  private _cookieName?: string; 
  public get cookieName() {
    return this.getStringAttribute('cookie_name');
  }
  public set cookieName(value: string) {
    this._cookieName = value;
  }
  public resetCookieName() {
    this._cookieName = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get cookieNameInput() {
    return this._cookieName;
  }

  // cookie_ttl_seconds - computed: false, optional: true, required: false
  private _cookieTtlSeconds?: number; 
  public get cookieTtlSeconds() {
    return this.getNumberAttribute('cookie_ttl_seconds');
  }
  public set cookieTtlSeconds(value: number) {
    this._cookieTtlSeconds = value;
  }
  public resetCookieTtlSeconds() {
    this._cookieTtlSeconds = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get cookieTtlSecondsInput() {
    return this._cookieTtlSeconds;
  }

  // type - computed: false, optional: true, required: false
  private _type?: string; 
  public get type() {
    return this.getStringAttribute('type');
  }
  public set type(value: string) {
    this._type = value;
  }
  public resetType() {
    this._type = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get typeInput() {
    return this._type;
  }
}

/**
* Represents a {@link https://www.terraform.io/docs/providers/digitalocean/r/loadbalancer digitalocean_loadbalancer}
*/
export class Loadbalancer extends cdktf.TerraformResource {

  // =================
  // STATIC PROPERTIES
  // =================
  public static readonly tfResourceType = "digitalocean_loadbalancer";

  // ===========
  // INITIALIZER
  // ===========

  /**
  * Create a new {@link https://www.terraform.io/docs/providers/digitalocean/r/loadbalancer digitalocean_loadbalancer} Resource
  *
  * @param scope The scope in which to define this construct
  * @param id The scoped construct ID. Must be unique amongst siblings in the same scope
  * @param options LoadbalancerConfig
  */
  public constructor(scope: Construct, id: string, config: LoadbalancerConfig) {
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
    this._algorithm = config.algorithm;
    this._disableLetsEncryptDnsRecords = config.disableLetsEncryptDnsRecords;
    this._dropletIds = config.dropletIds;
    this._dropletTag = config.dropletTag;
    this._enableBackendKeepalive = config.enableBackendKeepalive;
    this._enableProxyProtocol = config.enableProxyProtocol;
    this._httpIdleTimeoutSeconds = config.httpIdleTimeoutSeconds;
    this._id = config.id;
    this._name = config.name;
    this._projectId = config.projectId;
    this._redirectHttpToHttps = config.redirectHttpToHttps;
    this._region = config.region;
    this._size = config.size;
    this._sizeUnit = config.sizeUnit;
    this._vpcUuid = config.vpcUuid;
    this._firewall.internalValue = config.firewall;
    this._forwardingRule.internalValue = config.forwardingRule;
    this._healthcheck.internalValue = config.healthcheck;
    this._stickySessions.internalValue = config.stickySessions;
  }

  // ==========
  // ATTRIBUTES
  // ==========

  // algorithm - computed: false, optional: true, required: false
  private _algorithm?: string; 
  public get algorithm() {
    return this.getStringAttribute('algorithm');
  }
  public set algorithm(value: string) {
    this._algorithm = value;
  }
  public resetAlgorithm() {
    this._algorithm = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get algorithmInput() {
    return this._algorithm;
  }

  // disable_lets_encrypt_dns_records - computed: false, optional: true, required: false
  private _disableLetsEncryptDnsRecords?: boolean | cdktf.IResolvable; 
  public get disableLetsEncryptDnsRecords() {
    return this.getBooleanAttribute('disable_lets_encrypt_dns_records');
  }
  public set disableLetsEncryptDnsRecords(value: boolean | cdktf.IResolvable) {
    this._disableLetsEncryptDnsRecords = value;
  }
  public resetDisableLetsEncryptDnsRecords() {
    this._disableLetsEncryptDnsRecords = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get disableLetsEncryptDnsRecordsInput() {
    return this._disableLetsEncryptDnsRecords;
  }

  // droplet_ids - computed: true, optional: true, required: false
  private _dropletIds?: number[]; 
  public get dropletIds() {
    return cdktf.Token.asNumberList(cdktf.Fn.tolist(this.getNumberListAttribute('droplet_ids')));
  }
  public set dropletIds(value: number[]) {
    this._dropletIds = value;
  }
  public resetDropletIds() {
    this._dropletIds = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get dropletIdsInput() {
    return this._dropletIds;
  }

  // droplet_tag - computed: false, optional: true, required: false
  private _dropletTag?: string; 
  public get dropletTag() {
    return this.getStringAttribute('droplet_tag');
  }
  public set dropletTag(value: string) {
    this._dropletTag = value;
  }
  public resetDropletTag() {
    this._dropletTag = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get dropletTagInput() {
    return this._dropletTag;
  }

  // enable_backend_keepalive - computed: false, optional: true, required: false
  private _enableBackendKeepalive?: boolean | cdktf.IResolvable; 
  public get enableBackendKeepalive() {
    return this.getBooleanAttribute('enable_backend_keepalive');
  }
  public set enableBackendKeepalive(value: boolean | cdktf.IResolvable) {
    this._enableBackendKeepalive = value;
  }
  public resetEnableBackendKeepalive() {
    this._enableBackendKeepalive = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get enableBackendKeepaliveInput() {
    return this._enableBackendKeepalive;
  }

  // enable_proxy_protocol - computed: false, optional: true, required: false
  private _enableProxyProtocol?: boolean | cdktf.IResolvable; 
  public get enableProxyProtocol() {
    return this.getBooleanAttribute('enable_proxy_protocol');
  }
  public set enableProxyProtocol(value: boolean | cdktf.IResolvable) {
    this._enableProxyProtocol = value;
  }
  public resetEnableProxyProtocol() {
    this._enableProxyProtocol = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get enableProxyProtocolInput() {
    return this._enableProxyProtocol;
  }

  // http_idle_timeout_seconds - computed: true, optional: true, required: false
  private _httpIdleTimeoutSeconds?: number; 
  public get httpIdleTimeoutSeconds() {
    return this.getNumberAttribute('http_idle_timeout_seconds');
  }
  public set httpIdleTimeoutSeconds(value: number) {
    this._httpIdleTimeoutSeconds = value;
  }
  public resetHttpIdleTimeoutSeconds() {
    this._httpIdleTimeoutSeconds = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get httpIdleTimeoutSecondsInput() {
    return this._httpIdleTimeoutSeconds;
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

  // ip - computed: true, optional: false, required: false
  public get ip() {
    return this.getStringAttribute('ip');
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

  // project_id - computed: true, optional: true, required: false
  private _projectId?: string; 
  public get projectId() {
    return this.getStringAttribute('project_id');
  }
  public set projectId(value: string) {
    this._projectId = value;
  }
  public resetProjectId() {
    this._projectId = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get projectIdInput() {
    return this._projectId;
  }

  // redirect_http_to_https - computed: false, optional: true, required: false
  private _redirectHttpToHttps?: boolean | cdktf.IResolvable; 
  public get redirectHttpToHttps() {
    return this.getBooleanAttribute('redirect_http_to_https');
  }
  public set redirectHttpToHttps(value: boolean | cdktf.IResolvable) {
    this._redirectHttpToHttps = value;
  }
  public resetRedirectHttpToHttps() {
    this._redirectHttpToHttps = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get redirectHttpToHttpsInput() {
    return this._redirectHttpToHttps;
  }

  // region - computed: false, optional: false, required: true
  private _region?: string; 
  public get region() {
    return this.getStringAttribute('region');
  }
  public set region(value: string) {
    this._region = value;
  }
  // Temporarily expose input value. Use with caution.
  public get regionInput() {
    return this._region;
  }

  // size - computed: false, optional: true, required: false
  private _size?: string; 
  public get size() {
    return this.getStringAttribute('size');
  }
  public set size(value: string) {
    this._size = value;
  }
  public resetSize() {
    this._size = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get sizeInput() {
    return this._size;
  }

  // size_unit - computed: true, optional: true, required: false
  private _sizeUnit?: number; 
  public get sizeUnit() {
    return this.getNumberAttribute('size_unit');
  }
  public set sizeUnit(value: number) {
    this._sizeUnit = value;
  }
  public resetSizeUnit() {
    this._sizeUnit = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get sizeUnitInput() {
    return this._sizeUnit;
  }

  // status - computed: true, optional: false, required: false
  public get status() {
    return this.getStringAttribute('status');
  }

  // urn - computed: true, optional: false, required: false
  public get urn() {
    return this.getStringAttribute('urn');
  }

  // vpc_uuid - computed: true, optional: true, required: false
  private _vpcUuid?: string; 
  public get vpcUuid() {
    return this.getStringAttribute('vpc_uuid');
  }
  public set vpcUuid(value: string) {
    this._vpcUuid = value;
  }
  public resetVpcUuid() {
    this._vpcUuid = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get vpcUuidInput() {
    return this._vpcUuid;
  }

  // firewall - computed: false, optional: true, required: false
  private _firewall = new LoadbalancerFirewallOutputReference(this, "firewall");
  public get firewall() {
    return this._firewall;
  }
  public putFirewall(value: LoadbalancerFirewall) {
    this._firewall.internalValue = value;
  }
  public resetFirewall() {
    this._firewall.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get firewallInput() {
    return this._firewall.internalValue;
  }

  // forwarding_rule - computed: false, optional: false, required: true
  private _forwardingRule = new LoadbalancerForwardingRuleList(this, "forwarding_rule", true);
  public get forwardingRule() {
    return this._forwardingRule;
  }
  public putForwardingRule(value: LoadbalancerForwardingRule[] | cdktf.IResolvable) {
    this._forwardingRule.internalValue = value;
  }
  // Temporarily expose input value. Use with caution.
  public get forwardingRuleInput() {
    return this._forwardingRule.internalValue;
  }

  // healthcheck - computed: false, optional: true, required: false
  private _healthcheck = new LoadbalancerHealthcheckOutputReference(this, "healthcheck");
  public get healthcheck() {
    return this._healthcheck;
  }
  public putHealthcheck(value: LoadbalancerHealthcheck) {
    this._healthcheck.internalValue = value;
  }
  public resetHealthcheck() {
    this._healthcheck.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get healthcheckInput() {
    return this._healthcheck.internalValue;
  }

  // sticky_sessions - computed: false, optional: true, required: false
  private _stickySessions = new LoadbalancerStickySessionsOutputReference(this, "sticky_sessions");
  public get stickySessions() {
    return this._stickySessions;
  }
  public putStickySessions(value: LoadbalancerStickySessions) {
    this._stickySessions.internalValue = value;
  }
  public resetStickySessions() {
    this._stickySessions.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get stickySessionsInput() {
    return this._stickySessions.internalValue;
  }

  // =========
  // SYNTHESIS
  // =========

  protected synthesizeAttributes(): { [name: string]: any } {
    return {
      algorithm: cdktf.stringToTerraform(this._algorithm),
      disable_lets_encrypt_dns_records: cdktf.booleanToTerraform(this._disableLetsEncryptDnsRecords),
      droplet_ids: cdktf.listMapper(cdktf.numberToTerraform, false)(this._dropletIds),
      droplet_tag: cdktf.stringToTerraform(this._dropletTag),
      enable_backend_keepalive: cdktf.booleanToTerraform(this._enableBackendKeepalive),
      enable_proxy_protocol: cdktf.booleanToTerraform(this._enableProxyProtocol),
      http_idle_timeout_seconds: cdktf.numberToTerraform(this._httpIdleTimeoutSeconds),
      id: cdktf.stringToTerraform(this._id),
      name: cdktf.stringToTerraform(this._name),
      project_id: cdktf.stringToTerraform(this._projectId),
      redirect_http_to_https: cdktf.booleanToTerraform(this._redirectHttpToHttps),
      region: cdktf.stringToTerraform(this._region),
      size: cdktf.stringToTerraform(this._size),
      size_unit: cdktf.numberToTerraform(this._sizeUnit),
      vpc_uuid: cdktf.stringToTerraform(this._vpcUuid),
      firewall: loadbalancerFirewallToTerraform(this._firewall.internalValue),
      forwarding_rule: cdktf.listMapper(loadbalancerForwardingRuleToTerraform, true)(this._forwardingRule.internalValue),
      healthcheck: loadbalancerHealthcheckToTerraform(this._healthcheck.internalValue),
      sticky_sessions: loadbalancerStickySessionsToTerraform(this._stickySessions.internalValue),
    };
  }
}
