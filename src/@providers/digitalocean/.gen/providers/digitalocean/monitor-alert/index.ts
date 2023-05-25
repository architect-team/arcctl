// https://www.terraform.io/docs/providers/digitalocean/r/monitor_alert
// generated from terraform resource schema
import * as cdktf from 'cdktf';
import { Construct } from 'constructs';

// Configuration

export interface MonitorAlertConfig extends cdktf.TerraformMetaArguments {
  /**
   * The comparison operator to use for value
   *
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/monitor_alert#compare MonitorAlert#compare}
   */
  readonly compare: string;
  /**
   * Description of the alert policy
   *
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/monitor_alert#description MonitorAlert#description}
   */
  readonly description: string;
  /**
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/monitor_alert#enabled MonitorAlert#enabled}
   */
  readonly enabled?: boolean | cdktf.IResolvable;
  /**
   * The droplets to apply the alert policy to
   *
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/monitor_alert#entities MonitorAlert#entities}
   */
  readonly entities?: string[];
  /**
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/monitor_alert#id MonitorAlert#id}
   *
   * Please be aware that the id field is automatically added to all resources in Terraform providers using a Terraform provider SDK version below 2.
   * If you experience problems setting this value it might not be settable. Please take a look at the provider documentation to ensure it should be settable.
   */
  readonly id?: string;
  /**
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/monitor_alert#tags MonitorAlert#tags}
   */
  readonly tags?: string[];
  /**
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/monitor_alert#type MonitorAlert#type}
   */
  readonly type: string;
  /**
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/monitor_alert#value MonitorAlert#value}
   */
  readonly value: number;
  /**
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/monitor_alert#window MonitorAlert#window}
   */
  readonly window: string;
  /**
   * alerts block
   *
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/monitor_alert#alerts MonitorAlert#alerts}
   */
  readonly alerts: MonitorAlertAlerts;
}
export interface MonitorAlertAlertsSlack {
  /**
   * The Slack channel to send alerts to
   *
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/monitor_alert#channel MonitorAlert#channel}
   */
  readonly channel: string;
  /**
   * The webhook URL for Slack
   *
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/monitor_alert#url MonitorAlert#url}
   */
  readonly url: string;
}

export function monitorAlertAlertsSlackToTerraform(
  struct?: MonitorAlertAlertsSlack | cdktf.IResolvable,
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
    channel: cdktf.stringToTerraform(struct!.channel),
    url: cdktf.stringToTerraform(struct!.url),
  };
}

export class MonitorAlertAlertsSlackOutputReference extends cdktf.ComplexObject {
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
    | MonitorAlertAlertsSlack
    | cdktf.IResolvable
    | undefined {
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

  public set internalValue(
    value: MonitorAlertAlertsSlack | cdktf.IResolvable | undefined,
  ) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this.resolvableValue = undefined;
      this._channel = undefined;
      this._url = undefined;
    } else if (cdktf.Tokenization.isResolvable(value)) {
      this.isEmptyObject = false;
      this.resolvableValue = value;
    } else {
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

export class MonitorAlertAlertsSlackList extends cdktf.ComplexList {
  public internalValue?: MonitorAlertAlertsSlack[] | cdktf.IResolvable;

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
  public get(index: number): MonitorAlertAlertsSlackOutputReference {
    return new MonitorAlertAlertsSlackOutputReference(
      this.terraformResource,
      this.terraformAttribute,
      index,
      this.wrapsSet,
    );
  }
}
export interface MonitorAlertAlerts {
  /**
   * List of email addresses to sent notifications to
   *
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/monitor_alert#email MonitorAlert#email}
   */
  readonly email?: string[];
  /**
   * slack block
   *
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/monitor_alert#slack MonitorAlert#slack}
   */
  readonly slack?: MonitorAlertAlertsSlack[] | cdktf.IResolvable;
}

export function monitorAlertAlertsToTerraform(
  struct?: MonitorAlertAlertsOutputReference | MonitorAlertAlerts,
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
    email: cdktf.listMapper(cdktf.stringToTerraform, false)(struct!.email),
    slack: cdktf.listMapper(
      monitorAlertAlertsSlackToTerraform,
      true,
    )(struct!.slack),
  };
}

export class MonitorAlertAlertsOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;

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

  public get internalValue(): MonitorAlertAlerts | undefined {
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

  public set internalValue(value: MonitorAlertAlerts | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this._email = undefined;
      this._slack.internalValue = undefined;
    } else {
      this.isEmptyObject = Object.keys(value).length === 0;
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
  private _slack = new MonitorAlertAlertsSlackList(this, 'slack', false);
  public get slack() {
    return this._slack;
  }
  public putSlack(value: MonitorAlertAlertsSlack[] | cdktf.IResolvable) {
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

/**
 * Represents a {@link https://www.terraform.io/docs/providers/digitalocean/r/monitor_alert digitalocean_monitor_alert}
 */
export class MonitorAlert extends cdktf.TerraformResource {
  // =================
  // STATIC PROPERTIES
  // =================
  public static readonly tfResourceType = 'digitalocean_monitor_alert';

  // ===========
  // INITIALIZER
  // ===========

  /**
   * Create a new {@link https://www.terraform.io/docs/providers/digitalocean/r/monitor_alert digitalocean_monitor_alert} Resource
   *
   * @param scope The scope in which to define this construct
   * @param id The scoped construct ID. Must be unique amongst siblings in the same scope
   * @param options MonitorAlertConfig
   */
  public constructor(scope: Construct, id: string, config: MonitorAlertConfig) {
    super(scope, id, {
      terraformResourceType: 'digitalocean_monitor_alert',
      terraformGeneratorMetadata: {
        providerName: 'digitalocean',
        providerVersion: '2.26.0',
        providerVersionConstraint: '2.26.0',
      },
      provider: config.provider,
      dependsOn: config.dependsOn,
      count: config.count,
      lifecycle: config.lifecycle,
      provisioners: config.provisioners,
      connection: config.connection,
      forEach: config.forEach,
    });
    this._compare = config.compare;
    this._description = config.description;
    this._enabled = config.enabled;
    this._entities = config.entities;
    this._id = config.id;
    this._tags = config.tags;
    this._type = config.type;
    this._value = config.value;
    this._window = config.window;
    this._alerts.internalValue = config.alerts;
  }

  // ==========
  // ATTRIBUTES
  // ==========

  // compare - computed: false, optional: false, required: true
  private _compare?: string;
  public get compare() {
    return this.getStringAttribute('compare');
  }
  public set compare(value: string) {
    this._compare = value;
  }
  // Temporarily expose input value. Use with caution.
  public get compareInput() {
    return this._compare;
  }

  // description - computed: false, optional: false, required: true
  private _description?: string;
  public get description() {
    return this.getStringAttribute('description');
  }
  public set description(value: string) {
    this._description = value;
  }
  // Temporarily expose input value. Use with caution.
  public get descriptionInput() {
    return this._description;
  }

  // enabled - computed: false, optional: true, required: false
  private _enabled?: boolean | cdktf.IResolvable;
  public get enabled() {
    return this.getBooleanAttribute('enabled');
  }
  public set enabled(value: boolean | cdktf.IResolvable) {
    this._enabled = value;
  }
  public resetEnabled() {
    this._enabled = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get enabledInput() {
    return this._enabled;
  }

  // entities - computed: false, optional: true, required: false
  private _entities?: string[];
  public get entities() {
    return cdktf.Fn.tolist(this.getListAttribute('entities'));
  }
  public set entities(value: string[]) {
    this._entities = value;
  }
  public resetEntities() {
    this._entities = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get entitiesInput() {
    return this._entities;
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

  // uuid - computed: true, optional: false, required: false
  public get uuid() {
    return this.getStringAttribute('uuid');
  }

  // value - computed: false, optional: false, required: true
  private _value?: number;
  public get value() {
    return this.getNumberAttribute('value');
  }
  public set value(value: number) {
    this._value = value;
  }
  // Temporarily expose input value. Use with caution.
  public get valueInput() {
    return this._value;
  }

  // window - computed: false, optional: false, required: true
  private _window?: string;
  public get window() {
    return this.getStringAttribute('window');
  }
  public set window(value: string) {
    this._window = value;
  }
  // Temporarily expose input value. Use with caution.
  public get windowInput() {
    return this._window;
  }

  // alerts - computed: false, optional: false, required: true
  private _alerts = new MonitorAlertAlertsOutputReference(this, 'alerts');
  public get alerts() {
    return this._alerts;
  }
  public putAlerts(value: MonitorAlertAlerts) {
    this._alerts.internalValue = value;
  }
  // Temporarily expose input value. Use with caution.
  public get alertsInput() {
    return this._alerts.internalValue;
  }

  // =========
  // SYNTHESIS
  // =========

  protected synthesizeAttributes(): { [name: string]: any } {
    return {
      compare: cdktf.stringToTerraform(this._compare),
      description: cdktf.stringToTerraform(this._description),
      enabled: cdktf.booleanToTerraform(this._enabled),
      entities: cdktf.listMapper(
        cdktf.stringToTerraform,
        false,
      )(this._entities),
      id: cdktf.stringToTerraform(this._id),
      tags: cdktf.listMapper(cdktf.stringToTerraform, false)(this._tags),
      type: cdktf.stringToTerraform(this._type),
      value: cdktf.numberToTerraform(this._value),
      window: cdktf.stringToTerraform(this._window),
      alerts: monitorAlertAlertsToTerraform(this._alerts.internalValue),
    };
  }
}
