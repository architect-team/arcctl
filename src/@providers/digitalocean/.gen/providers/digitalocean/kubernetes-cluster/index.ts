// https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/kubernetes_cluster
// generated from terraform resource schema

import { Construct } from 'constructs';
import * as cdktf from 'cdktf';

// Configuration

export interface KubernetesClusterConfig extends cdktf.TerraformMetaArguments {
  /**
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/kubernetes_cluster#auto_upgrade KubernetesCluster#auto_upgrade}
  */
  readonly autoUpgrade?: boolean | cdktf.IResolvable;
  /**
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/kubernetes_cluster#ha KubernetesCluster#ha}
  */
  readonly ha?: boolean | cdktf.IResolvable;
  /**
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/kubernetes_cluster#id KubernetesCluster#id}
  *
  * Please be aware that the id field is automatically added to all resources in Terraform providers using a Terraform provider SDK version below 2.
  * If you experience problems setting this value it might not be settable. Please take a look at the provider documentation to ensure it should be settable.
  */
  readonly id?: string;
  /**
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/kubernetes_cluster#name KubernetesCluster#name}
  */
  readonly name: string;
  /**
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/kubernetes_cluster#region KubernetesCluster#region}
  */
  readonly region: string;
  /**
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/kubernetes_cluster#registry_integration KubernetesCluster#registry_integration}
  */
  readonly registryIntegration?: boolean | cdktf.IResolvable;
  /**
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/kubernetes_cluster#surge_upgrade KubernetesCluster#surge_upgrade}
  */
  readonly surgeUpgrade?: boolean | cdktf.IResolvable;
  /**
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/kubernetes_cluster#tags KubernetesCluster#tags}
  */
  readonly tags?: string[];
  /**
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/kubernetes_cluster#version KubernetesCluster#version}
  */
  readonly version: string;
  /**
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/kubernetes_cluster#vpc_uuid KubernetesCluster#vpc_uuid}
  */
  readonly vpcUuid?: string;
  /**
  * maintenance_policy block
  * 
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/kubernetes_cluster#maintenance_policy KubernetesCluster#maintenance_policy}
  */
  readonly maintenancePolicy?: KubernetesClusterMaintenancePolicy;
  /**
  * node_pool block
  * 
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/kubernetes_cluster#node_pool KubernetesCluster#node_pool}
  */
  readonly nodePool: KubernetesClusterNodePool;
  /**
  * timeouts block
  * 
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/kubernetes_cluster#timeouts KubernetesCluster#timeouts}
  */
  readonly timeouts?: KubernetesClusterTimeouts;
}
export interface KubernetesClusterKubeConfig {
}

export function kubernetesClusterKubeConfigToTerraform(struct?: KubernetesClusterKubeConfig): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
  }
}

export class KubernetesClusterKubeConfigOutputReference extends cdktf.ComplexObject {
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

  public get internalValue(): KubernetesClusterKubeConfig | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: KubernetesClusterKubeConfig | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
    }
  }

  // client_certificate - computed: true, optional: false, required: false
  public get clientCertificate() {
    return this.getStringAttribute('client_certificate');
  }

  // client_key - computed: true, optional: false, required: false
  public get clientKey() {
    return this.getStringAttribute('client_key');
  }

  // cluster_ca_certificate - computed: true, optional: false, required: false
  public get clusterCaCertificate() {
    return this.getStringAttribute('cluster_ca_certificate');
  }

  // expires_at - computed: true, optional: false, required: false
  public get expiresAt() {
    return this.getStringAttribute('expires_at');
  }

  // host - computed: true, optional: false, required: false
  public get host() {
    return this.getStringAttribute('host');
  }

  // raw_config - computed: true, optional: false, required: false
  public get rawConfig() {
    return this.getStringAttribute('raw_config');
  }

  // token - computed: true, optional: false, required: false
  public get token() {
    return this.getStringAttribute('token');
  }
}

export class KubernetesClusterKubeConfigList extends cdktf.ComplexList {

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
  public get(index: number): KubernetesClusterKubeConfigOutputReference {
    return new KubernetesClusterKubeConfigOutputReference(this.terraformResource, this.terraformAttribute, index, this.wrapsSet);
  }
}
export interface KubernetesClusterMaintenancePolicy {
  /**
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/kubernetes_cluster#day KubernetesCluster#day}
  */
  readonly day?: string;
  /**
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/kubernetes_cluster#start_time KubernetesCluster#start_time}
  */
  readonly startTime?: string;
}

export function kubernetesClusterMaintenancePolicyToTerraform(struct?: KubernetesClusterMaintenancePolicyOutputReference | KubernetesClusterMaintenancePolicy): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    day: cdktf.stringToTerraform(struct!.day),
    start_time: cdktf.stringToTerraform(struct!.startTime),
  }
}

export class KubernetesClusterMaintenancePolicyOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string) {
    super(terraformResource, terraformAttribute, false, 0);
  }

  public get internalValue(): KubernetesClusterMaintenancePolicy | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._day !== undefined) {
      hasAnyValues = true;
      internalValueResult.day = this._day;
    }
    if (this._startTime !== undefined) {
      hasAnyValues = true;
      internalValueResult.startTime = this._startTime;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: KubernetesClusterMaintenancePolicy | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this._day = undefined;
      this._startTime = undefined;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this._day = value.day;
      this._startTime = value.startTime;
    }
  }

  // day - computed: true, optional: true, required: false
  private _day?: string; 
  public get day() {
    return this.getStringAttribute('day');
  }
  public set day(value: string) {
    this._day = value;
  }
  public resetDay() {
    this._day = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get dayInput() {
    return this._day;
  }

  // duration - computed: true, optional: false, required: false
  public get duration() {
    return this.getStringAttribute('duration');
  }

  // start_time - computed: true, optional: true, required: false
  private _startTime?: string; 
  public get startTime() {
    return this.getStringAttribute('start_time');
  }
  public set startTime(value: string) {
    this._startTime = value;
  }
  public resetStartTime() {
    this._startTime = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get startTimeInput() {
    return this._startTime;
  }
}
export interface KubernetesClusterNodePoolNodes {
}

export function kubernetesClusterNodePoolNodesToTerraform(struct?: KubernetesClusterNodePoolNodes): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
  }
}

export class KubernetesClusterNodePoolNodesOutputReference extends cdktf.ComplexObject {
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

  public get internalValue(): KubernetesClusterNodePoolNodes | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: KubernetesClusterNodePoolNodes | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
    }
  }

  // created_at - computed: true, optional: false, required: false
  public get createdAt() {
    return this.getStringAttribute('created_at');
  }

  // droplet_id - computed: true, optional: false, required: false
  public get dropletId() {
    return this.getStringAttribute('droplet_id');
  }

  // id - computed: true, optional: false, required: false
  public get id() {
    return this.getStringAttribute('id');
  }

  // name - computed: true, optional: false, required: false
  public get name() {
    return this.getStringAttribute('name');
  }

  // status - computed: true, optional: false, required: false
  public get status() {
    return this.getStringAttribute('status');
  }

  // updated_at - computed: true, optional: false, required: false
  public get updatedAt() {
    return this.getStringAttribute('updated_at');
  }
}

export class KubernetesClusterNodePoolNodesList extends cdktf.ComplexList {

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
  public get(index: number): KubernetesClusterNodePoolNodesOutputReference {
    return new KubernetesClusterNodePoolNodesOutputReference(this.terraformResource, this.terraformAttribute, index, this.wrapsSet);
  }
}
export interface KubernetesClusterNodePoolTaint {
  /**
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/kubernetes_cluster#effect KubernetesCluster#effect}
  */
  readonly effect: string;
  /**
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/kubernetes_cluster#key KubernetesCluster#key}
  */
  readonly key: string;
  /**
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/kubernetes_cluster#value KubernetesCluster#value}
  */
  readonly value: string;
}

export function kubernetesClusterNodePoolTaintToTerraform(struct?: KubernetesClusterNodePoolTaint | cdktf.IResolvable): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    effect: cdktf.stringToTerraform(struct!.effect),
    key: cdktf.stringToTerraform(struct!.key),
    value: cdktf.stringToTerraform(struct!.value),
  }
}

export class KubernetesClusterNodePoolTaintOutputReference extends cdktf.ComplexObject {
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

  public get internalValue(): KubernetesClusterNodePoolTaint | cdktf.IResolvable | undefined {
    if (this.resolvableValue) {
      return this.resolvableValue;
    }
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._effect !== undefined) {
      hasAnyValues = true;
      internalValueResult.effect = this._effect;
    }
    if (this._key !== undefined) {
      hasAnyValues = true;
      internalValueResult.key = this._key;
    }
    if (this._value !== undefined) {
      hasAnyValues = true;
      internalValueResult.value = this._value;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: KubernetesClusterNodePoolTaint | cdktf.IResolvable | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this.resolvableValue = undefined;
      this._effect = undefined;
      this._key = undefined;
      this._value = undefined;
    }
    else if (cdktf.Tokenization.isResolvable(value)) {
      this.isEmptyObject = false;
      this.resolvableValue = value;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this.resolvableValue = undefined;
      this._effect = value.effect;
      this._key = value.key;
      this._value = value.value;
    }
  }

  // effect - computed: false, optional: false, required: true
  private _effect?: string; 
  public get effect() {
    return this.getStringAttribute('effect');
  }
  public set effect(value: string) {
    this._effect = value;
  }
  // Temporarily expose input value. Use with caution.
  public get effectInput() {
    return this._effect;
  }

  // key - computed: false, optional: false, required: true
  private _key?: string; 
  public get key() {
    return this.getStringAttribute('key');
  }
  public set key(value: string) {
    this._key = value;
  }
  // Temporarily expose input value. Use with caution.
  public get keyInput() {
    return this._key;
  }

  // value - computed: false, optional: false, required: true
  private _value?: string; 
  public get value() {
    return this.getStringAttribute('value');
  }
  public set value(value: string) {
    this._value = value;
  }
  // Temporarily expose input value. Use with caution.
  public get valueInput() {
    return this._value;
  }
}

export class KubernetesClusterNodePoolTaintList extends cdktf.ComplexList {
  public internalValue? : KubernetesClusterNodePoolTaint[] | cdktf.IResolvable

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
  public get(index: number): KubernetesClusterNodePoolTaintOutputReference {
    return new KubernetesClusterNodePoolTaintOutputReference(this.terraformResource, this.terraformAttribute, index, this.wrapsSet);
  }
}
export interface KubernetesClusterNodePool {
  /**
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/kubernetes_cluster#auto_scale KubernetesCluster#auto_scale}
  */
  readonly autoScale?: boolean | cdktf.IResolvable;
  /**
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/kubernetes_cluster#labels KubernetesCluster#labels}
  */
  readonly labels?: { [key: string]: string };
  /**
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/kubernetes_cluster#max_nodes KubernetesCluster#max_nodes}
  */
  readonly maxNodes?: number;
  /**
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/kubernetes_cluster#min_nodes KubernetesCluster#min_nodes}
  */
  readonly minNodes?: number;
  /**
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/kubernetes_cluster#name KubernetesCluster#name}
  */
  readonly name: string;
  /**
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/kubernetes_cluster#node_count KubernetesCluster#node_count}
  */
  readonly nodeCount?: number;
  /**
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/kubernetes_cluster#size KubernetesCluster#size}
  */
  readonly size: string;
  /**
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/kubernetes_cluster#tags KubernetesCluster#tags}
  */
  readonly tags?: string[];
  /**
  * taint block
  * 
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/kubernetes_cluster#taint KubernetesCluster#taint}
  */
  readonly taint?: KubernetesClusterNodePoolTaint[] | cdktf.IResolvable;
}

export function kubernetesClusterNodePoolToTerraform(struct?: KubernetesClusterNodePoolOutputReference | KubernetesClusterNodePool): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    auto_scale: cdktf.booleanToTerraform(struct!.autoScale),
    labels: cdktf.hashMapper(cdktf.stringToTerraform)(struct!.labels),
    max_nodes: cdktf.numberToTerraform(struct!.maxNodes),
    min_nodes: cdktf.numberToTerraform(struct!.minNodes),
    name: cdktf.stringToTerraform(struct!.name),
    node_count: cdktf.numberToTerraform(struct!.nodeCount),
    size: cdktf.stringToTerraform(struct!.size),
    tags: cdktf.listMapper(cdktf.stringToTerraform, false)(struct!.tags),
    taint: cdktf.listMapper(kubernetesClusterNodePoolTaintToTerraform, true)(struct!.taint),
  }
}

export class KubernetesClusterNodePoolOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string) {
    super(terraformResource, terraformAttribute, false, 0);
  }

  public get internalValue(): KubernetesClusterNodePool | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._autoScale !== undefined) {
      hasAnyValues = true;
      internalValueResult.autoScale = this._autoScale;
    }
    if (this._labels !== undefined) {
      hasAnyValues = true;
      internalValueResult.labels = this._labels;
    }
    if (this._maxNodes !== undefined) {
      hasAnyValues = true;
      internalValueResult.maxNodes = this._maxNodes;
    }
    if (this._minNodes !== undefined) {
      hasAnyValues = true;
      internalValueResult.minNodes = this._minNodes;
    }
    if (this._name !== undefined) {
      hasAnyValues = true;
      internalValueResult.name = this._name;
    }
    if (this._nodeCount !== undefined) {
      hasAnyValues = true;
      internalValueResult.nodeCount = this._nodeCount;
    }
    if (this._size !== undefined) {
      hasAnyValues = true;
      internalValueResult.size = this._size;
    }
    if (this._tags !== undefined) {
      hasAnyValues = true;
      internalValueResult.tags = this._tags;
    }
    if (this._taint?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.taint = this._taint?.internalValue;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: KubernetesClusterNodePool | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this._autoScale = undefined;
      this._labels = undefined;
      this._maxNodes = undefined;
      this._minNodes = undefined;
      this._name = undefined;
      this._nodeCount = undefined;
      this._size = undefined;
      this._tags = undefined;
      this._taint.internalValue = undefined;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this._autoScale = value.autoScale;
      this._labels = value.labels;
      this._maxNodes = value.maxNodes;
      this._minNodes = value.minNodes;
      this._name = value.name;
      this._nodeCount = value.nodeCount;
      this._size = value.size;
      this._tags = value.tags;
      this._taint.internalValue = value.taint;
    }
  }

  // actual_node_count - computed: true, optional: false, required: false
  public get actualNodeCount() {
    return this.getNumberAttribute('actual_node_count');
  }

  // auto_scale - computed: false, optional: true, required: false
  private _autoScale?: boolean | cdktf.IResolvable; 
  public get autoScale() {
    return this.getBooleanAttribute('auto_scale');
  }
  public set autoScale(value: boolean | cdktf.IResolvable) {
    this._autoScale = value;
  }
  public resetAutoScale() {
    this._autoScale = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get autoScaleInput() {
    return this._autoScale;
  }

  // id - computed: true, optional: false, required: false
  public get id() {
    return this.getStringAttribute('id');
  }

  // labels - computed: false, optional: true, required: false
  private _labels?: { [key: string]: string }; 
  public get labels() {
    return this.getStringMapAttribute('labels');
  }
  public set labels(value: { [key: string]: string }) {
    this._labels = value;
  }
  public resetLabels() {
    this._labels = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get labelsInput() {
    return this._labels;
  }

  // max_nodes - computed: false, optional: true, required: false
  private _maxNodes?: number; 
  public get maxNodes() {
    return this.getNumberAttribute('max_nodes');
  }
  public set maxNodes(value: number) {
    this._maxNodes = value;
  }
  public resetMaxNodes() {
    this._maxNodes = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get maxNodesInput() {
    return this._maxNodes;
  }

  // min_nodes - computed: false, optional: true, required: false
  private _minNodes?: number; 
  public get minNodes() {
    return this.getNumberAttribute('min_nodes');
  }
  public set minNodes(value: number) {
    this._minNodes = value;
  }
  public resetMinNodes() {
    this._minNodes = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get minNodesInput() {
    return this._minNodes;
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

  // node_count - computed: false, optional: true, required: false
  private _nodeCount?: number; 
  public get nodeCount() {
    return this.getNumberAttribute('node_count');
  }
  public set nodeCount(value: number) {
    this._nodeCount = value;
  }
  public resetNodeCount() {
    this._nodeCount = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get nodeCountInput() {
    return this._nodeCount;
  }

  // nodes - computed: true, optional: false, required: false
  private _nodes = new KubernetesClusterNodePoolNodesList(this, "nodes", false);
  public get nodes() {
    return this._nodes;
  }

  // size - computed: false, optional: false, required: true
  private _size?: string; 
  public get size() {
    return this.getStringAttribute('size');
  }
  public set size(value: string) {
    this._size = value;
  }
  // Temporarily expose input value. Use with caution.
  public get sizeInput() {
    return this._size;
  }

  // tags - computed: false, optional: true, required: false
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

  // taint - computed: false, optional: true, required: false
  private _taint = new KubernetesClusterNodePoolTaintList(this, "taint", true);
  public get taint() {
    return this._taint;
  }
  public putTaint(value: KubernetesClusterNodePoolTaint[] | cdktf.IResolvable) {
    this._taint.internalValue = value;
  }
  public resetTaint() {
    this._taint.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get taintInput() {
    return this._taint.internalValue;
  }
}
export interface KubernetesClusterTimeouts {
  /**
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/kubernetes_cluster#create KubernetesCluster#create}
  */
  readonly create?: string;
}

export function kubernetesClusterTimeoutsToTerraform(struct?: KubernetesClusterTimeouts | cdktf.IResolvable): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    create: cdktf.stringToTerraform(struct!.create),
  }
}

export class KubernetesClusterTimeoutsOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;
  private resolvableValue?: cdktf.IResolvable;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string) {
    super(terraformResource, terraformAttribute, false);
  }

  public get internalValue(): KubernetesClusterTimeouts | cdktf.IResolvable | undefined {
    if (this.resolvableValue) {
      return this.resolvableValue;
    }
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._create !== undefined) {
      hasAnyValues = true;
      internalValueResult.create = this._create;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: KubernetesClusterTimeouts | cdktf.IResolvable | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this.resolvableValue = undefined;
      this._create = undefined;
    }
    else if (cdktf.Tokenization.isResolvable(value)) {
      this.isEmptyObject = false;
      this.resolvableValue = value;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this.resolvableValue = undefined;
      this._create = value.create;
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
}

/**
* Represents a {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/kubernetes_cluster digitalocean_kubernetes_cluster}
*/
export class KubernetesCluster extends cdktf.TerraformResource {

  // =================
  // STATIC PROPERTIES
  // =================
  public static readonly tfResourceType = "digitalocean_kubernetes_cluster";

  // ===========
  // INITIALIZER
  // ===========

  /**
  * Create a new {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/kubernetes_cluster digitalocean_kubernetes_cluster} Resource
  *
  * @param scope The scope in which to define this construct
  * @param id The scoped construct ID. Must be unique amongst siblings in the same scope
  * @param options KubernetesClusterConfig
  */
  public constructor(scope: Construct, id: string, config: KubernetesClusterConfig) {
    super(scope, id, {
      terraformResourceType: 'digitalocean_kubernetes_cluster',
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
    this._autoUpgrade = config.autoUpgrade;
    this._ha = config.ha;
    this._id = config.id;
    this._name = config.name;
    this._region = config.region;
    this._registryIntegration = config.registryIntegration;
    this._surgeUpgrade = config.surgeUpgrade;
    this._tags = config.tags;
    this._version = config.version;
    this._vpcUuid = config.vpcUuid;
    this._maintenancePolicy.internalValue = config.maintenancePolicy;
    this._nodePool.internalValue = config.nodePool;
    this._timeouts.internalValue = config.timeouts;
  }

  // ==========
  // ATTRIBUTES
  // ==========

  // auto_upgrade - computed: false, optional: true, required: false
  private _autoUpgrade?: boolean | cdktf.IResolvable; 
  public get autoUpgrade() {
    return this.getBooleanAttribute('auto_upgrade');
  }
  public set autoUpgrade(value: boolean | cdktf.IResolvable) {
    this._autoUpgrade = value;
  }
  public resetAutoUpgrade() {
    this._autoUpgrade = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get autoUpgradeInput() {
    return this._autoUpgrade;
  }

  // cluster_subnet - computed: true, optional: false, required: false
  public get clusterSubnet() {
    return this.getStringAttribute('cluster_subnet');
  }

  // created_at - computed: true, optional: false, required: false
  public get createdAt() {
    return this.getStringAttribute('created_at');
  }

  // endpoint - computed: true, optional: false, required: false
  public get endpoint() {
    return this.getStringAttribute('endpoint');
  }

  // ha - computed: false, optional: true, required: false
  private _ha?: boolean | cdktf.IResolvable; 
  public get ha() {
    return this.getBooleanAttribute('ha');
  }
  public set ha(value: boolean | cdktf.IResolvable) {
    this._ha = value;
  }
  public resetHa() {
    this._ha = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get haInput() {
    return this._ha;
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

  // ipv4_address - computed: true, optional: false, required: false
  public get ipv4Address() {
    return this.getStringAttribute('ipv4_address');
  }

  // kube_config - computed: true, optional: false, required: false
  private _kubeConfig = new KubernetesClusterKubeConfigList(this, "kube_config", false);
  public get kubeConfig() {
    return this._kubeConfig;
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

  // registry_integration - computed: false, optional: true, required: false
  private _registryIntegration?: boolean | cdktf.IResolvable; 
  public get registryIntegration() {
    return this.getBooleanAttribute('registry_integration');
  }
  public set registryIntegration(value: boolean | cdktf.IResolvable) {
    this._registryIntegration = value;
  }
  public resetRegistryIntegration() {
    this._registryIntegration = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get registryIntegrationInput() {
    return this._registryIntegration;
  }

  // service_subnet - computed: true, optional: false, required: false
  public get serviceSubnet() {
    return this.getStringAttribute('service_subnet');
  }

  // status - computed: true, optional: false, required: false
  public get status() {
    return this.getStringAttribute('status');
  }

  // surge_upgrade - computed: false, optional: true, required: false
  private _surgeUpgrade?: boolean | cdktf.IResolvable; 
  public get surgeUpgrade() {
    return this.getBooleanAttribute('surge_upgrade');
  }
  public set surgeUpgrade(value: boolean | cdktf.IResolvable) {
    this._surgeUpgrade = value;
  }
  public resetSurgeUpgrade() {
    this._surgeUpgrade = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get surgeUpgradeInput() {
    return this._surgeUpgrade;
  }

  // tags - computed: false, optional: true, required: false
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

  // updated_at - computed: true, optional: false, required: false
  public get updatedAt() {
    return this.getStringAttribute('updated_at');
  }

  // urn - computed: true, optional: false, required: false
  public get urn() {
    return this.getStringAttribute('urn');
  }

  // version - computed: false, optional: false, required: true
  private _version?: string; 
  public get version() {
    return this.getStringAttribute('version');
  }
  public set version(value: string) {
    this._version = value;
  }
  // Temporarily expose input value. Use with caution.
  public get versionInput() {
    return this._version;
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

  // maintenance_policy - computed: false, optional: true, required: false
  private _maintenancePolicy = new KubernetesClusterMaintenancePolicyOutputReference(this, "maintenance_policy");
  public get maintenancePolicy() {
    return this._maintenancePolicy;
  }
  public putMaintenancePolicy(value: KubernetesClusterMaintenancePolicy) {
    this._maintenancePolicy.internalValue = value;
  }
  public resetMaintenancePolicy() {
    this._maintenancePolicy.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get maintenancePolicyInput() {
    return this._maintenancePolicy.internalValue;
  }

  // node_pool - computed: false, optional: false, required: true
  private _nodePool = new KubernetesClusterNodePoolOutputReference(this, "node_pool");
  public get nodePool() {
    return this._nodePool;
  }
  public putNodePool(value: KubernetesClusterNodePool) {
    this._nodePool.internalValue = value;
  }
  // Temporarily expose input value. Use with caution.
  public get nodePoolInput() {
    return this._nodePool.internalValue;
  }

  // timeouts - computed: false, optional: true, required: false
  private _timeouts = new KubernetesClusterTimeoutsOutputReference(this, "timeouts");
  public get timeouts() {
    return this._timeouts;
  }
  public putTimeouts(value: KubernetesClusterTimeouts) {
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
      auto_upgrade: cdktf.booleanToTerraform(this._autoUpgrade),
      ha: cdktf.booleanToTerraform(this._ha),
      id: cdktf.stringToTerraform(this._id),
      name: cdktf.stringToTerraform(this._name),
      region: cdktf.stringToTerraform(this._region),
      registry_integration: cdktf.booleanToTerraform(this._registryIntegration),
      surge_upgrade: cdktf.booleanToTerraform(this._surgeUpgrade),
      tags: cdktf.listMapper(cdktf.stringToTerraform, false)(this._tags),
      version: cdktf.stringToTerraform(this._version),
      vpc_uuid: cdktf.stringToTerraform(this._vpcUuid),
      maintenance_policy: kubernetesClusterMaintenancePolicyToTerraform(this._maintenancePolicy.internalValue),
      node_pool: kubernetesClusterNodePoolToTerraform(this._nodePool.internalValue),
      timeouts: kubernetesClusterTimeoutsToTerraform(this._timeouts.internalValue),
    };
  }
}
