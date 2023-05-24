// https://www.terraform.io/docs/providers/digitalocean/d/firewall
// generated from terraform resource schema

import { Construct } from 'constructs';
import * as cdktf from 'cdktf';

// Configuration

export interface DataDigitaloceanFirewallConfig extends cdktf.TerraformMetaArguments {
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/d/firewall#droplet_ids DataDigitaloceanFirewall#droplet_ids}
  */
  readonly dropletIds?: number[];
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/d/firewall#firewall_id DataDigitaloceanFirewall#firewall_id}
  */
  readonly firewallId: string;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/d/firewall#id DataDigitaloceanFirewall#id}
  *
  * Please be aware that the id field is automatically added to all resources in Terraform providers using a Terraform provider SDK version below 2.
  * If you experience problems setting this value it might not be settable. Please take a look at the provider documentation to ensure it should be settable.
  */
  readonly id?: string;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/d/firewall#tags DataDigitaloceanFirewall#tags}
  */
  readonly tags?: string[];
  /**
  * inbound_rule block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/d/firewall#inbound_rule DataDigitaloceanFirewall#inbound_rule}
  */
  readonly inboundRule?: DataDigitaloceanFirewallInboundRule[] | cdktf.IResolvable;
  /**
  * outbound_rule block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/d/firewall#outbound_rule DataDigitaloceanFirewall#outbound_rule}
  */
  readonly outboundRule?: DataDigitaloceanFirewallOutboundRule[] | cdktf.IResolvable;
}
export interface DataDigitaloceanFirewallPendingChanges {
}

export function dataDigitaloceanFirewallPendingChangesToTerraform(struct?: DataDigitaloceanFirewallPendingChanges): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
  }
}

export class DataDigitaloceanFirewallPendingChangesOutputReference extends cdktf.ComplexObject {
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

  public get internalValue(): DataDigitaloceanFirewallPendingChanges | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: DataDigitaloceanFirewallPendingChanges | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
    }
  }

  // droplet_id - computed: true, optional: false, required: false
  public get dropletId() {
    return this.getNumberAttribute('droplet_id');
  }

  // removing - computed: true, optional: false, required: false
  public get removing() {
    return this.getBooleanAttribute('removing');
  }

  // status - computed: true, optional: false, required: false
  public get status() {
    return this.getStringAttribute('status');
  }
}

export class DataDigitaloceanFirewallPendingChangesList extends cdktf.ComplexList {

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
  public get(index: number): DataDigitaloceanFirewallPendingChangesOutputReference {
    return new DataDigitaloceanFirewallPendingChangesOutputReference(this.terraformResource, this.terraformAttribute, index, this.wrapsSet);
  }
}
export interface DataDigitaloceanFirewallInboundRule {
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/d/firewall#port_range DataDigitaloceanFirewall#port_range}
  */
  readonly portRange?: string;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/d/firewall#protocol DataDigitaloceanFirewall#protocol}
  */
  readonly protocol: string;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/d/firewall#source_addresses DataDigitaloceanFirewall#source_addresses}
  */
  readonly sourceAddresses?: string[];
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/d/firewall#source_droplet_ids DataDigitaloceanFirewall#source_droplet_ids}
  */
  readonly sourceDropletIds?: number[];
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/d/firewall#source_kubernetes_ids DataDigitaloceanFirewall#source_kubernetes_ids}
  */
  readonly sourceKubernetesIds?: string[];
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/d/firewall#source_load_balancer_uids DataDigitaloceanFirewall#source_load_balancer_uids}
  */
  readonly sourceLoadBalancerUids?: string[];
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/d/firewall#source_tags DataDigitaloceanFirewall#source_tags}
  */
  readonly sourceTags?: string[];
}

export function dataDigitaloceanFirewallInboundRuleToTerraform(struct?: DataDigitaloceanFirewallInboundRule | cdktf.IResolvable): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    port_range: cdktf.stringToTerraform(struct!.portRange),
    protocol: cdktf.stringToTerraform(struct!.protocol),
    source_addresses: cdktf.listMapper(cdktf.stringToTerraform, false)(struct!.sourceAddresses),
    source_droplet_ids: cdktf.listMapper(cdktf.numberToTerraform, false)(struct!.sourceDropletIds),
    source_kubernetes_ids: cdktf.listMapper(cdktf.stringToTerraform, false)(struct!.sourceKubernetesIds),
    source_load_balancer_uids: cdktf.listMapper(cdktf.stringToTerraform, false)(struct!.sourceLoadBalancerUids),
    source_tags: cdktf.listMapper(cdktf.stringToTerraform, false)(struct!.sourceTags),
  }
}

export class DataDigitaloceanFirewallInboundRuleOutputReference extends cdktf.ComplexObject {
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

  public get internalValue(): DataDigitaloceanFirewallInboundRule | cdktf.IResolvable | undefined {
    if (this.resolvableValue) {
      return this.resolvableValue;
    }
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._portRange !== undefined) {
      hasAnyValues = true;
      internalValueResult.portRange = this._portRange;
    }
    if (this._protocol !== undefined) {
      hasAnyValues = true;
      internalValueResult.protocol = this._protocol;
    }
    if (this._sourceAddresses !== undefined) {
      hasAnyValues = true;
      internalValueResult.sourceAddresses = this._sourceAddresses;
    }
    if (this._sourceDropletIds !== undefined) {
      hasAnyValues = true;
      internalValueResult.sourceDropletIds = this._sourceDropletIds;
    }
    if (this._sourceKubernetesIds !== undefined) {
      hasAnyValues = true;
      internalValueResult.sourceKubernetesIds = this._sourceKubernetesIds;
    }
    if (this._sourceLoadBalancerUids !== undefined) {
      hasAnyValues = true;
      internalValueResult.sourceLoadBalancerUids = this._sourceLoadBalancerUids;
    }
    if (this._sourceTags !== undefined) {
      hasAnyValues = true;
      internalValueResult.sourceTags = this._sourceTags;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: DataDigitaloceanFirewallInboundRule | cdktf.IResolvable | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this.resolvableValue = undefined;
      this._portRange = undefined;
      this._protocol = undefined;
      this._sourceAddresses = undefined;
      this._sourceDropletIds = undefined;
      this._sourceKubernetesIds = undefined;
      this._sourceLoadBalancerUids = undefined;
      this._sourceTags = undefined;
    }
    else if (cdktf.Tokenization.isResolvable(value)) {
      this.isEmptyObject = false;
      this.resolvableValue = value;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this.resolvableValue = undefined;
      this._portRange = value.portRange;
      this._protocol = value.protocol;
      this._sourceAddresses = value.sourceAddresses;
      this._sourceDropletIds = value.sourceDropletIds;
      this._sourceKubernetesIds = value.sourceKubernetesIds;
      this._sourceLoadBalancerUids = value.sourceLoadBalancerUids;
      this._sourceTags = value.sourceTags;
    }
  }

  // port_range - computed: false, optional: true, required: false
  private _portRange?: string; 
  public get portRange() {
    return this.getStringAttribute('port_range');
  }
  public set portRange(value: string) {
    this._portRange = value;
  }
  public resetPortRange() {
    this._portRange = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get portRangeInput() {
    return this._portRange;
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

  // source_addresses - computed: false, optional: true, required: false
  private _sourceAddresses?: string[]; 
  public get sourceAddresses() {
    return cdktf.Fn.tolist(this.getListAttribute('source_addresses'));
  }
  public set sourceAddresses(value: string[]) {
    this._sourceAddresses = value;
  }
  public resetSourceAddresses() {
    this._sourceAddresses = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get sourceAddressesInput() {
    return this._sourceAddresses;
  }

  // source_droplet_ids - computed: false, optional: true, required: false
  private _sourceDropletIds?: number[]; 
  public get sourceDropletIds() {
    return cdktf.Token.asNumberList(cdktf.Fn.tolist(this.getNumberListAttribute('source_droplet_ids')));
  }
  public set sourceDropletIds(value: number[]) {
    this._sourceDropletIds = value;
  }
  public resetSourceDropletIds() {
    this._sourceDropletIds = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get sourceDropletIdsInput() {
    return this._sourceDropletIds;
  }

  // source_kubernetes_ids - computed: false, optional: true, required: false
  private _sourceKubernetesIds?: string[]; 
  public get sourceKubernetesIds() {
    return cdktf.Fn.tolist(this.getListAttribute('source_kubernetes_ids'));
  }
  public set sourceKubernetesIds(value: string[]) {
    this._sourceKubernetesIds = value;
  }
  public resetSourceKubernetesIds() {
    this._sourceKubernetesIds = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get sourceKubernetesIdsInput() {
    return this._sourceKubernetesIds;
  }

  // source_load_balancer_uids - computed: false, optional: true, required: false
  private _sourceLoadBalancerUids?: string[]; 
  public get sourceLoadBalancerUids() {
    return cdktf.Fn.tolist(this.getListAttribute('source_load_balancer_uids'));
  }
  public set sourceLoadBalancerUids(value: string[]) {
    this._sourceLoadBalancerUids = value;
  }
  public resetSourceLoadBalancerUids() {
    this._sourceLoadBalancerUids = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get sourceLoadBalancerUidsInput() {
    return this._sourceLoadBalancerUids;
  }

  // source_tags - computed: false, optional: true, required: false
  private _sourceTags?: string[]; 
  public get sourceTags() {
    return cdktf.Fn.tolist(this.getListAttribute('source_tags'));
  }
  public set sourceTags(value: string[]) {
    this._sourceTags = value;
  }
  public resetSourceTags() {
    this._sourceTags = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get sourceTagsInput() {
    return this._sourceTags;
  }
}

export class DataDigitaloceanFirewallInboundRuleList extends cdktf.ComplexList {
  public internalValue? : DataDigitaloceanFirewallInboundRule[] | cdktf.IResolvable

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
  public get(index: number): DataDigitaloceanFirewallInboundRuleOutputReference {
    return new DataDigitaloceanFirewallInboundRuleOutputReference(this.terraformResource, this.terraformAttribute, index, this.wrapsSet);
  }
}
export interface DataDigitaloceanFirewallOutboundRule {
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/d/firewall#destination_addresses DataDigitaloceanFirewall#destination_addresses}
  */
  readonly destinationAddresses?: string[];
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/d/firewall#destination_droplet_ids DataDigitaloceanFirewall#destination_droplet_ids}
  */
  readonly destinationDropletIds?: number[];
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/d/firewall#destination_kubernetes_ids DataDigitaloceanFirewall#destination_kubernetes_ids}
  */
  readonly destinationKubernetesIds?: string[];
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/d/firewall#destination_load_balancer_uids DataDigitaloceanFirewall#destination_load_balancer_uids}
  */
  readonly destinationLoadBalancerUids?: string[];
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/d/firewall#destination_tags DataDigitaloceanFirewall#destination_tags}
  */
  readonly destinationTags?: string[];
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/d/firewall#port_range DataDigitaloceanFirewall#port_range}
  */
  readonly portRange?: string;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/d/firewall#protocol DataDigitaloceanFirewall#protocol}
  */
  readonly protocol: string;
}

export function dataDigitaloceanFirewallOutboundRuleToTerraform(struct?: DataDigitaloceanFirewallOutboundRule | cdktf.IResolvable): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    destination_addresses: cdktf.listMapper(cdktf.stringToTerraform, false)(struct!.destinationAddresses),
    destination_droplet_ids: cdktf.listMapper(cdktf.numberToTerraform, false)(struct!.destinationDropletIds),
    destination_kubernetes_ids: cdktf.listMapper(cdktf.stringToTerraform, false)(struct!.destinationKubernetesIds),
    destination_load_balancer_uids: cdktf.listMapper(cdktf.stringToTerraform, false)(struct!.destinationLoadBalancerUids),
    destination_tags: cdktf.listMapper(cdktf.stringToTerraform, false)(struct!.destinationTags),
    port_range: cdktf.stringToTerraform(struct!.portRange),
    protocol: cdktf.stringToTerraform(struct!.protocol),
  }
}

export class DataDigitaloceanFirewallOutboundRuleOutputReference extends cdktf.ComplexObject {
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

  public get internalValue(): DataDigitaloceanFirewallOutboundRule | cdktf.IResolvable | undefined {
    if (this.resolvableValue) {
      return this.resolvableValue;
    }
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._destinationAddresses !== undefined) {
      hasAnyValues = true;
      internalValueResult.destinationAddresses = this._destinationAddresses;
    }
    if (this._destinationDropletIds !== undefined) {
      hasAnyValues = true;
      internalValueResult.destinationDropletIds = this._destinationDropletIds;
    }
    if (this._destinationKubernetesIds !== undefined) {
      hasAnyValues = true;
      internalValueResult.destinationKubernetesIds = this._destinationKubernetesIds;
    }
    if (this._destinationLoadBalancerUids !== undefined) {
      hasAnyValues = true;
      internalValueResult.destinationLoadBalancerUids = this._destinationLoadBalancerUids;
    }
    if (this._destinationTags !== undefined) {
      hasAnyValues = true;
      internalValueResult.destinationTags = this._destinationTags;
    }
    if (this._portRange !== undefined) {
      hasAnyValues = true;
      internalValueResult.portRange = this._portRange;
    }
    if (this._protocol !== undefined) {
      hasAnyValues = true;
      internalValueResult.protocol = this._protocol;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: DataDigitaloceanFirewallOutboundRule | cdktf.IResolvable | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this.resolvableValue = undefined;
      this._destinationAddresses = undefined;
      this._destinationDropletIds = undefined;
      this._destinationKubernetesIds = undefined;
      this._destinationLoadBalancerUids = undefined;
      this._destinationTags = undefined;
      this._portRange = undefined;
      this._protocol = undefined;
    }
    else if (cdktf.Tokenization.isResolvable(value)) {
      this.isEmptyObject = false;
      this.resolvableValue = value;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this.resolvableValue = undefined;
      this._destinationAddresses = value.destinationAddresses;
      this._destinationDropletIds = value.destinationDropletIds;
      this._destinationKubernetesIds = value.destinationKubernetesIds;
      this._destinationLoadBalancerUids = value.destinationLoadBalancerUids;
      this._destinationTags = value.destinationTags;
      this._portRange = value.portRange;
      this._protocol = value.protocol;
    }
  }

  // destination_addresses - computed: false, optional: true, required: false
  private _destinationAddresses?: string[]; 
  public get destinationAddresses() {
    return cdktf.Fn.tolist(this.getListAttribute('destination_addresses'));
  }
  public set destinationAddresses(value: string[]) {
    this._destinationAddresses = value;
  }
  public resetDestinationAddresses() {
    this._destinationAddresses = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get destinationAddressesInput() {
    return this._destinationAddresses;
  }

  // destination_droplet_ids - computed: false, optional: true, required: false
  private _destinationDropletIds?: number[]; 
  public get destinationDropletIds() {
    return cdktf.Token.asNumberList(cdktf.Fn.tolist(this.getNumberListAttribute('destination_droplet_ids')));
  }
  public set destinationDropletIds(value: number[]) {
    this._destinationDropletIds = value;
  }
  public resetDestinationDropletIds() {
    this._destinationDropletIds = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get destinationDropletIdsInput() {
    return this._destinationDropletIds;
  }

  // destination_kubernetes_ids - computed: false, optional: true, required: false
  private _destinationKubernetesIds?: string[]; 
  public get destinationKubernetesIds() {
    return cdktf.Fn.tolist(this.getListAttribute('destination_kubernetes_ids'));
  }
  public set destinationKubernetesIds(value: string[]) {
    this._destinationKubernetesIds = value;
  }
  public resetDestinationKubernetesIds() {
    this._destinationKubernetesIds = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get destinationKubernetesIdsInput() {
    return this._destinationKubernetesIds;
  }

  // destination_load_balancer_uids - computed: false, optional: true, required: false
  private _destinationLoadBalancerUids?: string[]; 
  public get destinationLoadBalancerUids() {
    return cdktf.Fn.tolist(this.getListAttribute('destination_load_balancer_uids'));
  }
  public set destinationLoadBalancerUids(value: string[]) {
    this._destinationLoadBalancerUids = value;
  }
  public resetDestinationLoadBalancerUids() {
    this._destinationLoadBalancerUids = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get destinationLoadBalancerUidsInput() {
    return this._destinationLoadBalancerUids;
  }

  // destination_tags - computed: false, optional: true, required: false
  private _destinationTags?: string[]; 
  public get destinationTags() {
    return cdktf.Fn.tolist(this.getListAttribute('destination_tags'));
  }
  public set destinationTags(value: string[]) {
    this._destinationTags = value;
  }
  public resetDestinationTags() {
    this._destinationTags = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get destinationTagsInput() {
    return this._destinationTags;
  }

  // port_range - computed: false, optional: true, required: false
  private _portRange?: string; 
  public get portRange() {
    return this.getStringAttribute('port_range');
  }
  public set portRange(value: string) {
    this._portRange = value;
  }
  public resetPortRange() {
    this._portRange = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get portRangeInput() {
    return this._portRange;
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
}

export class DataDigitaloceanFirewallOutboundRuleList extends cdktf.ComplexList {
  public internalValue? : DataDigitaloceanFirewallOutboundRule[] | cdktf.IResolvable

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
  public get(index: number): DataDigitaloceanFirewallOutboundRuleOutputReference {
    return new DataDigitaloceanFirewallOutboundRuleOutputReference(this.terraformResource, this.terraformAttribute, index, this.wrapsSet);
  }
}

/**
* Represents a {@link https://www.terraform.io/docs/providers/digitalocean/d/firewall digitalocean_firewall}
*/
export class DataDigitaloceanFirewall extends cdktf.TerraformDataSource {

  // =================
  // STATIC PROPERTIES
  // =================
  public static readonly tfResourceType = "digitalocean_firewall";

  // ===========
  // INITIALIZER
  // ===========

  /**
  * Create a new {@link https://www.terraform.io/docs/providers/digitalocean/d/firewall digitalocean_firewall} Data Source
  *
  * @param scope The scope in which to define this construct
  * @param id The scoped construct ID. Must be unique amongst siblings in the same scope
  * @param options DataDigitaloceanFirewallConfig
  */
  public constructor(scope: Construct, id: string, config: DataDigitaloceanFirewallConfig) {
    super(scope, id, {
      terraformResourceType: 'digitalocean_firewall',
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
    this._dropletIds = config.dropletIds;
    this._firewallId = config.firewallId;
    this._id = config.id;
    this._tags = config.tags;
    this._inboundRule.internalValue = config.inboundRule;
    this._outboundRule.internalValue = config.outboundRule;
  }

  // ==========
  // ATTRIBUTES
  // ==========

  // created_at - computed: true, optional: false, required: false
  public get createdAt() {
    return this.getStringAttribute('created_at');
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

  // firewall_id - computed: false, optional: false, required: true
  private _firewallId?: string; 
  public get firewallId() {
    return this.getStringAttribute('firewall_id');
  }
  public set firewallId(value: string) {
    this._firewallId = value;
  }
  // Temporarily expose input value. Use with caution.
  public get firewallIdInput() {
    return this._firewallId;
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

  // name - computed: true, optional: false, required: false
  public get name() {
    return this.getStringAttribute('name');
  }

  // pending_changes - computed: true, optional: false, required: false
  private _pendingChanges = new DataDigitaloceanFirewallPendingChangesList(this, "pending_changes", false);
  public get pendingChanges() {
    return this._pendingChanges;
  }

  // status - computed: true, optional: false, required: false
  public get status() {
    return this.getStringAttribute('status');
  }

  // tags - computed: true, optional: true, required: false
  private _tags?: string[]; 
  public get tags() {
    return cdktf.Fn.tolist(this.getListAttribute('tags'));
  }
  public set tags(value: string[]) {
    this._tags = value;
  }
  public resetTags() {
    this._tags = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get tagsInput() {
    return this._tags;
  }

  // inbound_rule - computed: false, optional: true, required: false
  private _inboundRule = new DataDigitaloceanFirewallInboundRuleList(this, "inbound_rule", true);
  public get inboundRule() {
    return this._inboundRule;
  }
  public putInboundRule(value: DataDigitaloceanFirewallInboundRule[] | cdktf.IResolvable) {
    this._inboundRule.internalValue = value;
  }
  public resetInboundRule() {
    this._inboundRule.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get inboundRuleInput() {
    return this._inboundRule.internalValue;
  }

  // outbound_rule - computed: false, optional: true, required: false
  private _outboundRule = new DataDigitaloceanFirewallOutboundRuleList(this, "outbound_rule", true);
  public get outboundRule() {
    return this._outboundRule;
  }
  public putOutboundRule(value: DataDigitaloceanFirewallOutboundRule[] | cdktf.IResolvable) {
    this._outboundRule.internalValue = value;
  }
  public resetOutboundRule() {
    this._outboundRule.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get outboundRuleInput() {
    return this._outboundRule.internalValue;
  }

  // =========
  // SYNTHESIS
  // =========

  protected synthesizeAttributes(): { [name: string]: any } {
    return {
      droplet_ids: cdktf.listMapper(cdktf.numberToTerraform, false)(this._dropletIds),
      firewall_id: cdktf.stringToTerraform(this._firewallId),
      id: cdktf.stringToTerraform(this._id),
      tags: cdktf.listMapper(cdktf.stringToTerraform, false)(this._tags),
      inbound_rule: cdktf.listMapper(dataDigitaloceanFirewallInboundRuleToTerraform, true)(this._inboundRule.internalValue),
      outbound_rule: cdktf.listMapper(dataDigitaloceanFirewallOutboundRuleToTerraform, true)(this._outboundRule.internalValue),
    };
  }
}
