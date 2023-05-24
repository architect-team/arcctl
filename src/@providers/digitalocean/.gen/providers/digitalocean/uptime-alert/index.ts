// https://www.terraform.io/docs/providers/digitalocean/r/uptime_alert
// generated from terraform resource schema

import { Construct } from 'npm:constructs';
import * as cdktf from 'cdktf';

// Configuration

export interface UptimeAlertConfig extends cdktf.TerraformMetaArguments {
  /**
  * A unique identifier for a check.
  *
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/uptime_alert#check_id UptimeAlert#check_id}
  */
  readonly checkId: string;
  /**
  * The comparison operator used against the alert's threshold. Enum: 'greater_than' 'less_than
  *
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/uptime_alert#comparison UptimeAlert#comparison}
  */
  readonly comparison?: string;
  /**
  * A human-friendly display name for the alert.
  *
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/uptime_alert#name UptimeAlert#name}
  */
  readonly name: string;
  /**
  * Period of time the threshold must be exceeded to trigger the alert. Enum '2m' '3m' '5m' '10m' '15m' '30m' '1h'
  *
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/uptime_alert#period UptimeAlert#period}
  */
  readonly period?: string;
  /**
  * The threshold at which the alert will enter a trigger state. The specific threshold is dependent on the alert type.
  *
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/uptime_alert#threshold UptimeAlert#threshold}
  */
  readonly threshold?: number;
  /**
  * The type of health check to perform. Enum: 'latency' 'down' 'down_global' 'ssl_expiry'
  *
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/uptime_alert#type UptimeAlert#type}
  */
  readonly type: string;
  /**
  * notifications block
  *
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/uptime_alert#notifications UptimeAlert#notifications}
  */
  readonly notifications: UptimeAlertNotifications[] | cdktf.IResolvable;
}
export interface UptimeAlertNotificationsSlack {
  /**
  * The Slack channel to send alerts to
  *
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/uptime_alert#channel UptimeAlert#channel}
  */
  readonly channel: string;
  /**
  * The webhook URL for Slack
  *
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/uptime_alert#url UptimeAlert#url}
  */
  readonly url: string;
}

export function uptimeAlertNotificationsSlackToTerraform(struct?: UptimeAlertNotificationsSlack | cdktf.IResolvable): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    channel: cdktf.stringToTerraform(struct!.channel),
    url: cdktf.stringToTerraform(struct!.url),
  }
}

export class UptimeAlertNotificationsSlackOutputReference extends cdktf.ComplexObject {
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

  public get internalValue(): UptimeAlertNotificationsSlack | cdktf.IResolvable | undefined {
    if (this.resolvableValue) {
      return this.resolvableValue;
    }
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._channel !== undefined) {
      hasAnyValues = true;
      internalValueResult.channel = this._channel;
    }
    if (this._url !== undefined) {
      hasAnyValues = true;
      internalValueResult.url = this._url;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: UptimeAlertNotificationsSlack | cdktf.IResolvable | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this.resolvableValue = undefined;
      this._channel = undefined;
      this._url = undefined;
    }
    else if (cdktf.Tokenization.isResolvable(value)) {
      this.isEmptyObject = false;
      this.resolvableValue = value;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this.resolvableValue = undefined;
      this._channel = value.channel;
      this._url = value.url;
    }
  }

  // channel - computed: false, optional: false, required: true
  private _channel?: string;
  public get channel() {
    return this.getStringAttribute('channel');
  }
  public set channel(value: string) {
    this._channel = value;
  }
  // Temporarily expose input value. Use with caution.
  public get channelInput() {
    return this._channel;
  }

  // url - computed: false, optional: false, required: true
  private _url?: string;
  public get url() {
    return this.getStringAttribute('url');
  }
  public set url(value: string) {
    this._url = value;
  }
  // Temporarily expose input value. Use with caution.
  public get urlInput() {
    return this._url;
  }
}

export class UptimeAlertNotificationsSlackList extends cdktf.ComplexList {
  public internalValue? : UptimeAlertNotificationsSlack[] | cdktf.IResolvable

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
  public get(index: number): UptimeAlertNotificationsSlackOutputReference {
    return new UptimeAlertNotificationsSlackOutputReference(this.terraformResource, this.terraformAttribute, index, this.wrapsSet);
  }
}
export interface UptimeAlertNotifications {
  /**
  * List of email addresses to sent notifications to
  *
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/uptime_alert#email UptimeAlert#email}
  */
  readonly email?: string[];
  /**
  * slack block
  *
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/uptime_alert#slack UptimeAlert#slack}
  */
  readonly slack?: UptimeAlertNotificationsSlack[] | cdktf.IResolvable;
}

export function uptimeAlertNotificationsToTerraform(struct?: UptimeAlertNotifications | cdktf.IResolvable): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    email: cdktf.listMapper(cdktf.stringToTerraform, false)(struct!.email),
    slack: cdktf.listMapper(uptimeAlertNotificationsSlackToTerraform, true)(struct!.slack),
  }
}

export class UptimeAlertNotificationsOutputReference extends cdktf.ComplexObject {
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

  public get internalValue(): UptimeAlertNotifications | cdktf.IResolvable | undefined {
    if (this.resolvableValue) {
      return this.resolvableValue;
    }
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._email !== undefined) {
      hasAnyValues = true;
      internalValueResult.email = this._email;
    }
    if (this._slack?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.slack = this._slack?.internalValue;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: UptimeAlertNotifications | cdktf.IResolvable | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this.resolvableValue = undefined;
      this._email = undefined;
      this._slack.internalValue = undefined;
    }
    else if (cdktf.Tokenization.isResolvable(value)) {
      this.isEmptyObject = false;
      this.resolvableValue = value;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this.resolvableValue = undefined;
      this._email = value.email;
      this._slack.internalValue = value.slack;
    }
  }

  // email - computed: false, optional: true, required: false
  private _email?: string[];
  public get email() {
    return this.getListAttribute('email');
  }
  public set email(value: string[]) {
    this._email = value;
  }
  public resetEmail() {
    this._email = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get emailInput() {
    return this._email;
  }

  // slack - computed: false, optional: true, required: false
  private _slack = new UptimeAlertNotificationsSlackList(this, "slack", false);
  public get slack() {
    return this._slack;
  }
  public putSlack(value: UptimeAlertNotificationsSlack[] | cdktf.IResolvable) {
    this._slack.internalValue = value;
  }
  public resetSlack() {
    this._slack.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get slackInput() {
    return this._slack.internalValue;
  }
}

export class UptimeAlertNotificationsList extends cdktf.ComplexList {
  public internalValue? : UptimeAlertNotifications[] | cdktf.IResolvable

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
  public get(index: number): UptimeAlertNotificationsOutputReference {
    return new UptimeAlertNotificationsOutputReference(this.terraformResource, this.terraformAttribute, index, this.wrapsSet);
  }
}

/**
* Represents a {@link https://www.terraform.io/docs/providers/digitalocean/r/uptime_alert digitalocean_uptime_alert}
*/
export class UptimeAlert extends cdktf.TerraformResource {

  // =================
  // STATIC PROPERTIES
  // =================
  public static readonly tfResourceType = "digitalocean_uptime_alert";

  // ===========
  // INITIALIZER
  // ===========

  /**
  * Create a new {@link https://www.terraform.io/docs/providers/digitalocean/r/uptime_alert digitalocean_uptime_alert} Resource
  *
  * @param scope The scope in which to define this construct
  * @param id The scoped construct ID. Must be unique amongst siblings in the same scope
  * @param options UptimeAlertConfig
  */
  public constructor(scope: Construct, id: string, config: UptimeAlertConfig) {
    super(scope, id, {
      terraformResourceType: 'digitalocean_uptime_alert',
      terraformGeneratorMetadata: {
        providerName: 'digitalocean',
        providerVersion: '2.26.0',
        providerVersionConstraint: '2.26.0'
      },
      provider: config.provider,
      dependsOn: config.dependsOn,
      count: config.count,
      lifecycle: config.lifecycle,
      provisioners: config.provisioners,
      connection: config.connection,
      forEach: config.forEach
    });
    this._checkId = config.checkId;
    this._comparison = config.comparison;
    this._name = config.name;
    this._period = config.period;
    this._threshold = config.threshold;
    this._type = config.type;
    this._notifications.internalValue = config.notifications;
  }

  // ==========
  // ATTRIBUTES
  // ==========

  // check_id - computed: false, optional: false, required: true
  private _checkId?: string;
  public get checkId() {
    return this.getStringAttribute('check_id');
  }
  public set checkId(value: string) {
    this._checkId = value;
  }
  // Temporarily expose input value. Use with caution.
  public get checkIdInput() {
    return this._checkId;
  }

  // comparison - computed: false, optional: true, required: false
  private _comparison?: string;
  public get comparison() {
    return this.getStringAttribute('comparison');
  }
  public set comparison(value: string) {
    this._comparison = value;
  }
  public resetComparison() {
    this._comparison = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get comparisonInput() {
    return this._comparison;
  }

  // id - computed: true, optional: false, required: false
  public get id() {
    return this.getStringAttribute('id');
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

  // period - computed: false, optional: true, required: false
  private _period?: string;
  public get period() {
    return this.getStringAttribute('period');
  }
  public set period(value: string) {
    this._period = value;
  }
  public resetPeriod() {
    this._period = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get periodInput() {
    return this._period;
  }

  // threshold - computed: false, optional: true, required: false
  private _threshold?: number;
  public get threshold() {
    return this.getNumberAttribute('threshold');
  }
  public set threshold(value: number) {
    this._threshold = value;
  }
  public resetThreshold() {
    this._threshold = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get thresholdInput() {
    return this._threshold;
  }

  // type - computed: false, optional: false, required: true
  private _type?: string;
  public get type() {
    return this.getStringAttribute('type');
  }
  public set type(value: string) {
    this._type = value;
  }
  // Temporarily expose input value. Use with caution.
  public get typeInput() {
    return this._type;
  }

  // notifications - computed: false, optional: false, required: true
  private _notifications = new UptimeAlertNotificationsList(this, "notifications", false);
  public get notifications() {
    return this._notifications;
  }
  public putNotifications(value: UptimeAlertNotifications[] | cdktf.IResolvable) {
    this._notifications.internalValue = value;
  }
  // Temporarily expose input value. Use with caution.
  public get notificationsInput() {
    return this._notifications.internalValue;
  }

  // =========
  // SYNTHESIS
  // =========

  protected synthesizeAttributes(): { [name: string]: any } {
    return {
      check_id: cdktf.stringToTerraform(this._checkId),
      comparison: cdktf.stringToTerraform(this._comparison),
      name: cdktf.stringToTerraform(this._name),
      period: cdktf.stringToTerraform(this._period),
      threshold: cdktf.numberToTerraform(this._threshold),
      type: cdktf.stringToTerraform(this._type),
      notifications: cdktf.listMapper(uptimeAlertNotificationsToTerraform, true)(this._notifications.internalValue),
    };
  }
}
