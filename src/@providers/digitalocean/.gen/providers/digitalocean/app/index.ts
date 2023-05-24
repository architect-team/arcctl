// https://www.terraform.io/docs/providers/digitalocean/r/app
// generated from terraform resource schema

import { Construct } from 'constructs';
import * as cdktf from 'cdktf';

// Configuration

export interface AppConfig extends cdktf.TerraformMetaArguments {
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#id App#id}
  *
  * Please be aware that the id field is automatically added to all resources in Terraform providers using a Terraform provider SDK version below 2.
  * If you experience problems setting this value it might not be settable. Please take a look at the provider documentation to ensure it should be settable.
  */
  readonly id?: string;
  /**
  * spec block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#spec App#spec}
  */
  readonly spec?: AppSpec;
  /**
  * timeouts block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#timeouts App#timeouts}
  */
  readonly timeouts?: AppTimeouts;
}
export interface AppSpecAlert {
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#disabled App#disabled}
  */
  readonly disabled?: boolean | cdktf.IResolvable;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#rule App#rule}
  */
  readonly rule: string;
}

export function appSpecAlertToTerraform(struct?: AppSpecAlert | cdktf.IResolvable): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    disabled: cdktf.booleanToTerraform(struct!.disabled),
    rule: cdktf.stringToTerraform(struct!.rule),
  }
}

export class AppSpecAlertOutputReference extends cdktf.ComplexObject {
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

  public get internalValue(): AppSpecAlert | cdktf.IResolvable | undefined {
    if (this.resolvableValue) {
      return this.resolvableValue;
    }
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._disabled !== undefined) {
      hasAnyValues = true;
      internalValueResult.disabled = this._disabled;
    }
    if (this._rule !== undefined) {
      hasAnyValues = true;
      internalValueResult.rule = this._rule;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecAlert | cdktf.IResolvable | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this.resolvableValue = undefined;
      this._disabled = undefined;
      this._rule = undefined;
    }
    else if (cdktf.Tokenization.isResolvable(value)) {
      this.isEmptyObject = false;
      this.resolvableValue = value;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this.resolvableValue = undefined;
      this._disabled = value.disabled;
      this._rule = value.rule;
    }
  }

  // disabled - computed: false, optional: true, required: false
  private _disabled?: boolean | cdktf.IResolvable; 
  public get disabled() {
    return this.getBooleanAttribute('disabled');
  }
  public set disabled(value: boolean | cdktf.IResolvable) {
    this._disabled = value;
  }
  public resetDisabled() {
    this._disabled = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get disabledInput() {
    return this._disabled;
  }

  // rule - computed: false, optional: false, required: true
  private _rule?: string; 
  public get rule() {
    return this.getStringAttribute('rule');
  }
  public set rule(value: string) {
    this._rule = value;
  }
  // Temporarily expose input value. Use with caution.
  public get ruleInput() {
    return this._rule;
  }
}

export class AppSpecAlertList extends cdktf.ComplexList {
  public internalValue? : AppSpecAlert[] | cdktf.IResolvable

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
  public get(index: number): AppSpecAlertOutputReference {
    return new AppSpecAlertOutputReference(this.terraformResource, this.terraformAttribute, index, this.wrapsSet);
  }
}
export interface AppSpecDatabase {
  /**
  * The name of the underlying DigitalOcean DBaaS cluster. This is required for production databases. For dev databases, if cluster_name is not set, a new cluster will be provisioned.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#cluster_name App#cluster_name}
  */
  readonly clusterName?: string;
  /**
  * The name of the MySQL or PostgreSQL database to configure.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#db_name App#db_name}
  */
  readonly dbName?: string;
  /**
  * The name of the MySQL or PostgreSQL user to configure.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#db_user App#db_user}
  */
  readonly dbUser?: string;
  /**
  * The database engine to use.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#engine App#engine}
  */
  readonly engine?: string;
  /**
  * The name of the component
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#name App#name}
  */
  readonly name?: string;
  /**
  * Whether this is a production or dev database.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#production App#production}
  */
  readonly production?: boolean | cdktf.IResolvable;
  /**
  * The version of the database engine.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#version App#version}
  */
  readonly version?: string;
}

export function appSpecDatabaseToTerraform(struct?: AppSpecDatabase | cdktf.IResolvable): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    cluster_name: cdktf.stringToTerraform(struct!.clusterName),
    db_name: cdktf.stringToTerraform(struct!.dbName),
    db_user: cdktf.stringToTerraform(struct!.dbUser),
    engine: cdktf.stringToTerraform(struct!.engine),
    name: cdktf.stringToTerraform(struct!.name),
    production: cdktf.booleanToTerraform(struct!.production),
    version: cdktf.stringToTerraform(struct!.version),
  }
}

export class AppSpecDatabaseOutputReference extends cdktf.ComplexObject {
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

  public get internalValue(): AppSpecDatabase | cdktf.IResolvable | undefined {
    if (this.resolvableValue) {
      return this.resolvableValue;
    }
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._clusterName !== undefined) {
      hasAnyValues = true;
      internalValueResult.clusterName = this._clusterName;
    }
    if (this._dbName !== undefined) {
      hasAnyValues = true;
      internalValueResult.dbName = this._dbName;
    }
    if (this._dbUser !== undefined) {
      hasAnyValues = true;
      internalValueResult.dbUser = this._dbUser;
    }
    if (this._engine !== undefined) {
      hasAnyValues = true;
      internalValueResult.engine = this._engine;
    }
    if (this._name !== undefined) {
      hasAnyValues = true;
      internalValueResult.name = this._name;
    }
    if (this._production !== undefined) {
      hasAnyValues = true;
      internalValueResult.production = this._production;
    }
    if (this._version !== undefined) {
      hasAnyValues = true;
      internalValueResult.version = this._version;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecDatabase | cdktf.IResolvable | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this.resolvableValue = undefined;
      this._clusterName = undefined;
      this._dbName = undefined;
      this._dbUser = undefined;
      this._engine = undefined;
      this._name = undefined;
      this._production = undefined;
      this._version = undefined;
    }
    else if (cdktf.Tokenization.isResolvable(value)) {
      this.isEmptyObject = false;
      this.resolvableValue = value;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this.resolvableValue = undefined;
      this._clusterName = value.clusterName;
      this._dbName = value.dbName;
      this._dbUser = value.dbUser;
      this._engine = value.engine;
      this._name = value.name;
      this._production = value.production;
      this._version = value.version;
    }
  }

  // cluster_name - computed: false, optional: true, required: false
  private _clusterName?: string; 
  public get clusterName() {
    return this.getStringAttribute('cluster_name');
  }
  public set clusterName(value: string) {
    this._clusterName = value;
  }
  public resetClusterName() {
    this._clusterName = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get clusterNameInput() {
    return this._clusterName;
  }

  // db_name - computed: false, optional: true, required: false
  private _dbName?: string; 
  public get dbName() {
    return this.getStringAttribute('db_name');
  }
  public set dbName(value: string) {
    this._dbName = value;
  }
  public resetDbName() {
    this._dbName = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get dbNameInput() {
    return this._dbName;
  }

  // db_user - computed: false, optional: true, required: false
  private _dbUser?: string; 
  public get dbUser() {
    return this.getStringAttribute('db_user');
  }
  public set dbUser(value: string) {
    this._dbUser = value;
  }
  public resetDbUser() {
    this._dbUser = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get dbUserInput() {
    return this._dbUser;
  }

  // engine - computed: false, optional: true, required: false
  private _engine?: string; 
  public get engine() {
    return this.getStringAttribute('engine');
  }
  public set engine(value: string) {
    this._engine = value;
  }
  public resetEngine() {
    this._engine = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get engineInput() {
    return this._engine;
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

  // production - computed: false, optional: true, required: false
  private _production?: boolean | cdktf.IResolvable; 
  public get production() {
    return this.getBooleanAttribute('production');
  }
  public set production(value: boolean | cdktf.IResolvable) {
    this._production = value;
  }
  public resetProduction() {
    this._production = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get productionInput() {
    return this._production;
  }

  // version - computed: false, optional: true, required: false
  private _version?: string; 
  public get version() {
    return this.getStringAttribute('version');
  }
  public set version(value: string) {
    this._version = value;
  }
  public resetVersion() {
    this._version = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get versionInput() {
    return this._version;
  }
}

export class AppSpecDatabaseList extends cdktf.ComplexList {
  public internalValue? : AppSpecDatabase[] | cdktf.IResolvable

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
  public get(index: number): AppSpecDatabaseOutputReference {
    return new AppSpecDatabaseOutputReference(this.terraformResource, this.terraformAttribute, index, this.wrapsSet);
  }
}
export interface AppSpecDomain {
  /**
  * The hostname for the domain.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#name App#name}
  */
  readonly name: string;
  /**
  * The type of the domain.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#type App#type}
  */
  readonly type?: string;
  /**
  * Indicates whether the domain includes all sub-domains, in addition to the given domain.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#wildcard App#wildcard}
  */
  readonly wildcard?: boolean | cdktf.IResolvable;
  /**
  * If the domain uses DigitalOcean DNS and you would like App Platform to automatically manage it for you, set this to the name of the domain on your account.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#zone App#zone}
  */
  readonly zone?: string;
}

export function appSpecDomainToTerraform(struct?: AppSpecDomain | cdktf.IResolvable): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    name: cdktf.stringToTerraform(struct!.name),
    type: cdktf.stringToTerraform(struct!.type),
    wildcard: cdktf.booleanToTerraform(struct!.wildcard),
    zone: cdktf.stringToTerraform(struct!.zone),
  }
}

export class AppSpecDomainOutputReference extends cdktf.ComplexObject {
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

  public get internalValue(): AppSpecDomain | cdktf.IResolvable | undefined {
    if (this.resolvableValue) {
      return this.resolvableValue;
    }
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._name !== undefined) {
      hasAnyValues = true;
      internalValueResult.name = this._name;
    }
    if (this._type !== undefined) {
      hasAnyValues = true;
      internalValueResult.type = this._type;
    }
    if (this._wildcard !== undefined) {
      hasAnyValues = true;
      internalValueResult.wildcard = this._wildcard;
    }
    if (this._zone !== undefined) {
      hasAnyValues = true;
      internalValueResult.zone = this._zone;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecDomain | cdktf.IResolvable | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this.resolvableValue = undefined;
      this._name = undefined;
      this._type = undefined;
      this._wildcard = undefined;
      this._zone = undefined;
    }
    else if (cdktf.Tokenization.isResolvable(value)) {
      this.isEmptyObject = false;
      this.resolvableValue = value;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this.resolvableValue = undefined;
      this._name = value.name;
      this._type = value.type;
      this._wildcard = value.wildcard;
      this._zone = value.zone;
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

  // type - computed: true, optional: true, required: false
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

  // wildcard - computed: true, optional: true, required: false
  private _wildcard?: boolean | cdktf.IResolvable; 
  public get wildcard() {
    return this.getBooleanAttribute('wildcard');
  }
  public set wildcard(value: boolean | cdktf.IResolvable) {
    this._wildcard = value;
  }
  public resetWildcard() {
    this._wildcard = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get wildcardInput() {
    return this._wildcard;
  }

  // zone - computed: false, optional: true, required: false
  private _zone?: string; 
  public get zone() {
    return this.getStringAttribute('zone');
  }
  public set zone(value: string) {
    this._zone = value;
  }
  public resetZone() {
    this._zone = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get zoneInput() {
    return this._zone;
  }
}

export class AppSpecDomainList extends cdktf.ComplexList {
  public internalValue? : AppSpecDomain[] | cdktf.IResolvable

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
  public get(index: number): AppSpecDomainOutputReference {
    return new AppSpecDomainOutputReference(this.terraformResource, this.terraformAttribute, index, this.wrapsSet);
  }
}
export interface AppSpecEnv {
  /**
  * The name of the environment variable.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#key App#key}
  */
  readonly key?: string;
  /**
  * The visibility scope of the environment variable.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#scope App#scope}
  */
  readonly scope?: string;
  /**
  * The type of the environment variable.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#type App#type}
  */
  readonly type?: string;
  /**
  * The value of the environment variable.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#value App#value}
  */
  readonly value?: string;
}

export function appSpecEnvToTerraform(struct?: AppSpecEnv | cdktf.IResolvable): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    key: cdktf.stringToTerraform(struct!.key),
    scope: cdktf.stringToTerraform(struct!.scope),
    type: cdktf.stringToTerraform(struct!.type),
    value: cdktf.stringToTerraform(struct!.value),
  }
}

export class AppSpecEnvOutputReference extends cdktf.ComplexObject {
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

  public get internalValue(): AppSpecEnv | cdktf.IResolvable | undefined {
    if (this.resolvableValue) {
      return this.resolvableValue;
    }
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._key !== undefined) {
      hasAnyValues = true;
      internalValueResult.key = this._key;
    }
    if (this._scope !== undefined) {
      hasAnyValues = true;
      internalValueResult.scope = this._scope;
    }
    if (this._type !== undefined) {
      hasAnyValues = true;
      internalValueResult.type = this._type;
    }
    if (this._value !== undefined) {
      hasAnyValues = true;
      internalValueResult.value = this._value;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecEnv | cdktf.IResolvable | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this.resolvableValue = undefined;
      this._key = undefined;
      this._scope = undefined;
      this._type = undefined;
      this._value = undefined;
    }
    else if (cdktf.Tokenization.isResolvable(value)) {
      this.isEmptyObject = false;
      this.resolvableValue = value;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this.resolvableValue = undefined;
      this._key = value.key;
      this._scope = value.scope;
      this._type = value.type;
      this._value = value.value;
    }
  }

  // key - computed: false, optional: true, required: false
  private _key?: string; 
  public get key() {
    return this.getStringAttribute('key');
  }
  public set key(value: string) {
    this._key = value;
  }
  public resetKey() {
    this._key = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get keyInput() {
    return this._key;
  }

  // scope - computed: false, optional: true, required: false
  private _scope?: string; 
  public get scope() {
    return this.getStringAttribute('scope');
  }
  public set scope(value: string) {
    this._scope = value;
  }
  public resetScope() {
    this._scope = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get scopeInput() {
    return this._scope;
  }

  // type - computed: true, optional: true, required: false
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

  // value - computed: false, optional: true, required: false
  private _value?: string; 
  public get value() {
    return this.getStringAttribute('value');
  }
  public set value(value: string) {
    this._value = value;
  }
  public resetValue() {
    this._value = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get valueInput() {
    return this._value;
  }
}

export class AppSpecEnvList extends cdktf.ComplexList {
  public internalValue? : AppSpecEnv[] | cdktf.IResolvable

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
  public get(index: number): AppSpecEnvOutputReference {
    return new AppSpecEnvOutputReference(this.terraformResource, this.terraformAttribute, index, this.wrapsSet);
  }
}
export interface AppSpecFunctionAlert {
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#disabled App#disabled}
  */
  readonly disabled?: boolean | cdktf.IResolvable;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#operator App#operator}
  */
  readonly operator: string;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#rule App#rule}
  */
  readonly rule: string;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#value App#value}
  */
  readonly value: number;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#window App#window}
  */
  readonly window: string;
}

export function appSpecFunctionAlertToTerraform(struct?: AppSpecFunctionAlert | cdktf.IResolvable): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    disabled: cdktf.booleanToTerraform(struct!.disabled),
    operator: cdktf.stringToTerraform(struct!.operator),
    rule: cdktf.stringToTerraform(struct!.rule),
    value: cdktf.numberToTerraform(struct!.value),
    window: cdktf.stringToTerraform(struct!.window),
  }
}

export class AppSpecFunctionAlertOutputReference extends cdktf.ComplexObject {
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

  public get internalValue(): AppSpecFunctionAlert | cdktf.IResolvable | undefined {
    if (this.resolvableValue) {
      return this.resolvableValue;
    }
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._disabled !== undefined) {
      hasAnyValues = true;
      internalValueResult.disabled = this._disabled;
    }
    if (this._operator !== undefined) {
      hasAnyValues = true;
      internalValueResult.operator = this._operator;
    }
    if (this._rule !== undefined) {
      hasAnyValues = true;
      internalValueResult.rule = this._rule;
    }
    if (this._value !== undefined) {
      hasAnyValues = true;
      internalValueResult.value = this._value;
    }
    if (this._window !== undefined) {
      hasAnyValues = true;
      internalValueResult.window = this._window;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecFunctionAlert | cdktf.IResolvable | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this.resolvableValue = undefined;
      this._disabled = undefined;
      this._operator = undefined;
      this._rule = undefined;
      this._value = undefined;
      this._window = undefined;
    }
    else if (cdktf.Tokenization.isResolvable(value)) {
      this.isEmptyObject = false;
      this.resolvableValue = value;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this.resolvableValue = undefined;
      this._disabled = value.disabled;
      this._operator = value.operator;
      this._rule = value.rule;
      this._value = value.value;
      this._window = value.window;
    }
  }

  // disabled - computed: false, optional: true, required: false
  private _disabled?: boolean | cdktf.IResolvable; 
  public get disabled() {
    return this.getBooleanAttribute('disabled');
  }
  public set disabled(value: boolean | cdktf.IResolvable) {
    this._disabled = value;
  }
  public resetDisabled() {
    this._disabled = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get disabledInput() {
    return this._disabled;
  }

  // operator - computed: false, optional: false, required: true
  private _operator?: string; 
  public get operator() {
    return this.getStringAttribute('operator');
  }
  public set operator(value: string) {
    this._operator = value;
  }
  // Temporarily expose input value. Use with caution.
  public get operatorInput() {
    return this._operator;
  }

  // rule - computed: false, optional: false, required: true
  private _rule?: string; 
  public get rule() {
    return this.getStringAttribute('rule');
  }
  public set rule(value: string) {
    this._rule = value;
  }
  // Temporarily expose input value. Use with caution.
  public get ruleInput() {
    return this._rule;
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
}

export class AppSpecFunctionAlertList extends cdktf.ComplexList {
  public internalValue? : AppSpecFunctionAlert[] | cdktf.IResolvable

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
  public get(index: number): AppSpecFunctionAlertOutputReference {
    return new AppSpecFunctionAlertOutputReference(this.terraformResource, this.terraformAttribute, index, this.wrapsSet);
  }
}
export interface AppSpecFunctionCorsAllowOrigins {
  /**
  * Exact string match.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#exact App#exact}
  */
  readonly exact?: string;
  /**
  * Prefix-based match. 
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#prefix App#prefix}
  */
  readonly prefix?: string;
  /**
  * RE2 style regex-based match.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#regex App#regex}
  */
  readonly regex?: string;
}

export function appSpecFunctionCorsAllowOriginsToTerraform(struct?: AppSpecFunctionCorsAllowOriginsOutputReference | AppSpecFunctionCorsAllowOrigins): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    exact: cdktf.stringToTerraform(struct!.exact),
    prefix: cdktf.stringToTerraform(struct!.prefix),
    regex: cdktf.stringToTerraform(struct!.regex),
  }
}

export class AppSpecFunctionCorsAllowOriginsOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string) {
    super(terraformResource, terraformAttribute, false, 0);
  }

  public get internalValue(): AppSpecFunctionCorsAllowOrigins | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._exact !== undefined) {
      hasAnyValues = true;
      internalValueResult.exact = this._exact;
    }
    if (this._prefix !== undefined) {
      hasAnyValues = true;
      internalValueResult.prefix = this._prefix;
    }
    if (this._regex !== undefined) {
      hasAnyValues = true;
      internalValueResult.regex = this._regex;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecFunctionCorsAllowOrigins | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this._exact = undefined;
      this._prefix = undefined;
      this._regex = undefined;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this._exact = value.exact;
      this._prefix = value.prefix;
      this._regex = value.regex;
    }
  }

  // exact - computed: false, optional: true, required: false
  private _exact?: string; 
  public get exact() {
    return this.getStringAttribute('exact');
  }
  public set exact(value: string) {
    this._exact = value;
  }
  public resetExact() {
    this._exact = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get exactInput() {
    return this._exact;
  }

  // prefix - computed: false, optional: true, required: false
  private _prefix?: string; 
  public get prefix() {
    return this.getStringAttribute('prefix');
  }
  public set prefix(value: string) {
    this._prefix = value;
  }
  public resetPrefix() {
    this._prefix = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get prefixInput() {
    return this._prefix;
  }

  // regex - computed: false, optional: true, required: false
  private _regex?: string; 
  public get regex() {
    return this.getStringAttribute('regex');
  }
  public set regex(value: string) {
    this._regex = value;
  }
  public resetRegex() {
    this._regex = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get regexInput() {
    return this._regex;
  }
}
export interface AppSpecFunctionCors {
  /**
  * Whether browsers should expose the response to the client-side JavaScript code when the request’s credentials mode is `include`. This configures the Access-Control-Allow-Credentials header.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#allow_credentials App#allow_credentials}
  */
  readonly allowCredentials?: boolean | cdktf.IResolvable;
  /**
  * The set of allowed HTTP request headers. This configures the Access-Control-Allow-Headers header.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#allow_headers App#allow_headers}
  */
  readonly allowHeaders?: string[];
  /**
  * The set of allowed HTTP methods. This configures the Access-Control-Allow-Methods header.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#allow_methods App#allow_methods}
  */
  readonly allowMethods?: string[];
  /**
  * The set of HTTP response headers that browsers are allowed to access. This configures the Access-Control-Expose-Headers header.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#expose_headers App#expose_headers}
  */
  readonly exposeHeaders?: string[];
  /**
  * An optional duration specifying how long browsers can cache the results of a preflight request. This configures the Access-Control-Max-Age header. Example: `5h30m`.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#max_age App#max_age}
  */
  readonly maxAge?: string;
  /**
  * allow_origins block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#allow_origins App#allow_origins}
  */
  readonly allowOrigins?: AppSpecFunctionCorsAllowOrigins;
}

export function appSpecFunctionCorsToTerraform(struct?: AppSpecFunctionCorsOutputReference | AppSpecFunctionCors): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    allow_credentials: cdktf.booleanToTerraform(struct!.allowCredentials),
    allow_headers: cdktf.listMapper(cdktf.stringToTerraform, false)(struct!.allowHeaders),
    allow_methods: cdktf.listMapper(cdktf.stringToTerraform, false)(struct!.allowMethods),
    expose_headers: cdktf.listMapper(cdktf.stringToTerraform, false)(struct!.exposeHeaders),
    max_age: cdktf.stringToTerraform(struct!.maxAge),
    allow_origins: appSpecFunctionCorsAllowOriginsToTerraform(struct!.allowOrigins),
  }
}

export class AppSpecFunctionCorsOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string) {
    super(terraformResource, terraformAttribute, false, 0);
  }

  public get internalValue(): AppSpecFunctionCors | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._allowCredentials !== undefined) {
      hasAnyValues = true;
      internalValueResult.allowCredentials = this._allowCredentials;
    }
    if (this._allowHeaders !== undefined) {
      hasAnyValues = true;
      internalValueResult.allowHeaders = this._allowHeaders;
    }
    if (this._allowMethods !== undefined) {
      hasAnyValues = true;
      internalValueResult.allowMethods = this._allowMethods;
    }
    if (this._exposeHeaders !== undefined) {
      hasAnyValues = true;
      internalValueResult.exposeHeaders = this._exposeHeaders;
    }
    if (this._maxAge !== undefined) {
      hasAnyValues = true;
      internalValueResult.maxAge = this._maxAge;
    }
    if (this._allowOrigins?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.allowOrigins = this._allowOrigins?.internalValue;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecFunctionCors | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this._allowCredentials = undefined;
      this._allowHeaders = undefined;
      this._allowMethods = undefined;
      this._exposeHeaders = undefined;
      this._maxAge = undefined;
      this._allowOrigins.internalValue = undefined;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this._allowCredentials = value.allowCredentials;
      this._allowHeaders = value.allowHeaders;
      this._allowMethods = value.allowMethods;
      this._exposeHeaders = value.exposeHeaders;
      this._maxAge = value.maxAge;
      this._allowOrigins.internalValue = value.allowOrigins;
    }
  }

  // allow_credentials - computed: false, optional: true, required: false
  private _allowCredentials?: boolean | cdktf.IResolvable; 
  public get allowCredentials() {
    return this.getBooleanAttribute('allow_credentials');
  }
  public set allowCredentials(value: boolean | cdktf.IResolvable) {
    this._allowCredentials = value;
  }
  public resetAllowCredentials() {
    this._allowCredentials = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get allowCredentialsInput() {
    return this._allowCredentials;
  }

  // allow_headers - computed: false, optional: true, required: false
  private _allowHeaders?: string[]; 
  public get allowHeaders() {
    return cdktf.Fn.tolist(this.getListAttribute('allow_headers'));
  }
  public set allowHeaders(value: string[]) {
    this._allowHeaders = value;
  }
  public resetAllowHeaders() {
    this._allowHeaders = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get allowHeadersInput() {
    return this._allowHeaders;
  }

  // allow_methods - computed: false, optional: true, required: false
  private _allowMethods?: string[]; 
  public get allowMethods() {
    return cdktf.Fn.tolist(this.getListAttribute('allow_methods'));
  }
  public set allowMethods(value: string[]) {
    this._allowMethods = value;
  }
  public resetAllowMethods() {
    this._allowMethods = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get allowMethodsInput() {
    return this._allowMethods;
  }

  // expose_headers - computed: false, optional: true, required: false
  private _exposeHeaders?: string[]; 
  public get exposeHeaders() {
    return cdktf.Fn.tolist(this.getListAttribute('expose_headers'));
  }
  public set exposeHeaders(value: string[]) {
    this._exposeHeaders = value;
  }
  public resetExposeHeaders() {
    this._exposeHeaders = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get exposeHeadersInput() {
    return this._exposeHeaders;
  }

  // max_age - computed: false, optional: true, required: false
  private _maxAge?: string; 
  public get maxAge() {
    return this.getStringAttribute('max_age');
  }
  public set maxAge(value: string) {
    this._maxAge = value;
  }
  public resetMaxAge() {
    this._maxAge = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get maxAgeInput() {
    return this._maxAge;
  }

  // allow_origins - computed: false, optional: true, required: false
  private _allowOrigins = new AppSpecFunctionCorsAllowOriginsOutputReference(this, "allow_origins");
  public get allowOrigins() {
    return this._allowOrigins;
  }
  public putAllowOrigins(value: AppSpecFunctionCorsAllowOrigins) {
    this._allowOrigins.internalValue = value;
  }
  public resetAllowOrigins() {
    this._allowOrigins.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get allowOriginsInput() {
    return this._allowOrigins.internalValue;
  }
}
export interface AppSpecFunctionEnv {
  /**
  * The name of the environment variable.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#key App#key}
  */
  readonly key?: string;
  /**
  * The visibility scope of the environment variable.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#scope App#scope}
  */
  readonly scope?: string;
  /**
  * The type of the environment variable.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#type App#type}
  */
  readonly type?: string;
  /**
  * The value of the environment variable.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#value App#value}
  */
  readonly value?: string;
}

export function appSpecFunctionEnvToTerraform(struct?: AppSpecFunctionEnv | cdktf.IResolvable): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    key: cdktf.stringToTerraform(struct!.key),
    scope: cdktf.stringToTerraform(struct!.scope),
    type: cdktf.stringToTerraform(struct!.type),
    value: cdktf.stringToTerraform(struct!.value),
  }
}

export class AppSpecFunctionEnvOutputReference extends cdktf.ComplexObject {
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

  public get internalValue(): AppSpecFunctionEnv | cdktf.IResolvable | undefined {
    if (this.resolvableValue) {
      return this.resolvableValue;
    }
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._key !== undefined) {
      hasAnyValues = true;
      internalValueResult.key = this._key;
    }
    if (this._scope !== undefined) {
      hasAnyValues = true;
      internalValueResult.scope = this._scope;
    }
    if (this._type !== undefined) {
      hasAnyValues = true;
      internalValueResult.type = this._type;
    }
    if (this._value !== undefined) {
      hasAnyValues = true;
      internalValueResult.value = this._value;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecFunctionEnv | cdktf.IResolvable | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this.resolvableValue = undefined;
      this._key = undefined;
      this._scope = undefined;
      this._type = undefined;
      this._value = undefined;
    }
    else if (cdktf.Tokenization.isResolvable(value)) {
      this.isEmptyObject = false;
      this.resolvableValue = value;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this.resolvableValue = undefined;
      this._key = value.key;
      this._scope = value.scope;
      this._type = value.type;
      this._value = value.value;
    }
  }

  // key - computed: false, optional: true, required: false
  private _key?: string; 
  public get key() {
    return this.getStringAttribute('key');
  }
  public set key(value: string) {
    this._key = value;
  }
  public resetKey() {
    this._key = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get keyInput() {
    return this._key;
  }

  // scope - computed: false, optional: true, required: false
  private _scope?: string; 
  public get scope() {
    return this.getStringAttribute('scope');
  }
  public set scope(value: string) {
    this._scope = value;
  }
  public resetScope() {
    this._scope = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get scopeInput() {
    return this._scope;
  }

  // type - computed: true, optional: true, required: false
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

  // value - computed: false, optional: true, required: false
  private _value?: string; 
  public get value() {
    return this.getStringAttribute('value');
  }
  public set value(value: string) {
    this._value = value;
  }
  public resetValue() {
    this._value = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get valueInput() {
    return this._value;
  }
}

export class AppSpecFunctionEnvList extends cdktf.ComplexList {
  public internalValue? : AppSpecFunctionEnv[] | cdktf.IResolvable

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
  public get(index: number): AppSpecFunctionEnvOutputReference {
    return new AppSpecFunctionEnvOutputReference(this.terraformResource, this.terraformAttribute, index, this.wrapsSet);
  }
}
export interface AppSpecFunctionGit {
  /**
  * The name of the branch to use.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#branch App#branch}
  */
  readonly branch?: string;
  /**
  * The clone URL of the repo.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#repo_clone_url App#repo_clone_url}
  */
  readonly repoCloneUrl?: string;
}

export function appSpecFunctionGitToTerraform(struct?: AppSpecFunctionGitOutputReference | AppSpecFunctionGit): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    branch: cdktf.stringToTerraform(struct!.branch),
    repo_clone_url: cdktf.stringToTerraform(struct!.repoCloneUrl),
  }
}

export class AppSpecFunctionGitOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string) {
    super(terraformResource, terraformAttribute, false, 0);
  }

  public get internalValue(): AppSpecFunctionGit | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._branch !== undefined) {
      hasAnyValues = true;
      internalValueResult.branch = this._branch;
    }
    if (this._repoCloneUrl !== undefined) {
      hasAnyValues = true;
      internalValueResult.repoCloneUrl = this._repoCloneUrl;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecFunctionGit | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this._branch = undefined;
      this._repoCloneUrl = undefined;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this._branch = value.branch;
      this._repoCloneUrl = value.repoCloneUrl;
    }
  }

  // branch - computed: false, optional: true, required: false
  private _branch?: string; 
  public get branch() {
    return this.getStringAttribute('branch');
  }
  public set branch(value: string) {
    this._branch = value;
  }
  public resetBranch() {
    this._branch = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get branchInput() {
    return this._branch;
  }

  // repo_clone_url - computed: false, optional: true, required: false
  private _repoCloneUrl?: string; 
  public get repoCloneUrl() {
    return this.getStringAttribute('repo_clone_url');
  }
  public set repoCloneUrl(value: string) {
    this._repoCloneUrl = value;
  }
  public resetRepoCloneUrl() {
    this._repoCloneUrl = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get repoCloneUrlInput() {
    return this._repoCloneUrl;
  }
}
export interface AppSpecFunctionGithub {
  /**
  * The name of the branch to use.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#branch App#branch}
  */
  readonly branch?: string;
  /**
  * Whether to automatically deploy new commits made to the repo
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#deploy_on_push App#deploy_on_push}
  */
  readonly deployOnPush?: boolean | cdktf.IResolvable;
  /**
  * The name of the repo in the format `owner/repo`.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#repo App#repo}
  */
  readonly repo?: string;
}

export function appSpecFunctionGithubToTerraform(struct?: AppSpecFunctionGithubOutputReference | AppSpecFunctionGithub): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    branch: cdktf.stringToTerraform(struct!.branch),
    deploy_on_push: cdktf.booleanToTerraform(struct!.deployOnPush),
    repo: cdktf.stringToTerraform(struct!.repo),
  }
}

export class AppSpecFunctionGithubOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string) {
    super(terraformResource, terraformAttribute, false, 0);
  }

  public get internalValue(): AppSpecFunctionGithub | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._branch !== undefined) {
      hasAnyValues = true;
      internalValueResult.branch = this._branch;
    }
    if (this._deployOnPush !== undefined) {
      hasAnyValues = true;
      internalValueResult.deployOnPush = this._deployOnPush;
    }
    if (this._repo !== undefined) {
      hasAnyValues = true;
      internalValueResult.repo = this._repo;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecFunctionGithub | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this._branch = undefined;
      this._deployOnPush = undefined;
      this._repo = undefined;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this._branch = value.branch;
      this._deployOnPush = value.deployOnPush;
      this._repo = value.repo;
    }
  }

  // branch - computed: false, optional: true, required: false
  private _branch?: string; 
  public get branch() {
    return this.getStringAttribute('branch');
  }
  public set branch(value: string) {
    this._branch = value;
  }
  public resetBranch() {
    this._branch = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get branchInput() {
    return this._branch;
  }

  // deploy_on_push - computed: false, optional: true, required: false
  private _deployOnPush?: boolean | cdktf.IResolvable; 
  public get deployOnPush() {
    return this.getBooleanAttribute('deploy_on_push');
  }
  public set deployOnPush(value: boolean | cdktf.IResolvable) {
    this._deployOnPush = value;
  }
  public resetDeployOnPush() {
    this._deployOnPush = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get deployOnPushInput() {
    return this._deployOnPush;
  }

  // repo - computed: false, optional: true, required: false
  private _repo?: string; 
  public get repo() {
    return this.getStringAttribute('repo');
  }
  public set repo(value: string) {
    this._repo = value;
  }
  public resetRepo() {
    this._repo = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get repoInput() {
    return this._repo;
  }
}
export interface AppSpecFunctionGitlab {
  /**
  * The name of the branch to use.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#branch App#branch}
  */
  readonly branch?: string;
  /**
  * Whether to automatically deploy new commits made to the repo
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#deploy_on_push App#deploy_on_push}
  */
  readonly deployOnPush?: boolean | cdktf.IResolvable;
  /**
  * The name of the repo in the format `owner/repo`.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#repo App#repo}
  */
  readonly repo?: string;
}

export function appSpecFunctionGitlabToTerraform(struct?: AppSpecFunctionGitlabOutputReference | AppSpecFunctionGitlab): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    branch: cdktf.stringToTerraform(struct!.branch),
    deploy_on_push: cdktf.booleanToTerraform(struct!.deployOnPush),
    repo: cdktf.stringToTerraform(struct!.repo),
  }
}

export class AppSpecFunctionGitlabOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string) {
    super(terraformResource, terraformAttribute, false, 0);
  }

  public get internalValue(): AppSpecFunctionGitlab | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._branch !== undefined) {
      hasAnyValues = true;
      internalValueResult.branch = this._branch;
    }
    if (this._deployOnPush !== undefined) {
      hasAnyValues = true;
      internalValueResult.deployOnPush = this._deployOnPush;
    }
    if (this._repo !== undefined) {
      hasAnyValues = true;
      internalValueResult.repo = this._repo;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecFunctionGitlab | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this._branch = undefined;
      this._deployOnPush = undefined;
      this._repo = undefined;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this._branch = value.branch;
      this._deployOnPush = value.deployOnPush;
      this._repo = value.repo;
    }
  }

  // branch - computed: false, optional: true, required: false
  private _branch?: string; 
  public get branch() {
    return this.getStringAttribute('branch');
  }
  public set branch(value: string) {
    this._branch = value;
  }
  public resetBranch() {
    this._branch = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get branchInput() {
    return this._branch;
  }

  // deploy_on_push - computed: false, optional: true, required: false
  private _deployOnPush?: boolean | cdktf.IResolvable; 
  public get deployOnPush() {
    return this.getBooleanAttribute('deploy_on_push');
  }
  public set deployOnPush(value: boolean | cdktf.IResolvable) {
    this._deployOnPush = value;
  }
  public resetDeployOnPush() {
    this._deployOnPush = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get deployOnPushInput() {
    return this._deployOnPush;
  }

  // repo - computed: false, optional: true, required: false
  private _repo?: string; 
  public get repo() {
    return this.getStringAttribute('repo');
  }
  public set repo(value: string) {
    this._repo = value;
  }
  public resetRepo() {
    this._repo = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get repoInput() {
    return this._repo;
  }
}
export interface AppSpecFunctionLogDestinationDatadog {
  /**
  * Datadog API key.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#api_key App#api_key}
  */
  readonly apiKey: string;
  /**
  * Datadog HTTP log intake endpoint.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#endpoint App#endpoint}
  */
  readonly endpoint?: string;
}

export function appSpecFunctionLogDestinationDatadogToTerraform(struct?: AppSpecFunctionLogDestinationDatadogOutputReference | AppSpecFunctionLogDestinationDatadog): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    api_key: cdktf.stringToTerraform(struct!.apiKey),
    endpoint: cdktf.stringToTerraform(struct!.endpoint),
  }
}

export class AppSpecFunctionLogDestinationDatadogOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string) {
    super(terraformResource, terraformAttribute, false, 0);
  }

  public get internalValue(): AppSpecFunctionLogDestinationDatadog | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._apiKey !== undefined) {
      hasAnyValues = true;
      internalValueResult.apiKey = this._apiKey;
    }
    if (this._endpoint !== undefined) {
      hasAnyValues = true;
      internalValueResult.endpoint = this._endpoint;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecFunctionLogDestinationDatadog | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this._apiKey = undefined;
      this._endpoint = undefined;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this._apiKey = value.apiKey;
      this._endpoint = value.endpoint;
    }
  }

  // api_key - computed: false, optional: false, required: true
  private _apiKey?: string; 
  public get apiKey() {
    return this.getStringAttribute('api_key');
  }
  public set apiKey(value: string) {
    this._apiKey = value;
  }
  // Temporarily expose input value. Use with caution.
  public get apiKeyInput() {
    return this._apiKey;
  }

  // endpoint - computed: false, optional: true, required: false
  private _endpoint?: string; 
  public get endpoint() {
    return this.getStringAttribute('endpoint');
  }
  public set endpoint(value: string) {
    this._endpoint = value;
  }
  public resetEndpoint() {
    this._endpoint = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get endpointInput() {
    return this._endpoint;
  }
}
export interface AppSpecFunctionLogDestinationLogtail {
  /**
  * Logtail token.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#token App#token}
  */
  readonly token: string;
}

export function appSpecFunctionLogDestinationLogtailToTerraform(struct?: AppSpecFunctionLogDestinationLogtailOutputReference | AppSpecFunctionLogDestinationLogtail): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    token: cdktf.stringToTerraform(struct!.token),
  }
}

export class AppSpecFunctionLogDestinationLogtailOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string) {
    super(terraformResource, terraformAttribute, false, 0);
  }

  public get internalValue(): AppSpecFunctionLogDestinationLogtail | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._token !== undefined) {
      hasAnyValues = true;
      internalValueResult.token = this._token;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecFunctionLogDestinationLogtail | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this._token = undefined;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this._token = value.token;
    }
  }

  // token - computed: false, optional: false, required: true
  private _token?: string; 
  public get token() {
    return this.getStringAttribute('token');
  }
  public set token(value: string) {
    this._token = value;
  }
  // Temporarily expose input value. Use with caution.
  public get tokenInput() {
    return this._token;
  }
}
export interface AppSpecFunctionLogDestinationPapertrail {
  /**
  * Papertrail syslog endpoint.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#endpoint App#endpoint}
  */
  readonly endpoint: string;
}

export function appSpecFunctionLogDestinationPapertrailToTerraform(struct?: AppSpecFunctionLogDestinationPapertrailOutputReference | AppSpecFunctionLogDestinationPapertrail): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    endpoint: cdktf.stringToTerraform(struct!.endpoint),
  }
}

export class AppSpecFunctionLogDestinationPapertrailOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string) {
    super(terraformResource, terraformAttribute, false, 0);
  }

  public get internalValue(): AppSpecFunctionLogDestinationPapertrail | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._endpoint !== undefined) {
      hasAnyValues = true;
      internalValueResult.endpoint = this._endpoint;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecFunctionLogDestinationPapertrail | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this._endpoint = undefined;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this._endpoint = value.endpoint;
    }
  }

  // endpoint - computed: false, optional: false, required: true
  private _endpoint?: string; 
  public get endpoint() {
    return this.getStringAttribute('endpoint');
  }
  public set endpoint(value: string) {
    this._endpoint = value;
  }
  // Temporarily expose input value. Use with caution.
  public get endpointInput() {
    return this._endpoint;
  }
}
export interface AppSpecFunctionLogDestination {
  /**
  * Name of the log destination
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#name App#name}
  */
  readonly name: string;
  /**
  * datadog block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#datadog App#datadog}
  */
  readonly datadog?: AppSpecFunctionLogDestinationDatadog;
  /**
  * logtail block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#logtail App#logtail}
  */
  readonly logtail?: AppSpecFunctionLogDestinationLogtail;
  /**
  * papertrail block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#papertrail App#papertrail}
  */
  readonly papertrail?: AppSpecFunctionLogDestinationPapertrail;
}

export function appSpecFunctionLogDestinationToTerraform(struct?: AppSpecFunctionLogDestination | cdktf.IResolvable): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    name: cdktf.stringToTerraform(struct!.name),
    datadog: appSpecFunctionLogDestinationDatadogToTerraform(struct!.datadog),
    logtail: appSpecFunctionLogDestinationLogtailToTerraform(struct!.logtail),
    papertrail: appSpecFunctionLogDestinationPapertrailToTerraform(struct!.papertrail),
  }
}

export class AppSpecFunctionLogDestinationOutputReference extends cdktf.ComplexObject {
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

  public get internalValue(): AppSpecFunctionLogDestination | cdktf.IResolvable | undefined {
    if (this.resolvableValue) {
      return this.resolvableValue;
    }
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._name !== undefined) {
      hasAnyValues = true;
      internalValueResult.name = this._name;
    }
    if (this._datadog?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.datadog = this._datadog?.internalValue;
    }
    if (this._logtail?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.logtail = this._logtail?.internalValue;
    }
    if (this._papertrail?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.papertrail = this._papertrail?.internalValue;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecFunctionLogDestination | cdktf.IResolvable | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this.resolvableValue = undefined;
      this._name = undefined;
      this._datadog.internalValue = undefined;
      this._logtail.internalValue = undefined;
      this._papertrail.internalValue = undefined;
    }
    else if (cdktf.Tokenization.isResolvable(value)) {
      this.isEmptyObject = false;
      this.resolvableValue = value;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this.resolvableValue = undefined;
      this._name = value.name;
      this._datadog.internalValue = value.datadog;
      this._logtail.internalValue = value.logtail;
      this._papertrail.internalValue = value.papertrail;
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

  // datadog - computed: false, optional: true, required: false
  private _datadog = new AppSpecFunctionLogDestinationDatadogOutputReference(this, "datadog");
  public get datadog() {
    return this._datadog;
  }
  public putDatadog(value: AppSpecFunctionLogDestinationDatadog) {
    this._datadog.internalValue = value;
  }
  public resetDatadog() {
    this._datadog.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get datadogInput() {
    return this._datadog.internalValue;
  }

  // logtail - computed: false, optional: true, required: false
  private _logtail = new AppSpecFunctionLogDestinationLogtailOutputReference(this, "logtail");
  public get logtail() {
    return this._logtail;
  }
  public putLogtail(value: AppSpecFunctionLogDestinationLogtail) {
    this._logtail.internalValue = value;
  }
  public resetLogtail() {
    this._logtail.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get logtailInput() {
    return this._logtail.internalValue;
  }

  // papertrail - computed: false, optional: true, required: false
  private _papertrail = new AppSpecFunctionLogDestinationPapertrailOutputReference(this, "papertrail");
  public get papertrail() {
    return this._papertrail;
  }
  public putPapertrail(value: AppSpecFunctionLogDestinationPapertrail) {
    this._papertrail.internalValue = value;
  }
  public resetPapertrail() {
    this._papertrail.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get papertrailInput() {
    return this._papertrail.internalValue;
  }
}

export class AppSpecFunctionLogDestinationList extends cdktf.ComplexList {
  public internalValue? : AppSpecFunctionLogDestination[] | cdktf.IResolvable

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
  public get(index: number): AppSpecFunctionLogDestinationOutputReference {
    return new AppSpecFunctionLogDestinationOutputReference(this.terraformResource, this.terraformAttribute, index, this.wrapsSet);
  }
}
export interface AppSpecFunctionRoutes {
  /**
  * Path specifies an route by HTTP path prefix. Paths must start with / and must be unique within the app.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#path App#path}
  */
  readonly path?: string;
  /**
  *  An optional flag to preserve the path that is forwarded to the backend service.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#preserve_path_prefix App#preserve_path_prefix}
  */
  readonly preservePathPrefix?: boolean | cdktf.IResolvable;
}

export function appSpecFunctionRoutesToTerraform(struct?: AppSpecFunctionRoutes | cdktf.IResolvable): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    path: cdktf.stringToTerraform(struct!.path),
    preserve_path_prefix: cdktf.booleanToTerraform(struct!.preservePathPrefix),
  }
}

export class AppSpecFunctionRoutesOutputReference extends cdktf.ComplexObject {
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

  public get internalValue(): AppSpecFunctionRoutes | cdktf.IResolvable | undefined {
    if (this.resolvableValue) {
      return this.resolvableValue;
    }
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._path !== undefined) {
      hasAnyValues = true;
      internalValueResult.path = this._path;
    }
    if (this._preservePathPrefix !== undefined) {
      hasAnyValues = true;
      internalValueResult.preservePathPrefix = this._preservePathPrefix;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecFunctionRoutes | cdktf.IResolvable | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this.resolvableValue = undefined;
      this._path = undefined;
      this._preservePathPrefix = undefined;
    }
    else if (cdktf.Tokenization.isResolvable(value)) {
      this.isEmptyObject = false;
      this.resolvableValue = value;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this.resolvableValue = undefined;
      this._path = value.path;
      this._preservePathPrefix = value.preservePathPrefix;
    }
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

  // preserve_path_prefix - computed: false, optional: true, required: false
  private _preservePathPrefix?: boolean | cdktf.IResolvable; 
  public get preservePathPrefix() {
    return this.getBooleanAttribute('preserve_path_prefix');
  }
  public set preservePathPrefix(value: boolean | cdktf.IResolvable) {
    this._preservePathPrefix = value;
  }
  public resetPreservePathPrefix() {
    this._preservePathPrefix = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get preservePathPrefixInput() {
    return this._preservePathPrefix;
  }
}

export class AppSpecFunctionRoutesList extends cdktf.ComplexList {
  public internalValue? : AppSpecFunctionRoutes[] | cdktf.IResolvable

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
  public get(index: number): AppSpecFunctionRoutesOutputReference {
    return new AppSpecFunctionRoutesOutputReference(this.terraformResource, this.terraformAttribute, index, this.wrapsSet);
  }
}
export interface AppSpecFunction {
  /**
  * The name of the component
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#name App#name}
  */
  readonly name: string;
  /**
  * An optional path to the working directory to use for the build.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#source_dir App#source_dir}
  */
  readonly sourceDir?: string;
  /**
  * alert block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#alert App#alert}
  */
  readonly alert?: AppSpecFunctionAlert[] | cdktf.IResolvable;
  /**
  * cors block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#cors App#cors}
  */
  readonly cors?: AppSpecFunctionCors;
  /**
  * env block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#env App#env}
  */
  readonly env?: AppSpecFunctionEnv[] | cdktf.IResolvable;
  /**
  * git block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#git App#git}
  */
  readonly git?: AppSpecFunctionGit;
  /**
  * github block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#github App#github}
  */
  readonly github?: AppSpecFunctionGithub;
  /**
  * gitlab block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#gitlab App#gitlab}
  */
  readonly gitlab?: AppSpecFunctionGitlab;
  /**
  * log_destination block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#log_destination App#log_destination}
  */
  readonly logDestination?: AppSpecFunctionLogDestination[] | cdktf.IResolvable;
  /**
  * routes block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#routes App#routes}
  */
  readonly routes?: AppSpecFunctionRoutes[] | cdktf.IResolvable;
}

export function appSpecFunctionToTerraform(struct?: AppSpecFunction | cdktf.IResolvable): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    name: cdktf.stringToTerraform(struct!.name),
    source_dir: cdktf.stringToTerraform(struct!.sourceDir),
    alert: cdktf.listMapper(appSpecFunctionAlertToTerraform, true)(struct!.alert),
    cors: appSpecFunctionCorsToTerraform(struct!.cors),
    env: cdktf.listMapper(appSpecFunctionEnvToTerraform, true)(struct!.env),
    git: appSpecFunctionGitToTerraform(struct!.git),
    github: appSpecFunctionGithubToTerraform(struct!.github),
    gitlab: appSpecFunctionGitlabToTerraform(struct!.gitlab),
    log_destination: cdktf.listMapper(appSpecFunctionLogDestinationToTerraform, true)(struct!.logDestination),
    routes: cdktf.listMapper(appSpecFunctionRoutesToTerraform, true)(struct!.routes),
  }
}

export class AppSpecFunctionOutputReference extends cdktf.ComplexObject {
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

  public get internalValue(): AppSpecFunction | cdktf.IResolvable | undefined {
    if (this.resolvableValue) {
      return this.resolvableValue;
    }
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._name !== undefined) {
      hasAnyValues = true;
      internalValueResult.name = this._name;
    }
    if (this._sourceDir !== undefined) {
      hasAnyValues = true;
      internalValueResult.sourceDir = this._sourceDir;
    }
    if (this._alert?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.alert = this._alert?.internalValue;
    }
    if (this._cors?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.cors = this._cors?.internalValue;
    }
    if (this._env?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.env = this._env?.internalValue;
    }
    if (this._git?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.git = this._git?.internalValue;
    }
    if (this._github?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.github = this._github?.internalValue;
    }
    if (this._gitlab?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.gitlab = this._gitlab?.internalValue;
    }
    if (this._logDestination?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.logDestination = this._logDestination?.internalValue;
    }
    if (this._routes?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.routes = this._routes?.internalValue;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecFunction | cdktf.IResolvable | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this.resolvableValue = undefined;
      this._name = undefined;
      this._sourceDir = undefined;
      this._alert.internalValue = undefined;
      this._cors.internalValue = undefined;
      this._env.internalValue = undefined;
      this._git.internalValue = undefined;
      this._github.internalValue = undefined;
      this._gitlab.internalValue = undefined;
      this._logDestination.internalValue = undefined;
      this._routes.internalValue = undefined;
    }
    else if (cdktf.Tokenization.isResolvable(value)) {
      this.isEmptyObject = false;
      this.resolvableValue = value;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this.resolvableValue = undefined;
      this._name = value.name;
      this._sourceDir = value.sourceDir;
      this._alert.internalValue = value.alert;
      this._cors.internalValue = value.cors;
      this._env.internalValue = value.env;
      this._git.internalValue = value.git;
      this._github.internalValue = value.github;
      this._gitlab.internalValue = value.gitlab;
      this._logDestination.internalValue = value.logDestination;
      this._routes.internalValue = value.routes;
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

  // source_dir - computed: false, optional: true, required: false
  private _sourceDir?: string; 
  public get sourceDir() {
    return this.getStringAttribute('source_dir');
  }
  public set sourceDir(value: string) {
    this._sourceDir = value;
  }
  public resetSourceDir() {
    this._sourceDir = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get sourceDirInput() {
    return this._sourceDir;
  }

  // alert - computed: false, optional: true, required: false
  private _alert = new AppSpecFunctionAlertList(this, "alert", false);
  public get alert() {
    return this._alert;
  }
  public putAlert(value: AppSpecFunctionAlert[] | cdktf.IResolvable) {
    this._alert.internalValue = value;
  }
  public resetAlert() {
    this._alert.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get alertInput() {
    return this._alert.internalValue;
  }

  // cors - computed: false, optional: true, required: false
  private _cors = new AppSpecFunctionCorsOutputReference(this, "cors");
  public get cors() {
    return this._cors;
  }
  public putCors(value: AppSpecFunctionCors) {
    this._cors.internalValue = value;
  }
  public resetCors() {
    this._cors.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get corsInput() {
    return this._cors.internalValue;
  }

  // env - computed: false, optional: true, required: false
  private _env = new AppSpecFunctionEnvList(this, "env", true);
  public get env() {
    return this._env;
  }
  public putEnv(value: AppSpecFunctionEnv[] | cdktf.IResolvable) {
    this._env.internalValue = value;
  }
  public resetEnv() {
    this._env.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get envInput() {
    return this._env.internalValue;
  }

  // git - computed: false, optional: true, required: false
  private _git = new AppSpecFunctionGitOutputReference(this, "git");
  public get git() {
    return this._git;
  }
  public putGit(value: AppSpecFunctionGit) {
    this._git.internalValue = value;
  }
  public resetGit() {
    this._git.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get gitInput() {
    return this._git.internalValue;
  }

  // github - computed: false, optional: true, required: false
  private _github = new AppSpecFunctionGithubOutputReference(this, "github");
  public get github() {
    return this._github;
  }
  public putGithub(value: AppSpecFunctionGithub) {
    this._github.internalValue = value;
  }
  public resetGithub() {
    this._github.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get githubInput() {
    return this._github.internalValue;
  }

  // gitlab - computed: false, optional: true, required: false
  private _gitlab = new AppSpecFunctionGitlabOutputReference(this, "gitlab");
  public get gitlab() {
    return this._gitlab;
  }
  public putGitlab(value: AppSpecFunctionGitlab) {
    this._gitlab.internalValue = value;
  }
  public resetGitlab() {
    this._gitlab.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get gitlabInput() {
    return this._gitlab.internalValue;
  }

  // log_destination - computed: false, optional: true, required: false
  private _logDestination = new AppSpecFunctionLogDestinationList(this, "log_destination", false);
  public get logDestination() {
    return this._logDestination;
  }
  public putLogDestination(value: AppSpecFunctionLogDestination[] | cdktf.IResolvable) {
    this._logDestination.internalValue = value;
  }
  public resetLogDestination() {
    this._logDestination.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get logDestinationInput() {
    return this._logDestination.internalValue;
  }

  // routes - computed: false, optional: true, required: false
  private _routes = new AppSpecFunctionRoutesList(this, "routes", false);
  public get routes() {
    return this._routes;
  }
  public putRoutes(value: AppSpecFunctionRoutes[] | cdktf.IResolvable) {
    this._routes.internalValue = value;
  }
  public resetRoutes() {
    this._routes.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get routesInput() {
    return this._routes.internalValue;
  }
}

export class AppSpecFunctionList extends cdktf.ComplexList {
  public internalValue? : AppSpecFunction[] | cdktf.IResolvable

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
  public get(index: number): AppSpecFunctionOutputReference {
    return new AppSpecFunctionOutputReference(this.terraformResource, this.terraformAttribute, index, this.wrapsSet);
  }
}
export interface AppSpecJobAlert {
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#disabled App#disabled}
  */
  readonly disabled?: boolean | cdktf.IResolvable;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#operator App#operator}
  */
  readonly operator: string;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#rule App#rule}
  */
  readonly rule: string;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#value App#value}
  */
  readonly value: number;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#window App#window}
  */
  readonly window: string;
}

export function appSpecJobAlertToTerraform(struct?: AppSpecJobAlert | cdktf.IResolvable): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    disabled: cdktf.booleanToTerraform(struct!.disabled),
    operator: cdktf.stringToTerraform(struct!.operator),
    rule: cdktf.stringToTerraform(struct!.rule),
    value: cdktf.numberToTerraform(struct!.value),
    window: cdktf.stringToTerraform(struct!.window),
  }
}

export class AppSpecJobAlertOutputReference extends cdktf.ComplexObject {
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

  public get internalValue(): AppSpecJobAlert | cdktf.IResolvable | undefined {
    if (this.resolvableValue) {
      return this.resolvableValue;
    }
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._disabled !== undefined) {
      hasAnyValues = true;
      internalValueResult.disabled = this._disabled;
    }
    if (this._operator !== undefined) {
      hasAnyValues = true;
      internalValueResult.operator = this._operator;
    }
    if (this._rule !== undefined) {
      hasAnyValues = true;
      internalValueResult.rule = this._rule;
    }
    if (this._value !== undefined) {
      hasAnyValues = true;
      internalValueResult.value = this._value;
    }
    if (this._window !== undefined) {
      hasAnyValues = true;
      internalValueResult.window = this._window;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecJobAlert | cdktf.IResolvable | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this.resolvableValue = undefined;
      this._disabled = undefined;
      this._operator = undefined;
      this._rule = undefined;
      this._value = undefined;
      this._window = undefined;
    }
    else if (cdktf.Tokenization.isResolvable(value)) {
      this.isEmptyObject = false;
      this.resolvableValue = value;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this.resolvableValue = undefined;
      this._disabled = value.disabled;
      this._operator = value.operator;
      this._rule = value.rule;
      this._value = value.value;
      this._window = value.window;
    }
  }

  // disabled - computed: false, optional: true, required: false
  private _disabled?: boolean | cdktf.IResolvable; 
  public get disabled() {
    return this.getBooleanAttribute('disabled');
  }
  public set disabled(value: boolean | cdktf.IResolvable) {
    this._disabled = value;
  }
  public resetDisabled() {
    this._disabled = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get disabledInput() {
    return this._disabled;
  }

  // operator - computed: false, optional: false, required: true
  private _operator?: string; 
  public get operator() {
    return this.getStringAttribute('operator');
  }
  public set operator(value: string) {
    this._operator = value;
  }
  // Temporarily expose input value. Use with caution.
  public get operatorInput() {
    return this._operator;
  }

  // rule - computed: false, optional: false, required: true
  private _rule?: string; 
  public get rule() {
    return this.getStringAttribute('rule');
  }
  public set rule(value: string) {
    this._rule = value;
  }
  // Temporarily expose input value. Use with caution.
  public get ruleInput() {
    return this._rule;
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
}

export class AppSpecJobAlertList extends cdktf.ComplexList {
  public internalValue? : AppSpecJobAlert[] | cdktf.IResolvable

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
  public get(index: number): AppSpecJobAlertOutputReference {
    return new AppSpecJobAlertOutputReference(this.terraformResource, this.terraformAttribute, index, this.wrapsSet);
  }
}
export interface AppSpecJobEnv {
  /**
  * The name of the environment variable.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#key App#key}
  */
  readonly key?: string;
  /**
  * The visibility scope of the environment variable.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#scope App#scope}
  */
  readonly scope?: string;
  /**
  * The type of the environment variable.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#type App#type}
  */
  readonly type?: string;
  /**
  * The value of the environment variable.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#value App#value}
  */
  readonly value?: string;
}

export function appSpecJobEnvToTerraform(struct?: AppSpecJobEnv | cdktf.IResolvable): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    key: cdktf.stringToTerraform(struct!.key),
    scope: cdktf.stringToTerraform(struct!.scope),
    type: cdktf.stringToTerraform(struct!.type),
    value: cdktf.stringToTerraform(struct!.value),
  }
}

export class AppSpecJobEnvOutputReference extends cdktf.ComplexObject {
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

  public get internalValue(): AppSpecJobEnv | cdktf.IResolvable | undefined {
    if (this.resolvableValue) {
      return this.resolvableValue;
    }
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._key !== undefined) {
      hasAnyValues = true;
      internalValueResult.key = this._key;
    }
    if (this._scope !== undefined) {
      hasAnyValues = true;
      internalValueResult.scope = this._scope;
    }
    if (this._type !== undefined) {
      hasAnyValues = true;
      internalValueResult.type = this._type;
    }
    if (this._value !== undefined) {
      hasAnyValues = true;
      internalValueResult.value = this._value;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecJobEnv | cdktf.IResolvable | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this.resolvableValue = undefined;
      this._key = undefined;
      this._scope = undefined;
      this._type = undefined;
      this._value = undefined;
    }
    else if (cdktf.Tokenization.isResolvable(value)) {
      this.isEmptyObject = false;
      this.resolvableValue = value;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this.resolvableValue = undefined;
      this._key = value.key;
      this._scope = value.scope;
      this._type = value.type;
      this._value = value.value;
    }
  }

  // key - computed: false, optional: true, required: false
  private _key?: string; 
  public get key() {
    return this.getStringAttribute('key');
  }
  public set key(value: string) {
    this._key = value;
  }
  public resetKey() {
    this._key = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get keyInput() {
    return this._key;
  }

  // scope - computed: false, optional: true, required: false
  private _scope?: string; 
  public get scope() {
    return this.getStringAttribute('scope');
  }
  public set scope(value: string) {
    this._scope = value;
  }
  public resetScope() {
    this._scope = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get scopeInput() {
    return this._scope;
  }

  // type - computed: true, optional: true, required: false
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

  // value - computed: false, optional: true, required: false
  private _value?: string; 
  public get value() {
    return this.getStringAttribute('value');
  }
  public set value(value: string) {
    this._value = value;
  }
  public resetValue() {
    this._value = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get valueInput() {
    return this._value;
  }
}

export class AppSpecJobEnvList extends cdktf.ComplexList {
  public internalValue? : AppSpecJobEnv[] | cdktf.IResolvable

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
  public get(index: number): AppSpecJobEnvOutputReference {
    return new AppSpecJobEnvOutputReference(this.terraformResource, this.terraformAttribute, index, this.wrapsSet);
  }
}
export interface AppSpecJobGit {
  /**
  * The name of the branch to use.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#branch App#branch}
  */
  readonly branch?: string;
  /**
  * The clone URL of the repo.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#repo_clone_url App#repo_clone_url}
  */
  readonly repoCloneUrl?: string;
}

export function appSpecJobGitToTerraform(struct?: AppSpecJobGitOutputReference | AppSpecJobGit): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    branch: cdktf.stringToTerraform(struct!.branch),
    repo_clone_url: cdktf.stringToTerraform(struct!.repoCloneUrl),
  }
}

export class AppSpecJobGitOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string) {
    super(terraformResource, terraformAttribute, false, 0);
  }

  public get internalValue(): AppSpecJobGit | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._branch !== undefined) {
      hasAnyValues = true;
      internalValueResult.branch = this._branch;
    }
    if (this._repoCloneUrl !== undefined) {
      hasAnyValues = true;
      internalValueResult.repoCloneUrl = this._repoCloneUrl;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecJobGit | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this._branch = undefined;
      this._repoCloneUrl = undefined;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this._branch = value.branch;
      this._repoCloneUrl = value.repoCloneUrl;
    }
  }

  // branch - computed: false, optional: true, required: false
  private _branch?: string; 
  public get branch() {
    return this.getStringAttribute('branch');
  }
  public set branch(value: string) {
    this._branch = value;
  }
  public resetBranch() {
    this._branch = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get branchInput() {
    return this._branch;
  }

  // repo_clone_url - computed: false, optional: true, required: false
  private _repoCloneUrl?: string; 
  public get repoCloneUrl() {
    return this.getStringAttribute('repo_clone_url');
  }
  public set repoCloneUrl(value: string) {
    this._repoCloneUrl = value;
  }
  public resetRepoCloneUrl() {
    this._repoCloneUrl = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get repoCloneUrlInput() {
    return this._repoCloneUrl;
  }
}
export interface AppSpecJobGithub {
  /**
  * The name of the branch to use.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#branch App#branch}
  */
  readonly branch?: string;
  /**
  * Whether to automatically deploy new commits made to the repo
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#deploy_on_push App#deploy_on_push}
  */
  readonly deployOnPush?: boolean | cdktf.IResolvable;
  /**
  * The name of the repo in the format `owner/repo`.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#repo App#repo}
  */
  readonly repo?: string;
}

export function appSpecJobGithubToTerraform(struct?: AppSpecJobGithubOutputReference | AppSpecJobGithub): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    branch: cdktf.stringToTerraform(struct!.branch),
    deploy_on_push: cdktf.booleanToTerraform(struct!.deployOnPush),
    repo: cdktf.stringToTerraform(struct!.repo),
  }
}

export class AppSpecJobGithubOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string) {
    super(terraformResource, terraformAttribute, false, 0);
  }

  public get internalValue(): AppSpecJobGithub | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._branch !== undefined) {
      hasAnyValues = true;
      internalValueResult.branch = this._branch;
    }
    if (this._deployOnPush !== undefined) {
      hasAnyValues = true;
      internalValueResult.deployOnPush = this._deployOnPush;
    }
    if (this._repo !== undefined) {
      hasAnyValues = true;
      internalValueResult.repo = this._repo;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecJobGithub | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this._branch = undefined;
      this._deployOnPush = undefined;
      this._repo = undefined;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this._branch = value.branch;
      this._deployOnPush = value.deployOnPush;
      this._repo = value.repo;
    }
  }

  // branch - computed: false, optional: true, required: false
  private _branch?: string; 
  public get branch() {
    return this.getStringAttribute('branch');
  }
  public set branch(value: string) {
    this._branch = value;
  }
  public resetBranch() {
    this._branch = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get branchInput() {
    return this._branch;
  }

  // deploy_on_push - computed: false, optional: true, required: false
  private _deployOnPush?: boolean | cdktf.IResolvable; 
  public get deployOnPush() {
    return this.getBooleanAttribute('deploy_on_push');
  }
  public set deployOnPush(value: boolean | cdktf.IResolvable) {
    this._deployOnPush = value;
  }
  public resetDeployOnPush() {
    this._deployOnPush = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get deployOnPushInput() {
    return this._deployOnPush;
  }

  // repo - computed: false, optional: true, required: false
  private _repo?: string; 
  public get repo() {
    return this.getStringAttribute('repo');
  }
  public set repo(value: string) {
    this._repo = value;
  }
  public resetRepo() {
    this._repo = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get repoInput() {
    return this._repo;
  }
}
export interface AppSpecJobGitlab {
  /**
  * The name of the branch to use.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#branch App#branch}
  */
  readonly branch?: string;
  /**
  * Whether to automatically deploy new commits made to the repo
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#deploy_on_push App#deploy_on_push}
  */
  readonly deployOnPush?: boolean | cdktf.IResolvable;
  /**
  * The name of the repo in the format `owner/repo`.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#repo App#repo}
  */
  readonly repo?: string;
}

export function appSpecJobGitlabToTerraform(struct?: AppSpecJobGitlabOutputReference | AppSpecJobGitlab): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    branch: cdktf.stringToTerraform(struct!.branch),
    deploy_on_push: cdktf.booleanToTerraform(struct!.deployOnPush),
    repo: cdktf.stringToTerraform(struct!.repo),
  }
}

export class AppSpecJobGitlabOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string) {
    super(terraformResource, terraformAttribute, false, 0);
  }

  public get internalValue(): AppSpecJobGitlab | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._branch !== undefined) {
      hasAnyValues = true;
      internalValueResult.branch = this._branch;
    }
    if (this._deployOnPush !== undefined) {
      hasAnyValues = true;
      internalValueResult.deployOnPush = this._deployOnPush;
    }
    if (this._repo !== undefined) {
      hasAnyValues = true;
      internalValueResult.repo = this._repo;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecJobGitlab | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this._branch = undefined;
      this._deployOnPush = undefined;
      this._repo = undefined;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this._branch = value.branch;
      this._deployOnPush = value.deployOnPush;
      this._repo = value.repo;
    }
  }

  // branch - computed: false, optional: true, required: false
  private _branch?: string; 
  public get branch() {
    return this.getStringAttribute('branch');
  }
  public set branch(value: string) {
    this._branch = value;
  }
  public resetBranch() {
    this._branch = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get branchInput() {
    return this._branch;
  }

  // deploy_on_push - computed: false, optional: true, required: false
  private _deployOnPush?: boolean | cdktf.IResolvable; 
  public get deployOnPush() {
    return this.getBooleanAttribute('deploy_on_push');
  }
  public set deployOnPush(value: boolean | cdktf.IResolvable) {
    this._deployOnPush = value;
  }
  public resetDeployOnPush() {
    this._deployOnPush = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get deployOnPushInput() {
    return this._deployOnPush;
  }

  // repo - computed: false, optional: true, required: false
  private _repo?: string; 
  public get repo() {
    return this.getStringAttribute('repo');
  }
  public set repo(value: string) {
    this._repo = value;
  }
  public resetRepo() {
    this._repo = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get repoInput() {
    return this._repo;
  }
}
export interface AppSpecJobImageDeployOnPush {
  /**
  * Whether to automatically deploy images pushed to DOCR.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#enabled App#enabled}
  */
  readonly enabled?: boolean | cdktf.IResolvable;
}

export function appSpecJobImageDeployOnPushToTerraform(struct?: AppSpecJobImageDeployOnPush | cdktf.IResolvable): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    enabled: cdktf.booleanToTerraform(struct!.enabled),
  }
}

export class AppSpecJobImageDeployOnPushOutputReference extends cdktf.ComplexObject {
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

  public get internalValue(): AppSpecJobImageDeployOnPush | cdktf.IResolvable | undefined {
    if (this.resolvableValue) {
      return this.resolvableValue;
    }
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._enabled !== undefined) {
      hasAnyValues = true;
      internalValueResult.enabled = this._enabled;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecJobImageDeployOnPush | cdktf.IResolvable | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this.resolvableValue = undefined;
      this._enabled = undefined;
    }
    else if (cdktf.Tokenization.isResolvable(value)) {
      this.isEmptyObject = false;
      this.resolvableValue = value;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this.resolvableValue = undefined;
      this._enabled = value.enabled;
    }
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
}

export class AppSpecJobImageDeployOnPushList extends cdktf.ComplexList {
  public internalValue? : AppSpecJobImageDeployOnPush[] | cdktf.IResolvable

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
  public get(index: number): AppSpecJobImageDeployOnPushOutputReference {
    return new AppSpecJobImageDeployOnPushOutputReference(this.terraformResource, this.terraformAttribute, index, this.wrapsSet);
  }
}
export interface AppSpecJobImage {
  /**
  * The registry name. Must be left empty for the DOCR registry type.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#registry App#registry}
  */
  readonly registry?: string;
  /**
  * The registry type.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#registry_type App#registry_type}
  */
  readonly registryType: string;
  /**
  * The repository name.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#repository App#repository}
  */
  readonly repository: string;
  /**
  * The repository tag. Defaults to latest if not provided.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#tag App#tag}
  */
  readonly tag?: string;
  /**
  * deploy_on_push block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#deploy_on_push App#deploy_on_push}
  */
  readonly deployOnPush?: AppSpecJobImageDeployOnPush[] | cdktf.IResolvable;
}

export function appSpecJobImageToTerraform(struct?: AppSpecJobImageOutputReference | AppSpecJobImage): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    registry: cdktf.stringToTerraform(struct!.registry),
    registry_type: cdktf.stringToTerraform(struct!.registryType),
    repository: cdktf.stringToTerraform(struct!.repository),
    tag: cdktf.stringToTerraform(struct!.tag),
    deploy_on_push: cdktf.listMapper(appSpecJobImageDeployOnPushToTerraform, true)(struct!.deployOnPush),
  }
}

export class AppSpecJobImageOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string) {
    super(terraformResource, terraformAttribute, false, 0);
  }

  public get internalValue(): AppSpecJobImage | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._registry !== undefined) {
      hasAnyValues = true;
      internalValueResult.registry = this._registry;
    }
    if (this._registryType !== undefined) {
      hasAnyValues = true;
      internalValueResult.registryType = this._registryType;
    }
    if (this._repository !== undefined) {
      hasAnyValues = true;
      internalValueResult.repository = this._repository;
    }
    if (this._tag !== undefined) {
      hasAnyValues = true;
      internalValueResult.tag = this._tag;
    }
    if (this._deployOnPush?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.deployOnPush = this._deployOnPush?.internalValue;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecJobImage | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this._registry = undefined;
      this._registryType = undefined;
      this._repository = undefined;
      this._tag = undefined;
      this._deployOnPush.internalValue = undefined;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this._registry = value.registry;
      this._registryType = value.registryType;
      this._repository = value.repository;
      this._tag = value.tag;
      this._deployOnPush.internalValue = value.deployOnPush;
    }
  }

  // registry - computed: false, optional: true, required: false
  private _registry?: string; 
  public get registry() {
    return this.getStringAttribute('registry');
  }
  public set registry(value: string) {
    this._registry = value;
  }
  public resetRegistry() {
    this._registry = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get registryInput() {
    return this._registry;
  }

  // registry_type - computed: false, optional: false, required: true
  private _registryType?: string; 
  public get registryType() {
    return this.getStringAttribute('registry_type');
  }
  public set registryType(value: string) {
    this._registryType = value;
  }
  // Temporarily expose input value. Use with caution.
  public get registryTypeInput() {
    return this._registryType;
  }

  // repository - computed: false, optional: false, required: true
  private _repository?: string; 
  public get repository() {
    return this.getStringAttribute('repository');
  }
  public set repository(value: string) {
    this._repository = value;
  }
  // Temporarily expose input value. Use with caution.
  public get repositoryInput() {
    return this._repository;
  }

  // tag - computed: false, optional: true, required: false
  private _tag?: string; 
  public get tag() {
    return this.getStringAttribute('tag');
  }
  public set tag(value: string) {
    this._tag = value;
  }
  public resetTag() {
    this._tag = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get tagInput() {
    return this._tag;
  }

  // deploy_on_push - computed: false, optional: true, required: false
  private _deployOnPush = new AppSpecJobImageDeployOnPushList(this, "deploy_on_push", false);
  public get deployOnPush() {
    return this._deployOnPush;
  }
  public putDeployOnPush(value: AppSpecJobImageDeployOnPush[] | cdktf.IResolvable) {
    this._deployOnPush.internalValue = value;
  }
  public resetDeployOnPush() {
    this._deployOnPush.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get deployOnPushInput() {
    return this._deployOnPush.internalValue;
  }
}
export interface AppSpecJobLogDestinationDatadog {
  /**
  * Datadog API key.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#api_key App#api_key}
  */
  readonly apiKey: string;
  /**
  * Datadog HTTP log intake endpoint.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#endpoint App#endpoint}
  */
  readonly endpoint?: string;
}

export function appSpecJobLogDestinationDatadogToTerraform(struct?: AppSpecJobLogDestinationDatadogOutputReference | AppSpecJobLogDestinationDatadog): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    api_key: cdktf.stringToTerraform(struct!.apiKey),
    endpoint: cdktf.stringToTerraform(struct!.endpoint),
  }
}

export class AppSpecJobLogDestinationDatadogOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string) {
    super(terraformResource, terraformAttribute, false, 0);
  }

  public get internalValue(): AppSpecJobLogDestinationDatadog | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._apiKey !== undefined) {
      hasAnyValues = true;
      internalValueResult.apiKey = this._apiKey;
    }
    if (this._endpoint !== undefined) {
      hasAnyValues = true;
      internalValueResult.endpoint = this._endpoint;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecJobLogDestinationDatadog | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this._apiKey = undefined;
      this._endpoint = undefined;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this._apiKey = value.apiKey;
      this._endpoint = value.endpoint;
    }
  }

  // api_key - computed: false, optional: false, required: true
  private _apiKey?: string; 
  public get apiKey() {
    return this.getStringAttribute('api_key');
  }
  public set apiKey(value: string) {
    this._apiKey = value;
  }
  // Temporarily expose input value. Use with caution.
  public get apiKeyInput() {
    return this._apiKey;
  }

  // endpoint - computed: false, optional: true, required: false
  private _endpoint?: string; 
  public get endpoint() {
    return this.getStringAttribute('endpoint');
  }
  public set endpoint(value: string) {
    this._endpoint = value;
  }
  public resetEndpoint() {
    this._endpoint = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get endpointInput() {
    return this._endpoint;
  }
}
export interface AppSpecJobLogDestinationLogtail {
  /**
  * Logtail token.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#token App#token}
  */
  readonly token: string;
}

export function appSpecJobLogDestinationLogtailToTerraform(struct?: AppSpecJobLogDestinationLogtailOutputReference | AppSpecJobLogDestinationLogtail): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    token: cdktf.stringToTerraform(struct!.token),
  }
}

export class AppSpecJobLogDestinationLogtailOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string) {
    super(terraformResource, terraformAttribute, false, 0);
  }

  public get internalValue(): AppSpecJobLogDestinationLogtail | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._token !== undefined) {
      hasAnyValues = true;
      internalValueResult.token = this._token;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecJobLogDestinationLogtail | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this._token = undefined;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this._token = value.token;
    }
  }

  // token - computed: false, optional: false, required: true
  private _token?: string; 
  public get token() {
    return this.getStringAttribute('token');
  }
  public set token(value: string) {
    this._token = value;
  }
  // Temporarily expose input value. Use with caution.
  public get tokenInput() {
    return this._token;
  }
}
export interface AppSpecJobLogDestinationPapertrail {
  /**
  * Papertrail syslog endpoint.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#endpoint App#endpoint}
  */
  readonly endpoint: string;
}

export function appSpecJobLogDestinationPapertrailToTerraform(struct?: AppSpecJobLogDestinationPapertrailOutputReference | AppSpecJobLogDestinationPapertrail): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    endpoint: cdktf.stringToTerraform(struct!.endpoint),
  }
}

export class AppSpecJobLogDestinationPapertrailOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string) {
    super(terraformResource, terraformAttribute, false, 0);
  }

  public get internalValue(): AppSpecJobLogDestinationPapertrail | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._endpoint !== undefined) {
      hasAnyValues = true;
      internalValueResult.endpoint = this._endpoint;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecJobLogDestinationPapertrail | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this._endpoint = undefined;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this._endpoint = value.endpoint;
    }
  }

  // endpoint - computed: false, optional: false, required: true
  private _endpoint?: string; 
  public get endpoint() {
    return this.getStringAttribute('endpoint');
  }
  public set endpoint(value: string) {
    this._endpoint = value;
  }
  // Temporarily expose input value. Use with caution.
  public get endpointInput() {
    return this._endpoint;
  }
}
export interface AppSpecJobLogDestination {
  /**
  * Name of the log destination
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#name App#name}
  */
  readonly name: string;
  /**
  * datadog block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#datadog App#datadog}
  */
  readonly datadog?: AppSpecJobLogDestinationDatadog;
  /**
  * logtail block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#logtail App#logtail}
  */
  readonly logtail?: AppSpecJobLogDestinationLogtail;
  /**
  * papertrail block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#papertrail App#papertrail}
  */
  readonly papertrail?: AppSpecJobLogDestinationPapertrail;
}

export function appSpecJobLogDestinationToTerraform(struct?: AppSpecJobLogDestination | cdktf.IResolvable): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    name: cdktf.stringToTerraform(struct!.name),
    datadog: appSpecJobLogDestinationDatadogToTerraform(struct!.datadog),
    logtail: appSpecJobLogDestinationLogtailToTerraform(struct!.logtail),
    papertrail: appSpecJobLogDestinationPapertrailToTerraform(struct!.papertrail),
  }
}

export class AppSpecJobLogDestinationOutputReference extends cdktf.ComplexObject {
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

  public get internalValue(): AppSpecJobLogDestination | cdktf.IResolvable | undefined {
    if (this.resolvableValue) {
      return this.resolvableValue;
    }
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._name !== undefined) {
      hasAnyValues = true;
      internalValueResult.name = this._name;
    }
    if (this._datadog?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.datadog = this._datadog?.internalValue;
    }
    if (this._logtail?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.logtail = this._logtail?.internalValue;
    }
    if (this._papertrail?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.papertrail = this._papertrail?.internalValue;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecJobLogDestination | cdktf.IResolvable | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this.resolvableValue = undefined;
      this._name = undefined;
      this._datadog.internalValue = undefined;
      this._logtail.internalValue = undefined;
      this._papertrail.internalValue = undefined;
    }
    else if (cdktf.Tokenization.isResolvable(value)) {
      this.isEmptyObject = false;
      this.resolvableValue = value;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this.resolvableValue = undefined;
      this._name = value.name;
      this._datadog.internalValue = value.datadog;
      this._logtail.internalValue = value.logtail;
      this._papertrail.internalValue = value.papertrail;
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

  // datadog - computed: false, optional: true, required: false
  private _datadog = new AppSpecJobLogDestinationDatadogOutputReference(this, "datadog");
  public get datadog() {
    return this._datadog;
  }
  public putDatadog(value: AppSpecJobLogDestinationDatadog) {
    this._datadog.internalValue = value;
  }
  public resetDatadog() {
    this._datadog.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get datadogInput() {
    return this._datadog.internalValue;
  }

  // logtail - computed: false, optional: true, required: false
  private _logtail = new AppSpecJobLogDestinationLogtailOutputReference(this, "logtail");
  public get logtail() {
    return this._logtail;
  }
  public putLogtail(value: AppSpecJobLogDestinationLogtail) {
    this._logtail.internalValue = value;
  }
  public resetLogtail() {
    this._logtail.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get logtailInput() {
    return this._logtail.internalValue;
  }

  // papertrail - computed: false, optional: true, required: false
  private _papertrail = new AppSpecJobLogDestinationPapertrailOutputReference(this, "papertrail");
  public get papertrail() {
    return this._papertrail;
  }
  public putPapertrail(value: AppSpecJobLogDestinationPapertrail) {
    this._papertrail.internalValue = value;
  }
  public resetPapertrail() {
    this._papertrail.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get papertrailInput() {
    return this._papertrail.internalValue;
  }
}

export class AppSpecJobLogDestinationList extends cdktf.ComplexList {
  public internalValue? : AppSpecJobLogDestination[] | cdktf.IResolvable

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
  public get(index: number): AppSpecJobLogDestinationOutputReference {
    return new AppSpecJobLogDestinationOutputReference(this.terraformResource, this.terraformAttribute, index, this.wrapsSet);
  }
}
export interface AppSpecJob {
  /**
  * An optional build command to run while building this component from source.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#build_command App#build_command}
  */
  readonly buildCommand?: string;
  /**
  * The path to a Dockerfile relative to the root of the repo. If set, overrides usage of buildpacks.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#dockerfile_path App#dockerfile_path}
  */
  readonly dockerfilePath?: string;
  /**
  * An environment slug describing the type of this app.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#environment_slug App#environment_slug}
  */
  readonly environmentSlug?: string;
  /**
  * The amount of instances that this component should be scaled to.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#instance_count App#instance_count}
  */
  readonly instanceCount?: number;
  /**
  * The instance size to use for this component.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#instance_size_slug App#instance_size_slug}
  */
  readonly instanceSizeSlug?: string;
  /**
  * The type of job and when it will be run during the deployment process.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#kind App#kind}
  */
  readonly kind?: string;
  /**
  * The name of the component
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#name App#name}
  */
  readonly name: string;
  /**
  * An optional run command to override the component's default.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#run_command App#run_command}
  */
  readonly runCommand?: string;
  /**
  * An optional path to the working directory to use for the build.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#source_dir App#source_dir}
  */
  readonly sourceDir?: string;
  /**
  * alert block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#alert App#alert}
  */
  readonly alert?: AppSpecJobAlert[] | cdktf.IResolvable;
  /**
  * env block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#env App#env}
  */
  readonly env?: AppSpecJobEnv[] | cdktf.IResolvable;
  /**
  * git block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#git App#git}
  */
  readonly git?: AppSpecJobGit;
  /**
  * github block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#github App#github}
  */
  readonly github?: AppSpecJobGithub;
  /**
  * gitlab block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#gitlab App#gitlab}
  */
  readonly gitlab?: AppSpecJobGitlab;
  /**
  * image block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#image App#image}
  */
  readonly image?: AppSpecJobImage;
  /**
  * log_destination block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#log_destination App#log_destination}
  */
  readonly logDestination?: AppSpecJobLogDestination[] | cdktf.IResolvable;
}

export function appSpecJobToTerraform(struct?: AppSpecJob | cdktf.IResolvable): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    build_command: cdktf.stringToTerraform(struct!.buildCommand),
    dockerfile_path: cdktf.stringToTerraform(struct!.dockerfilePath),
    environment_slug: cdktf.stringToTerraform(struct!.environmentSlug),
    instance_count: cdktf.numberToTerraform(struct!.instanceCount),
    instance_size_slug: cdktf.stringToTerraform(struct!.instanceSizeSlug),
    kind: cdktf.stringToTerraform(struct!.kind),
    name: cdktf.stringToTerraform(struct!.name),
    run_command: cdktf.stringToTerraform(struct!.runCommand),
    source_dir: cdktf.stringToTerraform(struct!.sourceDir),
    alert: cdktf.listMapper(appSpecJobAlertToTerraform, true)(struct!.alert),
    env: cdktf.listMapper(appSpecJobEnvToTerraform, true)(struct!.env),
    git: appSpecJobGitToTerraform(struct!.git),
    github: appSpecJobGithubToTerraform(struct!.github),
    gitlab: appSpecJobGitlabToTerraform(struct!.gitlab),
    image: appSpecJobImageToTerraform(struct!.image),
    log_destination: cdktf.listMapper(appSpecJobLogDestinationToTerraform, true)(struct!.logDestination),
  }
}

export class AppSpecJobOutputReference extends cdktf.ComplexObject {
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

  public get internalValue(): AppSpecJob | cdktf.IResolvable | undefined {
    if (this.resolvableValue) {
      return this.resolvableValue;
    }
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._buildCommand !== undefined) {
      hasAnyValues = true;
      internalValueResult.buildCommand = this._buildCommand;
    }
    if (this._dockerfilePath !== undefined) {
      hasAnyValues = true;
      internalValueResult.dockerfilePath = this._dockerfilePath;
    }
    if (this._environmentSlug !== undefined) {
      hasAnyValues = true;
      internalValueResult.environmentSlug = this._environmentSlug;
    }
    if (this._instanceCount !== undefined) {
      hasAnyValues = true;
      internalValueResult.instanceCount = this._instanceCount;
    }
    if (this._instanceSizeSlug !== undefined) {
      hasAnyValues = true;
      internalValueResult.instanceSizeSlug = this._instanceSizeSlug;
    }
    if (this._kind !== undefined) {
      hasAnyValues = true;
      internalValueResult.kind = this._kind;
    }
    if (this._name !== undefined) {
      hasAnyValues = true;
      internalValueResult.name = this._name;
    }
    if (this._runCommand !== undefined) {
      hasAnyValues = true;
      internalValueResult.runCommand = this._runCommand;
    }
    if (this._sourceDir !== undefined) {
      hasAnyValues = true;
      internalValueResult.sourceDir = this._sourceDir;
    }
    if (this._alert?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.alert = this._alert?.internalValue;
    }
    if (this._env?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.env = this._env?.internalValue;
    }
    if (this._git?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.git = this._git?.internalValue;
    }
    if (this._github?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.github = this._github?.internalValue;
    }
    if (this._gitlab?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.gitlab = this._gitlab?.internalValue;
    }
    if (this._image?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.image = this._image?.internalValue;
    }
    if (this._logDestination?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.logDestination = this._logDestination?.internalValue;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecJob | cdktf.IResolvable | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this.resolvableValue = undefined;
      this._buildCommand = undefined;
      this._dockerfilePath = undefined;
      this._environmentSlug = undefined;
      this._instanceCount = undefined;
      this._instanceSizeSlug = undefined;
      this._kind = undefined;
      this._name = undefined;
      this._runCommand = undefined;
      this._sourceDir = undefined;
      this._alert.internalValue = undefined;
      this._env.internalValue = undefined;
      this._git.internalValue = undefined;
      this._github.internalValue = undefined;
      this._gitlab.internalValue = undefined;
      this._image.internalValue = undefined;
      this._logDestination.internalValue = undefined;
    }
    else if (cdktf.Tokenization.isResolvable(value)) {
      this.isEmptyObject = false;
      this.resolvableValue = value;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this.resolvableValue = undefined;
      this._buildCommand = value.buildCommand;
      this._dockerfilePath = value.dockerfilePath;
      this._environmentSlug = value.environmentSlug;
      this._instanceCount = value.instanceCount;
      this._instanceSizeSlug = value.instanceSizeSlug;
      this._kind = value.kind;
      this._name = value.name;
      this._runCommand = value.runCommand;
      this._sourceDir = value.sourceDir;
      this._alert.internalValue = value.alert;
      this._env.internalValue = value.env;
      this._git.internalValue = value.git;
      this._github.internalValue = value.github;
      this._gitlab.internalValue = value.gitlab;
      this._image.internalValue = value.image;
      this._logDestination.internalValue = value.logDestination;
    }
  }

  // build_command - computed: false, optional: true, required: false
  private _buildCommand?: string; 
  public get buildCommand() {
    return this.getStringAttribute('build_command');
  }
  public set buildCommand(value: string) {
    this._buildCommand = value;
  }
  public resetBuildCommand() {
    this._buildCommand = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get buildCommandInput() {
    return this._buildCommand;
  }

  // dockerfile_path - computed: false, optional: true, required: false
  private _dockerfilePath?: string; 
  public get dockerfilePath() {
    return this.getStringAttribute('dockerfile_path');
  }
  public set dockerfilePath(value: string) {
    this._dockerfilePath = value;
  }
  public resetDockerfilePath() {
    this._dockerfilePath = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get dockerfilePathInput() {
    return this._dockerfilePath;
  }

  // environment_slug - computed: false, optional: true, required: false
  private _environmentSlug?: string; 
  public get environmentSlug() {
    return this.getStringAttribute('environment_slug');
  }
  public set environmentSlug(value: string) {
    this._environmentSlug = value;
  }
  public resetEnvironmentSlug() {
    this._environmentSlug = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get environmentSlugInput() {
    return this._environmentSlug;
  }

  // instance_count - computed: false, optional: true, required: false
  private _instanceCount?: number; 
  public get instanceCount() {
    return this.getNumberAttribute('instance_count');
  }
  public set instanceCount(value: number) {
    this._instanceCount = value;
  }
  public resetInstanceCount() {
    this._instanceCount = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get instanceCountInput() {
    return this._instanceCount;
  }

  // instance_size_slug - computed: false, optional: true, required: false
  private _instanceSizeSlug?: string; 
  public get instanceSizeSlug() {
    return this.getStringAttribute('instance_size_slug');
  }
  public set instanceSizeSlug(value: string) {
    this._instanceSizeSlug = value;
  }
  public resetInstanceSizeSlug() {
    this._instanceSizeSlug = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get instanceSizeSlugInput() {
    return this._instanceSizeSlug;
  }

  // kind - computed: false, optional: true, required: false
  private _kind?: string; 
  public get kind() {
    return this.getStringAttribute('kind');
  }
  public set kind(value: string) {
    this._kind = value;
  }
  public resetKind() {
    this._kind = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get kindInput() {
    return this._kind;
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

  // run_command - computed: false, optional: true, required: false
  private _runCommand?: string; 
  public get runCommand() {
    return this.getStringAttribute('run_command');
  }
  public set runCommand(value: string) {
    this._runCommand = value;
  }
  public resetRunCommand() {
    this._runCommand = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get runCommandInput() {
    return this._runCommand;
  }

  // source_dir - computed: false, optional: true, required: false
  private _sourceDir?: string; 
  public get sourceDir() {
    return this.getStringAttribute('source_dir');
  }
  public set sourceDir(value: string) {
    this._sourceDir = value;
  }
  public resetSourceDir() {
    this._sourceDir = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get sourceDirInput() {
    return this._sourceDir;
  }

  // alert - computed: false, optional: true, required: false
  private _alert = new AppSpecJobAlertList(this, "alert", false);
  public get alert() {
    return this._alert;
  }
  public putAlert(value: AppSpecJobAlert[] | cdktf.IResolvable) {
    this._alert.internalValue = value;
  }
  public resetAlert() {
    this._alert.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get alertInput() {
    return this._alert.internalValue;
  }

  // env - computed: false, optional: true, required: false
  private _env = new AppSpecJobEnvList(this, "env", true);
  public get env() {
    return this._env;
  }
  public putEnv(value: AppSpecJobEnv[] | cdktf.IResolvable) {
    this._env.internalValue = value;
  }
  public resetEnv() {
    this._env.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get envInput() {
    return this._env.internalValue;
  }

  // git - computed: false, optional: true, required: false
  private _git = new AppSpecJobGitOutputReference(this, "git");
  public get git() {
    return this._git;
  }
  public putGit(value: AppSpecJobGit) {
    this._git.internalValue = value;
  }
  public resetGit() {
    this._git.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get gitInput() {
    return this._git.internalValue;
  }

  // github - computed: false, optional: true, required: false
  private _github = new AppSpecJobGithubOutputReference(this, "github");
  public get github() {
    return this._github;
  }
  public putGithub(value: AppSpecJobGithub) {
    this._github.internalValue = value;
  }
  public resetGithub() {
    this._github.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get githubInput() {
    return this._github.internalValue;
  }

  // gitlab - computed: false, optional: true, required: false
  private _gitlab = new AppSpecJobGitlabOutputReference(this, "gitlab");
  public get gitlab() {
    return this._gitlab;
  }
  public putGitlab(value: AppSpecJobGitlab) {
    this._gitlab.internalValue = value;
  }
  public resetGitlab() {
    this._gitlab.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get gitlabInput() {
    return this._gitlab.internalValue;
  }

  // image - computed: false, optional: true, required: false
  private _image = new AppSpecJobImageOutputReference(this, "image");
  public get image() {
    return this._image;
  }
  public putImage(value: AppSpecJobImage) {
    this._image.internalValue = value;
  }
  public resetImage() {
    this._image.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get imageInput() {
    return this._image.internalValue;
  }

  // log_destination - computed: false, optional: true, required: false
  private _logDestination = new AppSpecJobLogDestinationList(this, "log_destination", false);
  public get logDestination() {
    return this._logDestination;
  }
  public putLogDestination(value: AppSpecJobLogDestination[] | cdktf.IResolvable) {
    this._logDestination.internalValue = value;
  }
  public resetLogDestination() {
    this._logDestination.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get logDestinationInput() {
    return this._logDestination.internalValue;
  }
}

export class AppSpecJobList extends cdktf.ComplexList {
  public internalValue? : AppSpecJob[] | cdktf.IResolvable

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
  public get(index: number): AppSpecJobOutputReference {
    return new AppSpecJobOutputReference(this.terraformResource, this.terraformAttribute, index, this.wrapsSet);
  }
}
export interface AppSpecServiceAlert {
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#disabled App#disabled}
  */
  readonly disabled?: boolean | cdktf.IResolvable;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#operator App#operator}
  */
  readonly operator: string;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#rule App#rule}
  */
  readonly rule: string;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#value App#value}
  */
  readonly value: number;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#window App#window}
  */
  readonly window: string;
}

export function appSpecServiceAlertToTerraform(struct?: AppSpecServiceAlert | cdktf.IResolvable): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    disabled: cdktf.booleanToTerraform(struct!.disabled),
    operator: cdktf.stringToTerraform(struct!.operator),
    rule: cdktf.stringToTerraform(struct!.rule),
    value: cdktf.numberToTerraform(struct!.value),
    window: cdktf.stringToTerraform(struct!.window),
  }
}

export class AppSpecServiceAlertOutputReference extends cdktf.ComplexObject {
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

  public get internalValue(): AppSpecServiceAlert | cdktf.IResolvable | undefined {
    if (this.resolvableValue) {
      return this.resolvableValue;
    }
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._disabled !== undefined) {
      hasAnyValues = true;
      internalValueResult.disabled = this._disabled;
    }
    if (this._operator !== undefined) {
      hasAnyValues = true;
      internalValueResult.operator = this._operator;
    }
    if (this._rule !== undefined) {
      hasAnyValues = true;
      internalValueResult.rule = this._rule;
    }
    if (this._value !== undefined) {
      hasAnyValues = true;
      internalValueResult.value = this._value;
    }
    if (this._window !== undefined) {
      hasAnyValues = true;
      internalValueResult.window = this._window;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecServiceAlert | cdktf.IResolvable | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this.resolvableValue = undefined;
      this._disabled = undefined;
      this._operator = undefined;
      this._rule = undefined;
      this._value = undefined;
      this._window = undefined;
    }
    else if (cdktf.Tokenization.isResolvable(value)) {
      this.isEmptyObject = false;
      this.resolvableValue = value;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this.resolvableValue = undefined;
      this._disabled = value.disabled;
      this._operator = value.operator;
      this._rule = value.rule;
      this._value = value.value;
      this._window = value.window;
    }
  }

  // disabled - computed: false, optional: true, required: false
  private _disabled?: boolean | cdktf.IResolvable; 
  public get disabled() {
    return this.getBooleanAttribute('disabled');
  }
  public set disabled(value: boolean | cdktf.IResolvable) {
    this._disabled = value;
  }
  public resetDisabled() {
    this._disabled = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get disabledInput() {
    return this._disabled;
  }

  // operator - computed: false, optional: false, required: true
  private _operator?: string; 
  public get operator() {
    return this.getStringAttribute('operator');
  }
  public set operator(value: string) {
    this._operator = value;
  }
  // Temporarily expose input value. Use with caution.
  public get operatorInput() {
    return this._operator;
  }

  // rule - computed: false, optional: false, required: true
  private _rule?: string; 
  public get rule() {
    return this.getStringAttribute('rule');
  }
  public set rule(value: string) {
    this._rule = value;
  }
  // Temporarily expose input value. Use with caution.
  public get ruleInput() {
    return this._rule;
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
}

export class AppSpecServiceAlertList extends cdktf.ComplexList {
  public internalValue? : AppSpecServiceAlert[] | cdktf.IResolvable

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
  public get(index: number): AppSpecServiceAlertOutputReference {
    return new AppSpecServiceAlertOutputReference(this.terraformResource, this.terraformAttribute, index, this.wrapsSet);
  }
}
export interface AppSpecServiceCorsAllowOrigins {
  /**
  * Exact string match.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#exact App#exact}
  */
  readonly exact?: string;
  /**
  * Prefix-based match. 
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#prefix App#prefix}
  */
  readonly prefix?: string;
  /**
  * RE2 style regex-based match.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#regex App#regex}
  */
  readonly regex?: string;
}

export function appSpecServiceCorsAllowOriginsToTerraform(struct?: AppSpecServiceCorsAllowOriginsOutputReference | AppSpecServiceCorsAllowOrigins): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    exact: cdktf.stringToTerraform(struct!.exact),
    prefix: cdktf.stringToTerraform(struct!.prefix),
    regex: cdktf.stringToTerraform(struct!.regex),
  }
}

export class AppSpecServiceCorsAllowOriginsOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string) {
    super(terraformResource, terraformAttribute, false, 0);
  }

  public get internalValue(): AppSpecServiceCorsAllowOrigins | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._exact !== undefined) {
      hasAnyValues = true;
      internalValueResult.exact = this._exact;
    }
    if (this._prefix !== undefined) {
      hasAnyValues = true;
      internalValueResult.prefix = this._prefix;
    }
    if (this._regex !== undefined) {
      hasAnyValues = true;
      internalValueResult.regex = this._regex;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecServiceCorsAllowOrigins | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this._exact = undefined;
      this._prefix = undefined;
      this._regex = undefined;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this._exact = value.exact;
      this._prefix = value.prefix;
      this._regex = value.regex;
    }
  }

  // exact - computed: false, optional: true, required: false
  private _exact?: string; 
  public get exact() {
    return this.getStringAttribute('exact');
  }
  public set exact(value: string) {
    this._exact = value;
  }
  public resetExact() {
    this._exact = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get exactInput() {
    return this._exact;
  }

  // prefix - computed: false, optional: true, required: false
  private _prefix?: string; 
  public get prefix() {
    return this.getStringAttribute('prefix');
  }
  public set prefix(value: string) {
    this._prefix = value;
  }
  public resetPrefix() {
    this._prefix = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get prefixInput() {
    return this._prefix;
  }

  // regex - computed: false, optional: true, required: false
  private _regex?: string; 
  public get regex() {
    return this.getStringAttribute('regex');
  }
  public set regex(value: string) {
    this._regex = value;
  }
  public resetRegex() {
    this._regex = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get regexInput() {
    return this._regex;
  }
}
export interface AppSpecServiceCors {
  /**
  * Whether browsers should expose the response to the client-side JavaScript code when the request’s credentials mode is `include`. This configures the Access-Control-Allow-Credentials header.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#allow_credentials App#allow_credentials}
  */
  readonly allowCredentials?: boolean | cdktf.IResolvable;
  /**
  * The set of allowed HTTP request headers. This configures the Access-Control-Allow-Headers header.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#allow_headers App#allow_headers}
  */
  readonly allowHeaders?: string[];
  /**
  * The set of allowed HTTP methods. This configures the Access-Control-Allow-Methods header.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#allow_methods App#allow_methods}
  */
  readonly allowMethods?: string[];
  /**
  * The set of HTTP response headers that browsers are allowed to access. This configures the Access-Control-Expose-Headers header.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#expose_headers App#expose_headers}
  */
  readonly exposeHeaders?: string[];
  /**
  * An optional duration specifying how long browsers can cache the results of a preflight request. This configures the Access-Control-Max-Age header. Example: `5h30m`.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#max_age App#max_age}
  */
  readonly maxAge?: string;
  /**
  * allow_origins block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#allow_origins App#allow_origins}
  */
  readonly allowOrigins?: AppSpecServiceCorsAllowOrigins;
}

export function appSpecServiceCorsToTerraform(struct?: AppSpecServiceCorsOutputReference | AppSpecServiceCors): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    allow_credentials: cdktf.booleanToTerraform(struct!.allowCredentials),
    allow_headers: cdktf.listMapper(cdktf.stringToTerraform, false)(struct!.allowHeaders),
    allow_methods: cdktf.listMapper(cdktf.stringToTerraform, false)(struct!.allowMethods),
    expose_headers: cdktf.listMapper(cdktf.stringToTerraform, false)(struct!.exposeHeaders),
    max_age: cdktf.stringToTerraform(struct!.maxAge),
    allow_origins: appSpecServiceCorsAllowOriginsToTerraform(struct!.allowOrigins),
  }
}

export class AppSpecServiceCorsOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string) {
    super(terraformResource, terraformAttribute, false, 0);
  }

  public get internalValue(): AppSpecServiceCors | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._allowCredentials !== undefined) {
      hasAnyValues = true;
      internalValueResult.allowCredentials = this._allowCredentials;
    }
    if (this._allowHeaders !== undefined) {
      hasAnyValues = true;
      internalValueResult.allowHeaders = this._allowHeaders;
    }
    if (this._allowMethods !== undefined) {
      hasAnyValues = true;
      internalValueResult.allowMethods = this._allowMethods;
    }
    if (this._exposeHeaders !== undefined) {
      hasAnyValues = true;
      internalValueResult.exposeHeaders = this._exposeHeaders;
    }
    if (this._maxAge !== undefined) {
      hasAnyValues = true;
      internalValueResult.maxAge = this._maxAge;
    }
    if (this._allowOrigins?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.allowOrigins = this._allowOrigins?.internalValue;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecServiceCors | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this._allowCredentials = undefined;
      this._allowHeaders = undefined;
      this._allowMethods = undefined;
      this._exposeHeaders = undefined;
      this._maxAge = undefined;
      this._allowOrigins.internalValue = undefined;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this._allowCredentials = value.allowCredentials;
      this._allowHeaders = value.allowHeaders;
      this._allowMethods = value.allowMethods;
      this._exposeHeaders = value.exposeHeaders;
      this._maxAge = value.maxAge;
      this._allowOrigins.internalValue = value.allowOrigins;
    }
  }

  // allow_credentials - computed: false, optional: true, required: false
  private _allowCredentials?: boolean | cdktf.IResolvable; 
  public get allowCredentials() {
    return this.getBooleanAttribute('allow_credentials');
  }
  public set allowCredentials(value: boolean | cdktf.IResolvable) {
    this._allowCredentials = value;
  }
  public resetAllowCredentials() {
    this._allowCredentials = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get allowCredentialsInput() {
    return this._allowCredentials;
  }

  // allow_headers - computed: false, optional: true, required: false
  private _allowHeaders?: string[]; 
  public get allowHeaders() {
    return cdktf.Fn.tolist(this.getListAttribute('allow_headers'));
  }
  public set allowHeaders(value: string[]) {
    this._allowHeaders = value;
  }
  public resetAllowHeaders() {
    this._allowHeaders = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get allowHeadersInput() {
    return this._allowHeaders;
  }

  // allow_methods - computed: false, optional: true, required: false
  private _allowMethods?: string[]; 
  public get allowMethods() {
    return cdktf.Fn.tolist(this.getListAttribute('allow_methods'));
  }
  public set allowMethods(value: string[]) {
    this._allowMethods = value;
  }
  public resetAllowMethods() {
    this._allowMethods = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get allowMethodsInput() {
    return this._allowMethods;
  }

  // expose_headers - computed: false, optional: true, required: false
  private _exposeHeaders?: string[]; 
  public get exposeHeaders() {
    return cdktf.Fn.tolist(this.getListAttribute('expose_headers'));
  }
  public set exposeHeaders(value: string[]) {
    this._exposeHeaders = value;
  }
  public resetExposeHeaders() {
    this._exposeHeaders = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get exposeHeadersInput() {
    return this._exposeHeaders;
  }

  // max_age - computed: false, optional: true, required: false
  private _maxAge?: string; 
  public get maxAge() {
    return this.getStringAttribute('max_age');
  }
  public set maxAge(value: string) {
    this._maxAge = value;
  }
  public resetMaxAge() {
    this._maxAge = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get maxAgeInput() {
    return this._maxAge;
  }

  // allow_origins - computed: false, optional: true, required: false
  private _allowOrigins = new AppSpecServiceCorsAllowOriginsOutputReference(this, "allow_origins");
  public get allowOrigins() {
    return this._allowOrigins;
  }
  public putAllowOrigins(value: AppSpecServiceCorsAllowOrigins) {
    this._allowOrigins.internalValue = value;
  }
  public resetAllowOrigins() {
    this._allowOrigins.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get allowOriginsInput() {
    return this._allowOrigins.internalValue;
  }
}
export interface AppSpecServiceEnv {
  /**
  * The name of the environment variable.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#key App#key}
  */
  readonly key?: string;
  /**
  * The visibility scope of the environment variable.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#scope App#scope}
  */
  readonly scope?: string;
  /**
  * The type of the environment variable.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#type App#type}
  */
  readonly type?: string;
  /**
  * The value of the environment variable.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#value App#value}
  */
  readonly value?: string;
}

export function appSpecServiceEnvToTerraform(struct?: AppSpecServiceEnv | cdktf.IResolvable): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    key: cdktf.stringToTerraform(struct!.key),
    scope: cdktf.stringToTerraform(struct!.scope),
    type: cdktf.stringToTerraform(struct!.type),
    value: cdktf.stringToTerraform(struct!.value),
  }
}

export class AppSpecServiceEnvOutputReference extends cdktf.ComplexObject {
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

  public get internalValue(): AppSpecServiceEnv | cdktf.IResolvable | undefined {
    if (this.resolvableValue) {
      return this.resolvableValue;
    }
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._key !== undefined) {
      hasAnyValues = true;
      internalValueResult.key = this._key;
    }
    if (this._scope !== undefined) {
      hasAnyValues = true;
      internalValueResult.scope = this._scope;
    }
    if (this._type !== undefined) {
      hasAnyValues = true;
      internalValueResult.type = this._type;
    }
    if (this._value !== undefined) {
      hasAnyValues = true;
      internalValueResult.value = this._value;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecServiceEnv | cdktf.IResolvable | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this.resolvableValue = undefined;
      this._key = undefined;
      this._scope = undefined;
      this._type = undefined;
      this._value = undefined;
    }
    else if (cdktf.Tokenization.isResolvable(value)) {
      this.isEmptyObject = false;
      this.resolvableValue = value;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this.resolvableValue = undefined;
      this._key = value.key;
      this._scope = value.scope;
      this._type = value.type;
      this._value = value.value;
    }
  }

  // key - computed: false, optional: true, required: false
  private _key?: string; 
  public get key() {
    return this.getStringAttribute('key');
  }
  public set key(value: string) {
    this._key = value;
  }
  public resetKey() {
    this._key = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get keyInput() {
    return this._key;
  }

  // scope - computed: false, optional: true, required: false
  private _scope?: string; 
  public get scope() {
    return this.getStringAttribute('scope');
  }
  public set scope(value: string) {
    this._scope = value;
  }
  public resetScope() {
    this._scope = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get scopeInput() {
    return this._scope;
  }

  // type - computed: true, optional: true, required: false
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

  // value - computed: false, optional: true, required: false
  private _value?: string; 
  public get value() {
    return this.getStringAttribute('value');
  }
  public set value(value: string) {
    this._value = value;
  }
  public resetValue() {
    this._value = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get valueInput() {
    return this._value;
  }
}

export class AppSpecServiceEnvList extends cdktf.ComplexList {
  public internalValue? : AppSpecServiceEnv[] | cdktf.IResolvable

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
  public get(index: number): AppSpecServiceEnvOutputReference {
    return new AppSpecServiceEnvOutputReference(this.terraformResource, this.terraformAttribute, index, this.wrapsSet);
  }
}
export interface AppSpecServiceGit {
  /**
  * The name of the branch to use.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#branch App#branch}
  */
  readonly branch?: string;
  /**
  * The clone URL of the repo.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#repo_clone_url App#repo_clone_url}
  */
  readonly repoCloneUrl?: string;
}

export function appSpecServiceGitToTerraform(struct?: AppSpecServiceGitOutputReference | AppSpecServiceGit): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    branch: cdktf.stringToTerraform(struct!.branch),
    repo_clone_url: cdktf.stringToTerraform(struct!.repoCloneUrl),
  }
}

export class AppSpecServiceGitOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string) {
    super(terraformResource, terraformAttribute, false, 0);
  }

  public get internalValue(): AppSpecServiceGit | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._branch !== undefined) {
      hasAnyValues = true;
      internalValueResult.branch = this._branch;
    }
    if (this._repoCloneUrl !== undefined) {
      hasAnyValues = true;
      internalValueResult.repoCloneUrl = this._repoCloneUrl;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecServiceGit | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this._branch = undefined;
      this._repoCloneUrl = undefined;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this._branch = value.branch;
      this._repoCloneUrl = value.repoCloneUrl;
    }
  }

  // branch - computed: false, optional: true, required: false
  private _branch?: string; 
  public get branch() {
    return this.getStringAttribute('branch');
  }
  public set branch(value: string) {
    this._branch = value;
  }
  public resetBranch() {
    this._branch = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get branchInput() {
    return this._branch;
  }

  // repo_clone_url - computed: false, optional: true, required: false
  private _repoCloneUrl?: string; 
  public get repoCloneUrl() {
    return this.getStringAttribute('repo_clone_url');
  }
  public set repoCloneUrl(value: string) {
    this._repoCloneUrl = value;
  }
  public resetRepoCloneUrl() {
    this._repoCloneUrl = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get repoCloneUrlInput() {
    return this._repoCloneUrl;
  }
}
export interface AppSpecServiceGithub {
  /**
  * The name of the branch to use.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#branch App#branch}
  */
  readonly branch?: string;
  /**
  * Whether to automatically deploy new commits made to the repo
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#deploy_on_push App#deploy_on_push}
  */
  readonly deployOnPush?: boolean | cdktf.IResolvable;
  /**
  * The name of the repo in the format `owner/repo`.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#repo App#repo}
  */
  readonly repo?: string;
}

export function appSpecServiceGithubToTerraform(struct?: AppSpecServiceGithubOutputReference | AppSpecServiceGithub): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    branch: cdktf.stringToTerraform(struct!.branch),
    deploy_on_push: cdktf.booleanToTerraform(struct!.deployOnPush),
    repo: cdktf.stringToTerraform(struct!.repo),
  }
}

export class AppSpecServiceGithubOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string) {
    super(terraformResource, terraformAttribute, false, 0);
  }

  public get internalValue(): AppSpecServiceGithub | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._branch !== undefined) {
      hasAnyValues = true;
      internalValueResult.branch = this._branch;
    }
    if (this._deployOnPush !== undefined) {
      hasAnyValues = true;
      internalValueResult.deployOnPush = this._deployOnPush;
    }
    if (this._repo !== undefined) {
      hasAnyValues = true;
      internalValueResult.repo = this._repo;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecServiceGithub | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this._branch = undefined;
      this._deployOnPush = undefined;
      this._repo = undefined;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this._branch = value.branch;
      this._deployOnPush = value.deployOnPush;
      this._repo = value.repo;
    }
  }

  // branch - computed: false, optional: true, required: false
  private _branch?: string; 
  public get branch() {
    return this.getStringAttribute('branch');
  }
  public set branch(value: string) {
    this._branch = value;
  }
  public resetBranch() {
    this._branch = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get branchInput() {
    return this._branch;
  }

  // deploy_on_push - computed: false, optional: true, required: false
  private _deployOnPush?: boolean | cdktf.IResolvable; 
  public get deployOnPush() {
    return this.getBooleanAttribute('deploy_on_push');
  }
  public set deployOnPush(value: boolean | cdktf.IResolvable) {
    this._deployOnPush = value;
  }
  public resetDeployOnPush() {
    this._deployOnPush = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get deployOnPushInput() {
    return this._deployOnPush;
  }

  // repo - computed: false, optional: true, required: false
  private _repo?: string; 
  public get repo() {
    return this.getStringAttribute('repo');
  }
  public set repo(value: string) {
    this._repo = value;
  }
  public resetRepo() {
    this._repo = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get repoInput() {
    return this._repo;
  }
}
export interface AppSpecServiceGitlab {
  /**
  * The name of the branch to use.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#branch App#branch}
  */
  readonly branch?: string;
  /**
  * Whether to automatically deploy new commits made to the repo
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#deploy_on_push App#deploy_on_push}
  */
  readonly deployOnPush?: boolean | cdktf.IResolvable;
  /**
  * The name of the repo in the format `owner/repo`.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#repo App#repo}
  */
  readonly repo?: string;
}

export function appSpecServiceGitlabToTerraform(struct?: AppSpecServiceGitlabOutputReference | AppSpecServiceGitlab): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    branch: cdktf.stringToTerraform(struct!.branch),
    deploy_on_push: cdktf.booleanToTerraform(struct!.deployOnPush),
    repo: cdktf.stringToTerraform(struct!.repo),
  }
}

export class AppSpecServiceGitlabOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string) {
    super(terraformResource, terraformAttribute, false, 0);
  }

  public get internalValue(): AppSpecServiceGitlab | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._branch !== undefined) {
      hasAnyValues = true;
      internalValueResult.branch = this._branch;
    }
    if (this._deployOnPush !== undefined) {
      hasAnyValues = true;
      internalValueResult.deployOnPush = this._deployOnPush;
    }
    if (this._repo !== undefined) {
      hasAnyValues = true;
      internalValueResult.repo = this._repo;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecServiceGitlab | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this._branch = undefined;
      this._deployOnPush = undefined;
      this._repo = undefined;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this._branch = value.branch;
      this._deployOnPush = value.deployOnPush;
      this._repo = value.repo;
    }
  }

  // branch - computed: false, optional: true, required: false
  private _branch?: string; 
  public get branch() {
    return this.getStringAttribute('branch');
  }
  public set branch(value: string) {
    this._branch = value;
  }
  public resetBranch() {
    this._branch = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get branchInput() {
    return this._branch;
  }

  // deploy_on_push - computed: false, optional: true, required: false
  private _deployOnPush?: boolean | cdktf.IResolvable; 
  public get deployOnPush() {
    return this.getBooleanAttribute('deploy_on_push');
  }
  public set deployOnPush(value: boolean | cdktf.IResolvable) {
    this._deployOnPush = value;
  }
  public resetDeployOnPush() {
    this._deployOnPush = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get deployOnPushInput() {
    return this._deployOnPush;
  }

  // repo - computed: false, optional: true, required: false
  private _repo?: string; 
  public get repo() {
    return this.getStringAttribute('repo');
  }
  public set repo(value: string) {
    this._repo = value;
  }
  public resetRepo() {
    this._repo = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get repoInput() {
    return this._repo;
  }
}
export interface AppSpecServiceHealthCheck {
  /**
  * The number of failed health checks before considered unhealthy.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#failure_threshold App#failure_threshold}
  */
  readonly failureThreshold?: number;
  /**
  * The route path used for the HTTP health check ping.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#http_path App#http_path}
  */
  readonly httpPath?: string;
  /**
  * The number of seconds to wait before beginning health checks.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#initial_delay_seconds App#initial_delay_seconds}
  */
  readonly initialDelaySeconds?: number;
  /**
  * The number of seconds to wait between health checks.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#period_seconds App#period_seconds}
  */
  readonly periodSeconds?: number;
  /**
  * The number of successful health checks before considered healthy.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#success_threshold App#success_threshold}
  */
  readonly successThreshold?: number;
  /**
  * The number of seconds after which the check times out.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#timeout_seconds App#timeout_seconds}
  */
  readonly timeoutSeconds?: number;
}

export function appSpecServiceHealthCheckToTerraform(struct?: AppSpecServiceHealthCheckOutputReference | AppSpecServiceHealthCheck): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    failure_threshold: cdktf.numberToTerraform(struct!.failureThreshold),
    http_path: cdktf.stringToTerraform(struct!.httpPath),
    initial_delay_seconds: cdktf.numberToTerraform(struct!.initialDelaySeconds),
    period_seconds: cdktf.numberToTerraform(struct!.periodSeconds),
    success_threshold: cdktf.numberToTerraform(struct!.successThreshold),
    timeout_seconds: cdktf.numberToTerraform(struct!.timeoutSeconds),
  }
}

export class AppSpecServiceHealthCheckOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string) {
    super(terraformResource, terraformAttribute, false, 0);
  }

  public get internalValue(): AppSpecServiceHealthCheck | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._failureThreshold !== undefined) {
      hasAnyValues = true;
      internalValueResult.failureThreshold = this._failureThreshold;
    }
    if (this._httpPath !== undefined) {
      hasAnyValues = true;
      internalValueResult.httpPath = this._httpPath;
    }
    if (this._initialDelaySeconds !== undefined) {
      hasAnyValues = true;
      internalValueResult.initialDelaySeconds = this._initialDelaySeconds;
    }
    if (this._periodSeconds !== undefined) {
      hasAnyValues = true;
      internalValueResult.periodSeconds = this._periodSeconds;
    }
    if (this._successThreshold !== undefined) {
      hasAnyValues = true;
      internalValueResult.successThreshold = this._successThreshold;
    }
    if (this._timeoutSeconds !== undefined) {
      hasAnyValues = true;
      internalValueResult.timeoutSeconds = this._timeoutSeconds;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecServiceHealthCheck | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this._failureThreshold = undefined;
      this._httpPath = undefined;
      this._initialDelaySeconds = undefined;
      this._periodSeconds = undefined;
      this._successThreshold = undefined;
      this._timeoutSeconds = undefined;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this._failureThreshold = value.failureThreshold;
      this._httpPath = value.httpPath;
      this._initialDelaySeconds = value.initialDelaySeconds;
      this._periodSeconds = value.periodSeconds;
      this._successThreshold = value.successThreshold;
      this._timeoutSeconds = value.timeoutSeconds;
    }
  }

  // failure_threshold - computed: false, optional: true, required: false
  private _failureThreshold?: number; 
  public get failureThreshold() {
    return this.getNumberAttribute('failure_threshold');
  }
  public set failureThreshold(value: number) {
    this._failureThreshold = value;
  }
  public resetFailureThreshold() {
    this._failureThreshold = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get failureThresholdInput() {
    return this._failureThreshold;
  }

  // http_path - computed: false, optional: true, required: false
  private _httpPath?: string; 
  public get httpPath() {
    return this.getStringAttribute('http_path');
  }
  public set httpPath(value: string) {
    this._httpPath = value;
  }
  public resetHttpPath() {
    this._httpPath = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get httpPathInput() {
    return this._httpPath;
  }

  // initial_delay_seconds - computed: false, optional: true, required: false
  private _initialDelaySeconds?: number; 
  public get initialDelaySeconds() {
    return this.getNumberAttribute('initial_delay_seconds');
  }
  public set initialDelaySeconds(value: number) {
    this._initialDelaySeconds = value;
  }
  public resetInitialDelaySeconds() {
    this._initialDelaySeconds = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get initialDelaySecondsInput() {
    return this._initialDelaySeconds;
  }

  // period_seconds - computed: false, optional: true, required: false
  private _periodSeconds?: number; 
  public get periodSeconds() {
    return this.getNumberAttribute('period_seconds');
  }
  public set periodSeconds(value: number) {
    this._periodSeconds = value;
  }
  public resetPeriodSeconds() {
    this._periodSeconds = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get periodSecondsInput() {
    return this._periodSeconds;
  }

  // success_threshold - computed: false, optional: true, required: false
  private _successThreshold?: number; 
  public get successThreshold() {
    return this.getNumberAttribute('success_threshold');
  }
  public set successThreshold(value: number) {
    this._successThreshold = value;
  }
  public resetSuccessThreshold() {
    this._successThreshold = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get successThresholdInput() {
    return this._successThreshold;
  }

  // timeout_seconds - computed: false, optional: true, required: false
  private _timeoutSeconds?: number; 
  public get timeoutSeconds() {
    return this.getNumberAttribute('timeout_seconds');
  }
  public set timeoutSeconds(value: number) {
    this._timeoutSeconds = value;
  }
  public resetTimeoutSeconds() {
    this._timeoutSeconds = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get timeoutSecondsInput() {
    return this._timeoutSeconds;
  }
}
export interface AppSpecServiceImageDeployOnPush {
  /**
  * Whether to automatically deploy images pushed to DOCR.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#enabled App#enabled}
  */
  readonly enabled?: boolean | cdktf.IResolvable;
}

export function appSpecServiceImageDeployOnPushToTerraform(struct?: AppSpecServiceImageDeployOnPush | cdktf.IResolvable): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    enabled: cdktf.booleanToTerraform(struct!.enabled),
  }
}

export class AppSpecServiceImageDeployOnPushOutputReference extends cdktf.ComplexObject {
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

  public get internalValue(): AppSpecServiceImageDeployOnPush | cdktf.IResolvable | undefined {
    if (this.resolvableValue) {
      return this.resolvableValue;
    }
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._enabled !== undefined) {
      hasAnyValues = true;
      internalValueResult.enabled = this._enabled;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecServiceImageDeployOnPush | cdktf.IResolvable | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this.resolvableValue = undefined;
      this._enabled = undefined;
    }
    else if (cdktf.Tokenization.isResolvable(value)) {
      this.isEmptyObject = false;
      this.resolvableValue = value;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this.resolvableValue = undefined;
      this._enabled = value.enabled;
    }
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
}

export class AppSpecServiceImageDeployOnPushList extends cdktf.ComplexList {
  public internalValue? : AppSpecServiceImageDeployOnPush[] | cdktf.IResolvable

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
  public get(index: number): AppSpecServiceImageDeployOnPushOutputReference {
    return new AppSpecServiceImageDeployOnPushOutputReference(this.terraformResource, this.terraformAttribute, index, this.wrapsSet);
  }
}
export interface AppSpecServiceImage {
  /**
  * The registry name. Must be left empty for the DOCR registry type.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#registry App#registry}
  */
  readonly registry?: string;
  /**
  * The registry type.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#registry_type App#registry_type}
  */
  readonly registryType: string;
  /**
  * The repository name.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#repository App#repository}
  */
  readonly repository: string;
  /**
  * The repository tag. Defaults to latest if not provided.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#tag App#tag}
  */
  readonly tag?: string;
  /**
  * deploy_on_push block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#deploy_on_push App#deploy_on_push}
  */
  readonly deployOnPush?: AppSpecServiceImageDeployOnPush[] | cdktf.IResolvable;
}

export function appSpecServiceImageToTerraform(struct?: AppSpecServiceImageOutputReference | AppSpecServiceImage): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    registry: cdktf.stringToTerraform(struct!.registry),
    registry_type: cdktf.stringToTerraform(struct!.registryType),
    repository: cdktf.stringToTerraform(struct!.repository),
    tag: cdktf.stringToTerraform(struct!.tag),
    deploy_on_push: cdktf.listMapper(appSpecServiceImageDeployOnPushToTerraform, true)(struct!.deployOnPush),
  }
}

export class AppSpecServiceImageOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string) {
    super(terraformResource, terraformAttribute, false, 0);
  }

  public get internalValue(): AppSpecServiceImage | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._registry !== undefined) {
      hasAnyValues = true;
      internalValueResult.registry = this._registry;
    }
    if (this._registryType !== undefined) {
      hasAnyValues = true;
      internalValueResult.registryType = this._registryType;
    }
    if (this._repository !== undefined) {
      hasAnyValues = true;
      internalValueResult.repository = this._repository;
    }
    if (this._tag !== undefined) {
      hasAnyValues = true;
      internalValueResult.tag = this._tag;
    }
    if (this._deployOnPush?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.deployOnPush = this._deployOnPush?.internalValue;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecServiceImage | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this._registry = undefined;
      this._registryType = undefined;
      this._repository = undefined;
      this._tag = undefined;
      this._deployOnPush.internalValue = undefined;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this._registry = value.registry;
      this._registryType = value.registryType;
      this._repository = value.repository;
      this._tag = value.tag;
      this._deployOnPush.internalValue = value.deployOnPush;
    }
  }

  // registry - computed: false, optional: true, required: false
  private _registry?: string; 
  public get registry() {
    return this.getStringAttribute('registry');
  }
  public set registry(value: string) {
    this._registry = value;
  }
  public resetRegistry() {
    this._registry = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get registryInput() {
    return this._registry;
  }

  // registry_type - computed: false, optional: false, required: true
  private _registryType?: string; 
  public get registryType() {
    return this.getStringAttribute('registry_type');
  }
  public set registryType(value: string) {
    this._registryType = value;
  }
  // Temporarily expose input value. Use with caution.
  public get registryTypeInput() {
    return this._registryType;
  }

  // repository - computed: false, optional: false, required: true
  private _repository?: string; 
  public get repository() {
    return this.getStringAttribute('repository');
  }
  public set repository(value: string) {
    this._repository = value;
  }
  // Temporarily expose input value. Use with caution.
  public get repositoryInput() {
    return this._repository;
  }

  // tag - computed: false, optional: true, required: false
  private _tag?: string; 
  public get tag() {
    return this.getStringAttribute('tag');
  }
  public set tag(value: string) {
    this._tag = value;
  }
  public resetTag() {
    this._tag = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get tagInput() {
    return this._tag;
  }

  // deploy_on_push - computed: false, optional: true, required: false
  private _deployOnPush = new AppSpecServiceImageDeployOnPushList(this, "deploy_on_push", false);
  public get deployOnPush() {
    return this._deployOnPush;
  }
  public putDeployOnPush(value: AppSpecServiceImageDeployOnPush[] | cdktf.IResolvable) {
    this._deployOnPush.internalValue = value;
  }
  public resetDeployOnPush() {
    this._deployOnPush.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get deployOnPushInput() {
    return this._deployOnPush.internalValue;
  }
}
export interface AppSpecServiceLogDestinationDatadog {
  /**
  * Datadog API key.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#api_key App#api_key}
  */
  readonly apiKey: string;
  /**
  * Datadog HTTP log intake endpoint.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#endpoint App#endpoint}
  */
  readonly endpoint?: string;
}

export function appSpecServiceLogDestinationDatadogToTerraform(struct?: AppSpecServiceLogDestinationDatadogOutputReference | AppSpecServiceLogDestinationDatadog): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    api_key: cdktf.stringToTerraform(struct!.apiKey),
    endpoint: cdktf.stringToTerraform(struct!.endpoint),
  }
}

export class AppSpecServiceLogDestinationDatadogOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string) {
    super(terraformResource, terraformAttribute, false, 0);
  }

  public get internalValue(): AppSpecServiceLogDestinationDatadog | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._apiKey !== undefined) {
      hasAnyValues = true;
      internalValueResult.apiKey = this._apiKey;
    }
    if (this._endpoint !== undefined) {
      hasAnyValues = true;
      internalValueResult.endpoint = this._endpoint;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecServiceLogDestinationDatadog | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this._apiKey = undefined;
      this._endpoint = undefined;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this._apiKey = value.apiKey;
      this._endpoint = value.endpoint;
    }
  }

  // api_key - computed: false, optional: false, required: true
  private _apiKey?: string; 
  public get apiKey() {
    return this.getStringAttribute('api_key');
  }
  public set apiKey(value: string) {
    this._apiKey = value;
  }
  // Temporarily expose input value. Use with caution.
  public get apiKeyInput() {
    return this._apiKey;
  }

  // endpoint - computed: false, optional: true, required: false
  private _endpoint?: string; 
  public get endpoint() {
    return this.getStringAttribute('endpoint');
  }
  public set endpoint(value: string) {
    this._endpoint = value;
  }
  public resetEndpoint() {
    this._endpoint = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get endpointInput() {
    return this._endpoint;
  }
}
export interface AppSpecServiceLogDestinationLogtail {
  /**
  * Logtail token.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#token App#token}
  */
  readonly token: string;
}

export function appSpecServiceLogDestinationLogtailToTerraform(struct?: AppSpecServiceLogDestinationLogtailOutputReference | AppSpecServiceLogDestinationLogtail): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    token: cdktf.stringToTerraform(struct!.token),
  }
}

export class AppSpecServiceLogDestinationLogtailOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string) {
    super(terraformResource, terraformAttribute, false, 0);
  }

  public get internalValue(): AppSpecServiceLogDestinationLogtail | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._token !== undefined) {
      hasAnyValues = true;
      internalValueResult.token = this._token;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecServiceLogDestinationLogtail | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this._token = undefined;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this._token = value.token;
    }
  }

  // token - computed: false, optional: false, required: true
  private _token?: string; 
  public get token() {
    return this.getStringAttribute('token');
  }
  public set token(value: string) {
    this._token = value;
  }
  // Temporarily expose input value. Use with caution.
  public get tokenInput() {
    return this._token;
  }
}
export interface AppSpecServiceLogDestinationPapertrail {
  /**
  * Papertrail syslog endpoint.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#endpoint App#endpoint}
  */
  readonly endpoint: string;
}

export function appSpecServiceLogDestinationPapertrailToTerraform(struct?: AppSpecServiceLogDestinationPapertrailOutputReference | AppSpecServiceLogDestinationPapertrail): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    endpoint: cdktf.stringToTerraform(struct!.endpoint),
  }
}

export class AppSpecServiceLogDestinationPapertrailOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string) {
    super(terraformResource, terraformAttribute, false, 0);
  }

  public get internalValue(): AppSpecServiceLogDestinationPapertrail | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._endpoint !== undefined) {
      hasAnyValues = true;
      internalValueResult.endpoint = this._endpoint;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecServiceLogDestinationPapertrail | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this._endpoint = undefined;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this._endpoint = value.endpoint;
    }
  }

  // endpoint - computed: false, optional: false, required: true
  private _endpoint?: string; 
  public get endpoint() {
    return this.getStringAttribute('endpoint');
  }
  public set endpoint(value: string) {
    this._endpoint = value;
  }
  // Temporarily expose input value. Use with caution.
  public get endpointInput() {
    return this._endpoint;
  }
}
export interface AppSpecServiceLogDestination {
  /**
  * Name of the log destination
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#name App#name}
  */
  readonly name: string;
  /**
  * datadog block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#datadog App#datadog}
  */
  readonly datadog?: AppSpecServiceLogDestinationDatadog;
  /**
  * logtail block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#logtail App#logtail}
  */
  readonly logtail?: AppSpecServiceLogDestinationLogtail;
  /**
  * papertrail block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#papertrail App#papertrail}
  */
  readonly papertrail?: AppSpecServiceLogDestinationPapertrail;
}

export function appSpecServiceLogDestinationToTerraform(struct?: AppSpecServiceLogDestination | cdktf.IResolvable): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    name: cdktf.stringToTerraform(struct!.name),
    datadog: appSpecServiceLogDestinationDatadogToTerraform(struct!.datadog),
    logtail: appSpecServiceLogDestinationLogtailToTerraform(struct!.logtail),
    papertrail: appSpecServiceLogDestinationPapertrailToTerraform(struct!.papertrail),
  }
}

export class AppSpecServiceLogDestinationOutputReference extends cdktf.ComplexObject {
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

  public get internalValue(): AppSpecServiceLogDestination | cdktf.IResolvable | undefined {
    if (this.resolvableValue) {
      return this.resolvableValue;
    }
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._name !== undefined) {
      hasAnyValues = true;
      internalValueResult.name = this._name;
    }
    if (this._datadog?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.datadog = this._datadog?.internalValue;
    }
    if (this._logtail?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.logtail = this._logtail?.internalValue;
    }
    if (this._papertrail?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.papertrail = this._papertrail?.internalValue;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecServiceLogDestination | cdktf.IResolvable | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this.resolvableValue = undefined;
      this._name = undefined;
      this._datadog.internalValue = undefined;
      this._logtail.internalValue = undefined;
      this._papertrail.internalValue = undefined;
    }
    else if (cdktf.Tokenization.isResolvable(value)) {
      this.isEmptyObject = false;
      this.resolvableValue = value;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this.resolvableValue = undefined;
      this._name = value.name;
      this._datadog.internalValue = value.datadog;
      this._logtail.internalValue = value.logtail;
      this._papertrail.internalValue = value.papertrail;
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

  // datadog - computed: false, optional: true, required: false
  private _datadog = new AppSpecServiceLogDestinationDatadogOutputReference(this, "datadog");
  public get datadog() {
    return this._datadog;
  }
  public putDatadog(value: AppSpecServiceLogDestinationDatadog) {
    this._datadog.internalValue = value;
  }
  public resetDatadog() {
    this._datadog.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get datadogInput() {
    return this._datadog.internalValue;
  }

  // logtail - computed: false, optional: true, required: false
  private _logtail = new AppSpecServiceLogDestinationLogtailOutputReference(this, "logtail");
  public get logtail() {
    return this._logtail;
  }
  public putLogtail(value: AppSpecServiceLogDestinationLogtail) {
    this._logtail.internalValue = value;
  }
  public resetLogtail() {
    this._logtail.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get logtailInput() {
    return this._logtail.internalValue;
  }

  // papertrail - computed: false, optional: true, required: false
  private _papertrail = new AppSpecServiceLogDestinationPapertrailOutputReference(this, "papertrail");
  public get papertrail() {
    return this._papertrail;
  }
  public putPapertrail(value: AppSpecServiceLogDestinationPapertrail) {
    this._papertrail.internalValue = value;
  }
  public resetPapertrail() {
    this._papertrail.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get papertrailInput() {
    return this._papertrail.internalValue;
  }
}

export class AppSpecServiceLogDestinationList extends cdktf.ComplexList {
  public internalValue? : AppSpecServiceLogDestination[] | cdktf.IResolvable

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
  public get(index: number): AppSpecServiceLogDestinationOutputReference {
    return new AppSpecServiceLogDestinationOutputReference(this.terraformResource, this.terraformAttribute, index, this.wrapsSet);
  }
}
export interface AppSpecServiceRoutes {
  /**
  * Path specifies an route by HTTP path prefix. Paths must start with / and must be unique within the app.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#path App#path}
  */
  readonly path?: string;
  /**
  *  An optional flag to preserve the path that is forwarded to the backend service.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#preserve_path_prefix App#preserve_path_prefix}
  */
  readonly preservePathPrefix?: boolean | cdktf.IResolvable;
}

export function appSpecServiceRoutesToTerraform(struct?: AppSpecServiceRoutes | cdktf.IResolvable): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    path: cdktf.stringToTerraform(struct!.path),
    preserve_path_prefix: cdktf.booleanToTerraform(struct!.preservePathPrefix),
  }
}

export class AppSpecServiceRoutesOutputReference extends cdktf.ComplexObject {
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

  public get internalValue(): AppSpecServiceRoutes | cdktf.IResolvable | undefined {
    if (this.resolvableValue) {
      return this.resolvableValue;
    }
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._path !== undefined) {
      hasAnyValues = true;
      internalValueResult.path = this._path;
    }
    if (this._preservePathPrefix !== undefined) {
      hasAnyValues = true;
      internalValueResult.preservePathPrefix = this._preservePathPrefix;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecServiceRoutes | cdktf.IResolvable | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this.resolvableValue = undefined;
      this._path = undefined;
      this._preservePathPrefix = undefined;
    }
    else if (cdktf.Tokenization.isResolvable(value)) {
      this.isEmptyObject = false;
      this.resolvableValue = value;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this.resolvableValue = undefined;
      this._path = value.path;
      this._preservePathPrefix = value.preservePathPrefix;
    }
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

  // preserve_path_prefix - computed: false, optional: true, required: false
  private _preservePathPrefix?: boolean | cdktf.IResolvable; 
  public get preservePathPrefix() {
    return this.getBooleanAttribute('preserve_path_prefix');
  }
  public set preservePathPrefix(value: boolean | cdktf.IResolvable) {
    this._preservePathPrefix = value;
  }
  public resetPreservePathPrefix() {
    this._preservePathPrefix = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get preservePathPrefixInput() {
    return this._preservePathPrefix;
  }
}

export class AppSpecServiceRoutesList extends cdktf.ComplexList {
  public internalValue? : AppSpecServiceRoutes[] | cdktf.IResolvable

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
  public get(index: number): AppSpecServiceRoutesOutputReference {
    return new AppSpecServiceRoutesOutputReference(this.terraformResource, this.terraformAttribute, index, this.wrapsSet);
  }
}
export interface AppSpecService {
  /**
  * An optional build command to run while building this component from source.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#build_command App#build_command}
  */
  readonly buildCommand?: string;
  /**
  * The path to a Dockerfile relative to the root of the repo. If set, overrides usage of buildpacks.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#dockerfile_path App#dockerfile_path}
  */
  readonly dockerfilePath?: string;
  /**
  * An environment slug describing the type of this app.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#environment_slug App#environment_slug}
  */
  readonly environmentSlug?: string;
  /**
  * The internal port on which this service's run command will listen.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#http_port App#http_port}
  */
  readonly httpPort?: number;
  /**
  * The amount of instances that this component should be scaled to.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#instance_count App#instance_count}
  */
  readonly instanceCount?: number;
  /**
  * The instance size to use for this component.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#instance_size_slug App#instance_size_slug}
  */
  readonly instanceSizeSlug?: string;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#internal_ports App#internal_ports}
  */
  readonly internalPorts?: number[];
  /**
  * The name of the component
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#name App#name}
  */
  readonly name: string;
  /**
  * An optional run command to override the component's default.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#run_command App#run_command}
  */
  readonly runCommand?: string;
  /**
  * An optional path to the working directory to use for the build.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#source_dir App#source_dir}
  */
  readonly sourceDir?: string;
  /**
  * alert block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#alert App#alert}
  */
  readonly alert?: AppSpecServiceAlert[] | cdktf.IResolvable;
  /**
  * cors block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#cors App#cors}
  */
  readonly cors?: AppSpecServiceCors;
  /**
  * env block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#env App#env}
  */
  readonly env?: AppSpecServiceEnv[] | cdktf.IResolvable;
  /**
  * git block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#git App#git}
  */
  readonly git?: AppSpecServiceGit;
  /**
  * github block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#github App#github}
  */
  readonly github?: AppSpecServiceGithub;
  /**
  * gitlab block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#gitlab App#gitlab}
  */
  readonly gitlab?: AppSpecServiceGitlab;
  /**
  * health_check block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#health_check App#health_check}
  */
  readonly healthCheck?: AppSpecServiceHealthCheck;
  /**
  * image block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#image App#image}
  */
  readonly image?: AppSpecServiceImage;
  /**
  * log_destination block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#log_destination App#log_destination}
  */
  readonly logDestination?: AppSpecServiceLogDestination[] | cdktf.IResolvable;
  /**
  * routes block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#routes App#routes}
  */
  readonly routes?: AppSpecServiceRoutes[] | cdktf.IResolvable;
}

export function appSpecServiceToTerraform(struct?: AppSpecService | cdktf.IResolvable): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    build_command: cdktf.stringToTerraform(struct!.buildCommand),
    dockerfile_path: cdktf.stringToTerraform(struct!.dockerfilePath),
    environment_slug: cdktf.stringToTerraform(struct!.environmentSlug),
    http_port: cdktf.numberToTerraform(struct!.httpPort),
    instance_count: cdktf.numberToTerraform(struct!.instanceCount),
    instance_size_slug: cdktf.stringToTerraform(struct!.instanceSizeSlug),
    internal_ports: cdktf.listMapper(cdktf.numberToTerraform, false)(struct!.internalPorts),
    name: cdktf.stringToTerraform(struct!.name),
    run_command: cdktf.stringToTerraform(struct!.runCommand),
    source_dir: cdktf.stringToTerraform(struct!.sourceDir),
    alert: cdktf.listMapper(appSpecServiceAlertToTerraform, true)(struct!.alert),
    cors: appSpecServiceCorsToTerraform(struct!.cors),
    env: cdktf.listMapper(appSpecServiceEnvToTerraform, true)(struct!.env),
    git: appSpecServiceGitToTerraform(struct!.git),
    github: appSpecServiceGithubToTerraform(struct!.github),
    gitlab: appSpecServiceGitlabToTerraform(struct!.gitlab),
    health_check: appSpecServiceHealthCheckToTerraform(struct!.healthCheck),
    image: appSpecServiceImageToTerraform(struct!.image),
    log_destination: cdktf.listMapper(appSpecServiceLogDestinationToTerraform, true)(struct!.logDestination),
    routes: cdktf.listMapper(appSpecServiceRoutesToTerraform, true)(struct!.routes),
  }
}

export class AppSpecServiceOutputReference extends cdktf.ComplexObject {
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

  public get internalValue(): AppSpecService | cdktf.IResolvable | undefined {
    if (this.resolvableValue) {
      return this.resolvableValue;
    }
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._buildCommand !== undefined) {
      hasAnyValues = true;
      internalValueResult.buildCommand = this._buildCommand;
    }
    if (this._dockerfilePath !== undefined) {
      hasAnyValues = true;
      internalValueResult.dockerfilePath = this._dockerfilePath;
    }
    if (this._environmentSlug !== undefined) {
      hasAnyValues = true;
      internalValueResult.environmentSlug = this._environmentSlug;
    }
    if (this._httpPort !== undefined) {
      hasAnyValues = true;
      internalValueResult.httpPort = this._httpPort;
    }
    if (this._instanceCount !== undefined) {
      hasAnyValues = true;
      internalValueResult.instanceCount = this._instanceCount;
    }
    if (this._instanceSizeSlug !== undefined) {
      hasAnyValues = true;
      internalValueResult.instanceSizeSlug = this._instanceSizeSlug;
    }
    if (this._internalPorts !== undefined) {
      hasAnyValues = true;
      internalValueResult.internalPorts = this._internalPorts;
    }
    if (this._name !== undefined) {
      hasAnyValues = true;
      internalValueResult.name = this._name;
    }
    if (this._runCommand !== undefined) {
      hasAnyValues = true;
      internalValueResult.runCommand = this._runCommand;
    }
    if (this._sourceDir !== undefined) {
      hasAnyValues = true;
      internalValueResult.sourceDir = this._sourceDir;
    }
    if (this._alert?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.alert = this._alert?.internalValue;
    }
    if (this._cors?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.cors = this._cors?.internalValue;
    }
    if (this._env?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.env = this._env?.internalValue;
    }
    if (this._git?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.git = this._git?.internalValue;
    }
    if (this._github?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.github = this._github?.internalValue;
    }
    if (this._gitlab?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.gitlab = this._gitlab?.internalValue;
    }
    if (this._healthCheck?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.healthCheck = this._healthCheck?.internalValue;
    }
    if (this._image?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.image = this._image?.internalValue;
    }
    if (this._logDestination?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.logDestination = this._logDestination?.internalValue;
    }
    if (this._routes?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.routes = this._routes?.internalValue;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecService | cdktf.IResolvable | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this.resolvableValue = undefined;
      this._buildCommand = undefined;
      this._dockerfilePath = undefined;
      this._environmentSlug = undefined;
      this._httpPort = undefined;
      this._instanceCount = undefined;
      this._instanceSizeSlug = undefined;
      this._internalPorts = undefined;
      this._name = undefined;
      this._runCommand = undefined;
      this._sourceDir = undefined;
      this._alert.internalValue = undefined;
      this._cors.internalValue = undefined;
      this._env.internalValue = undefined;
      this._git.internalValue = undefined;
      this._github.internalValue = undefined;
      this._gitlab.internalValue = undefined;
      this._healthCheck.internalValue = undefined;
      this._image.internalValue = undefined;
      this._logDestination.internalValue = undefined;
      this._routes.internalValue = undefined;
    }
    else if (cdktf.Tokenization.isResolvable(value)) {
      this.isEmptyObject = false;
      this.resolvableValue = value;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this.resolvableValue = undefined;
      this._buildCommand = value.buildCommand;
      this._dockerfilePath = value.dockerfilePath;
      this._environmentSlug = value.environmentSlug;
      this._httpPort = value.httpPort;
      this._instanceCount = value.instanceCount;
      this._instanceSizeSlug = value.instanceSizeSlug;
      this._internalPorts = value.internalPorts;
      this._name = value.name;
      this._runCommand = value.runCommand;
      this._sourceDir = value.sourceDir;
      this._alert.internalValue = value.alert;
      this._cors.internalValue = value.cors;
      this._env.internalValue = value.env;
      this._git.internalValue = value.git;
      this._github.internalValue = value.github;
      this._gitlab.internalValue = value.gitlab;
      this._healthCheck.internalValue = value.healthCheck;
      this._image.internalValue = value.image;
      this._logDestination.internalValue = value.logDestination;
      this._routes.internalValue = value.routes;
    }
  }

  // build_command - computed: false, optional: true, required: false
  private _buildCommand?: string; 
  public get buildCommand() {
    return this.getStringAttribute('build_command');
  }
  public set buildCommand(value: string) {
    this._buildCommand = value;
  }
  public resetBuildCommand() {
    this._buildCommand = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get buildCommandInput() {
    return this._buildCommand;
  }

  // dockerfile_path - computed: false, optional: true, required: false
  private _dockerfilePath?: string; 
  public get dockerfilePath() {
    return this.getStringAttribute('dockerfile_path');
  }
  public set dockerfilePath(value: string) {
    this._dockerfilePath = value;
  }
  public resetDockerfilePath() {
    this._dockerfilePath = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get dockerfilePathInput() {
    return this._dockerfilePath;
  }

  // environment_slug - computed: false, optional: true, required: false
  private _environmentSlug?: string; 
  public get environmentSlug() {
    return this.getStringAttribute('environment_slug');
  }
  public set environmentSlug(value: string) {
    this._environmentSlug = value;
  }
  public resetEnvironmentSlug() {
    this._environmentSlug = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get environmentSlugInput() {
    return this._environmentSlug;
  }

  // http_port - computed: true, optional: true, required: false
  private _httpPort?: number; 
  public get httpPort() {
    return this.getNumberAttribute('http_port');
  }
  public set httpPort(value: number) {
    this._httpPort = value;
  }
  public resetHttpPort() {
    this._httpPort = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get httpPortInput() {
    return this._httpPort;
  }

  // instance_count - computed: false, optional: true, required: false
  private _instanceCount?: number; 
  public get instanceCount() {
    return this.getNumberAttribute('instance_count');
  }
  public set instanceCount(value: number) {
    this._instanceCount = value;
  }
  public resetInstanceCount() {
    this._instanceCount = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get instanceCountInput() {
    return this._instanceCount;
  }

  // instance_size_slug - computed: false, optional: true, required: false
  private _instanceSizeSlug?: string; 
  public get instanceSizeSlug() {
    return this.getStringAttribute('instance_size_slug');
  }
  public set instanceSizeSlug(value: string) {
    this._instanceSizeSlug = value;
  }
  public resetInstanceSizeSlug() {
    this._instanceSizeSlug = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get instanceSizeSlugInput() {
    return this._instanceSizeSlug;
  }

  // internal_ports - computed: false, optional: true, required: false
  private _internalPorts?: number[]; 
  public get internalPorts() {
    return cdktf.Token.asNumberList(cdktf.Fn.tolist(this.getNumberListAttribute('internal_ports')));
  }
  public set internalPorts(value: number[]) {
    this._internalPorts = value;
  }
  public resetInternalPorts() {
    this._internalPorts = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get internalPortsInput() {
    return this._internalPorts;
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

  // run_command - computed: true, optional: true, required: false
  private _runCommand?: string; 
  public get runCommand() {
    return this.getStringAttribute('run_command');
  }
  public set runCommand(value: string) {
    this._runCommand = value;
  }
  public resetRunCommand() {
    this._runCommand = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get runCommandInput() {
    return this._runCommand;
  }

  // source_dir - computed: false, optional: true, required: false
  private _sourceDir?: string; 
  public get sourceDir() {
    return this.getStringAttribute('source_dir');
  }
  public set sourceDir(value: string) {
    this._sourceDir = value;
  }
  public resetSourceDir() {
    this._sourceDir = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get sourceDirInput() {
    return this._sourceDir;
  }

  // alert - computed: false, optional: true, required: false
  private _alert = new AppSpecServiceAlertList(this, "alert", false);
  public get alert() {
    return this._alert;
  }
  public putAlert(value: AppSpecServiceAlert[] | cdktf.IResolvable) {
    this._alert.internalValue = value;
  }
  public resetAlert() {
    this._alert.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get alertInput() {
    return this._alert.internalValue;
  }

  // cors - computed: false, optional: true, required: false
  private _cors = new AppSpecServiceCorsOutputReference(this, "cors");
  public get cors() {
    return this._cors;
  }
  public putCors(value: AppSpecServiceCors) {
    this._cors.internalValue = value;
  }
  public resetCors() {
    this._cors.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get corsInput() {
    return this._cors.internalValue;
  }

  // env - computed: false, optional: true, required: false
  private _env = new AppSpecServiceEnvList(this, "env", true);
  public get env() {
    return this._env;
  }
  public putEnv(value: AppSpecServiceEnv[] | cdktf.IResolvable) {
    this._env.internalValue = value;
  }
  public resetEnv() {
    this._env.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get envInput() {
    return this._env.internalValue;
  }

  // git - computed: false, optional: true, required: false
  private _git = new AppSpecServiceGitOutputReference(this, "git");
  public get git() {
    return this._git;
  }
  public putGit(value: AppSpecServiceGit) {
    this._git.internalValue = value;
  }
  public resetGit() {
    this._git.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get gitInput() {
    return this._git.internalValue;
  }

  // github - computed: false, optional: true, required: false
  private _github = new AppSpecServiceGithubOutputReference(this, "github");
  public get github() {
    return this._github;
  }
  public putGithub(value: AppSpecServiceGithub) {
    this._github.internalValue = value;
  }
  public resetGithub() {
    this._github.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get githubInput() {
    return this._github.internalValue;
  }

  // gitlab - computed: false, optional: true, required: false
  private _gitlab = new AppSpecServiceGitlabOutputReference(this, "gitlab");
  public get gitlab() {
    return this._gitlab;
  }
  public putGitlab(value: AppSpecServiceGitlab) {
    this._gitlab.internalValue = value;
  }
  public resetGitlab() {
    this._gitlab.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get gitlabInput() {
    return this._gitlab.internalValue;
  }

  // health_check - computed: false, optional: true, required: false
  private _healthCheck = new AppSpecServiceHealthCheckOutputReference(this, "health_check");
  public get healthCheck() {
    return this._healthCheck;
  }
  public putHealthCheck(value: AppSpecServiceHealthCheck) {
    this._healthCheck.internalValue = value;
  }
  public resetHealthCheck() {
    this._healthCheck.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get healthCheckInput() {
    return this._healthCheck.internalValue;
  }

  // image - computed: false, optional: true, required: false
  private _image = new AppSpecServiceImageOutputReference(this, "image");
  public get image() {
    return this._image;
  }
  public putImage(value: AppSpecServiceImage) {
    this._image.internalValue = value;
  }
  public resetImage() {
    this._image.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get imageInput() {
    return this._image.internalValue;
  }

  // log_destination - computed: false, optional: true, required: false
  private _logDestination = new AppSpecServiceLogDestinationList(this, "log_destination", false);
  public get logDestination() {
    return this._logDestination;
  }
  public putLogDestination(value: AppSpecServiceLogDestination[] | cdktf.IResolvable) {
    this._logDestination.internalValue = value;
  }
  public resetLogDestination() {
    this._logDestination.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get logDestinationInput() {
    return this._logDestination.internalValue;
  }

  // routes - computed: false, optional: true, required: false
  private _routes = new AppSpecServiceRoutesList(this, "routes", false);
  public get routes() {
    return this._routes;
  }
  public putRoutes(value: AppSpecServiceRoutes[] | cdktf.IResolvable) {
    this._routes.internalValue = value;
  }
  public resetRoutes() {
    this._routes.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get routesInput() {
    return this._routes.internalValue;
  }
}

export class AppSpecServiceList extends cdktf.ComplexList {
  public internalValue? : AppSpecService[] | cdktf.IResolvable

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
  public get(index: number): AppSpecServiceOutputReference {
    return new AppSpecServiceOutputReference(this.terraformResource, this.terraformAttribute, index, this.wrapsSet);
  }
}
export interface AppSpecStaticSiteCorsAllowOrigins {
  /**
  * Exact string match.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#exact App#exact}
  */
  readonly exact?: string;
  /**
  * Prefix-based match. 
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#prefix App#prefix}
  */
  readonly prefix?: string;
  /**
  * RE2 style regex-based match.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#regex App#regex}
  */
  readonly regex?: string;
}

export function appSpecStaticSiteCorsAllowOriginsToTerraform(struct?: AppSpecStaticSiteCorsAllowOriginsOutputReference | AppSpecStaticSiteCorsAllowOrigins): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    exact: cdktf.stringToTerraform(struct!.exact),
    prefix: cdktf.stringToTerraform(struct!.prefix),
    regex: cdktf.stringToTerraform(struct!.regex),
  }
}

export class AppSpecStaticSiteCorsAllowOriginsOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string) {
    super(terraformResource, terraformAttribute, false, 0);
  }

  public get internalValue(): AppSpecStaticSiteCorsAllowOrigins | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._exact !== undefined) {
      hasAnyValues = true;
      internalValueResult.exact = this._exact;
    }
    if (this._prefix !== undefined) {
      hasAnyValues = true;
      internalValueResult.prefix = this._prefix;
    }
    if (this._regex !== undefined) {
      hasAnyValues = true;
      internalValueResult.regex = this._regex;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecStaticSiteCorsAllowOrigins | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this._exact = undefined;
      this._prefix = undefined;
      this._regex = undefined;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this._exact = value.exact;
      this._prefix = value.prefix;
      this._regex = value.regex;
    }
  }

  // exact - computed: false, optional: true, required: false
  private _exact?: string; 
  public get exact() {
    return this.getStringAttribute('exact');
  }
  public set exact(value: string) {
    this._exact = value;
  }
  public resetExact() {
    this._exact = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get exactInput() {
    return this._exact;
  }

  // prefix - computed: false, optional: true, required: false
  private _prefix?: string; 
  public get prefix() {
    return this.getStringAttribute('prefix');
  }
  public set prefix(value: string) {
    this._prefix = value;
  }
  public resetPrefix() {
    this._prefix = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get prefixInput() {
    return this._prefix;
  }

  // regex - computed: false, optional: true, required: false
  private _regex?: string; 
  public get regex() {
    return this.getStringAttribute('regex');
  }
  public set regex(value: string) {
    this._regex = value;
  }
  public resetRegex() {
    this._regex = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get regexInput() {
    return this._regex;
  }
}
export interface AppSpecStaticSiteCors {
  /**
  * Whether browsers should expose the response to the client-side JavaScript code when the request’s credentials mode is `include`. This configures the Access-Control-Allow-Credentials header.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#allow_credentials App#allow_credentials}
  */
  readonly allowCredentials?: boolean | cdktf.IResolvable;
  /**
  * The set of allowed HTTP request headers. This configures the Access-Control-Allow-Headers header.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#allow_headers App#allow_headers}
  */
  readonly allowHeaders?: string[];
  /**
  * The set of allowed HTTP methods. This configures the Access-Control-Allow-Methods header.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#allow_methods App#allow_methods}
  */
  readonly allowMethods?: string[];
  /**
  * The set of HTTP response headers that browsers are allowed to access. This configures the Access-Control-Expose-Headers header.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#expose_headers App#expose_headers}
  */
  readonly exposeHeaders?: string[];
  /**
  * An optional duration specifying how long browsers can cache the results of a preflight request. This configures the Access-Control-Max-Age header. Example: `5h30m`.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#max_age App#max_age}
  */
  readonly maxAge?: string;
  /**
  * allow_origins block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#allow_origins App#allow_origins}
  */
  readonly allowOrigins?: AppSpecStaticSiteCorsAllowOrigins;
}

export function appSpecStaticSiteCorsToTerraform(struct?: AppSpecStaticSiteCorsOutputReference | AppSpecStaticSiteCors): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    allow_credentials: cdktf.booleanToTerraform(struct!.allowCredentials),
    allow_headers: cdktf.listMapper(cdktf.stringToTerraform, false)(struct!.allowHeaders),
    allow_methods: cdktf.listMapper(cdktf.stringToTerraform, false)(struct!.allowMethods),
    expose_headers: cdktf.listMapper(cdktf.stringToTerraform, false)(struct!.exposeHeaders),
    max_age: cdktf.stringToTerraform(struct!.maxAge),
    allow_origins: appSpecStaticSiteCorsAllowOriginsToTerraform(struct!.allowOrigins),
  }
}

export class AppSpecStaticSiteCorsOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string) {
    super(terraformResource, terraformAttribute, false, 0);
  }

  public get internalValue(): AppSpecStaticSiteCors | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._allowCredentials !== undefined) {
      hasAnyValues = true;
      internalValueResult.allowCredentials = this._allowCredentials;
    }
    if (this._allowHeaders !== undefined) {
      hasAnyValues = true;
      internalValueResult.allowHeaders = this._allowHeaders;
    }
    if (this._allowMethods !== undefined) {
      hasAnyValues = true;
      internalValueResult.allowMethods = this._allowMethods;
    }
    if (this._exposeHeaders !== undefined) {
      hasAnyValues = true;
      internalValueResult.exposeHeaders = this._exposeHeaders;
    }
    if (this._maxAge !== undefined) {
      hasAnyValues = true;
      internalValueResult.maxAge = this._maxAge;
    }
    if (this._allowOrigins?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.allowOrigins = this._allowOrigins?.internalValue;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecStaticSiteCors | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this._allowCredentials = undefined;
      this._allowHeaders = undefined;
      this._allowMethods = undefined;
      this._exposeHeaders = undefined;
      this._maxAge = undefined;
      this._allowOrigins.internalValue = undefined;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this._allowCredentials = value.allowCredentials;
      this._allowHeaders = value.allowHeaders;
      this._allowMethods = value.allowMethods;
      this._exposeHeaders = value.exposeHeaders;
      this._maxAge = value.maxAge;
      this._allowOrigins.internalValue = value.allowOrigins;
    }
  }

  // allow_credentials - computed: false, optional: true, required: false
  private _allowCredentials?: boolean | cdktf.IResolvable; 
  public get allowCredentials() {
    return this.getBooleanAttribute('allow_credentials');
  }
  public set allowCredentials(value: boolean | cdktf.IResolvable) {
    this._allowCredentials = value;
  }
  public resetAllowCredentials() {
    this._allowCredentials = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get allowCredentialsInput() {
    return this._allowCredentials;
  }

  // allow_headers - computed: false, optional: true, required: false
  private _allowHeaders?: string[]; 
  public get allowHeaders() {
    return cdktf.Fn.tolist(this.getListAttribute('allow_headers'));
  }
  public set allowHeaders(value: string[]) {
    this._allowHeaders = value;
  }
  public resetAllowHeaders() {
    this._allowHeaders = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get allowHeadersInput() {
    return this._allowHeaders;
  }

  // allow_methods - computed: false, optional: true, required: false
  private _allowMethods?: string[]; 
  public get allowMethods() {
    return cdktf.Fn.tolist(this.getListAttribute('allow_methods'));
  }
  public set allowMethods(value: string[]) {
    this._allowMethods = value;
  }
  public resetAllowMethods() {
    this._allowMethods = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get allowMethodsInput() {
    return this._allowMethods;
  }

  // expose_headers - computed: false, optional: true, required: false
  private _exposeHeaders?: string[]; 
  public get exposeHeaders() {
    return cdktf.Fn.tolist(this.getListAttribute('expose_headers'));
  }
  public set exposeHeaders(value: string[]) {
    this._exposeHeaders = value;
  }
  public resetExposeHeaders() {
    this._exposeHeaders = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get exposeHeadersInput() {
    return this._exposeHeaders;
  }

  // max_age - computed: false, optional: true, required: false
  private _maxAge?: string; 
  public get maxAge() {
    return this.getStringAttribute('max_age');
  }
  public set maxAge(value: string) {
    this._maxAge = value;
  }
  public resetMaxAge() {
    this._maxAge = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get maxAgeInput() {
    return this._maxAge;
  }

  // allow_origins - computed: false, optional: true, required: false
  private _allowOrigins = new AppSpecStaticSiteCorsAllowOriginsOutputReference(this, "allow_origins");
  public get allowOrigins() {
    return this._allowOrigins;
  }
  public putAllowOrigins(value: AppSpecStaticSiteCorsAllowOrigins) {
    this._allowOrigins.internalValue = value;
  }
  public resetAllowOrigins() {
    this._allowOrigins.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get allowOriginsInput() {
    return this._allowOrigins.internalValue;
  }
}
export interface AppSpecStaticSiteEnv {
  /**
  * The name of the environment variable.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#key App#key}
  */
  readonly key?: string;
  /**
  * The visibility scope of the environment variable.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#scope App#scope}
  */
  readonly scope?: string;
  /**
  * The type of the environment variable.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#type App#type}
  */
  readonly type?: string;
  /**
  * The value of the environment variable.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#value App#value}
  */
  readonly value?: string;
}

export function appSpecStaticSiteEnvToTerraform(struct?: AppSpecStaticSiteEnv | cdktf.IResolvable): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    key: cdktf.stringToTerraform(struct!.key),
    scope: cdktf.stringToTerraform(struct!.scope),
    type: cdktf.stringToTerraform(struct!.type),
    value: cdktf.stringToTerraform(struct!.value),
  }
}

export class AppSpecStaticSiteEnvOutputReference extends cdktf.ComplexObject {
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

  public get internalValue(): AppSpecStaticSiteEnv | cdktf.IResolvable | undefined {
    if (this.resolvableValue) {
      return this.resolvableValue;
    }
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._key !== undefined) {
      hasAnyValues = true;
      internalValueResult.key = this._key;
    }
    if (this._scope !== undefined) {
      hasAnyValues = true;
      internalValueResult.scope = this._scope;
    }
    if (this._type !== undefined) {
      hasAnyValues = true;
      internalValueResult.type = this._type;
    }
    if (this._value !== undefined) {
      hasAnyValues = true;
      internalValueResult.value = this._value;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecStaticSiteEnv | cdktf.IResolvable | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this.resolvableValue = undefined;
      this._key = undefined;
      this._scope = undefined;
      this._type = undefined;
      this._value = undefined;
    }
    else if (cdktf.Tokenization.isResolvable(value)) {
      this.isEmptyObject = false;
      this.resolvableValue = value;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this.resolvableValue = undefined;
      this._key = value.key;
      this._scope = value.scope;
      this._type = value.type;
      this._value = value.value;
    }
  }

  // key - computed: false, optional: true, required: false
  private _key?: string; 
  public get key() {
    return this.getStringAttribute('key');
  }
  public set key(value: string) {
    this._key = value;
  }
  public resetKey() {
    this._key = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get keyInput() {
    return this._key;
  }

  // scope - computed: false, optional: true, required: false
  private _scope?: string; 
  public get scope() {
    return this.getStringAttribute('scope');
  }
  public set scope(value: string) {
    this._scope = value;
  }
  public resetScope() {
    this._scope = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get scopeInput() {
    return this._scope;
  }

  // type - computed: true, optional: true, required: false
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

  // value - computed: false, optional: true, required: false
  private _value?: string; 
  public get value() {
    return this.getStringAttribute('value');
  }
  public set value(value: string) {
    this._value = value;
  }
  public resetValue() {
    this._value = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get valueInput() {
    return this._value;
  }
}

export class AppSpecStaticSiteEnvList extends cdktf.ComplexList {
  public internalValue? : AppSpecStaticSiteEnv[] | cdktf.IResolvable

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
  public get(index: number): AppSpecStaticSiteEnvOutputReference {
    return new AppSpecStaticSiteEnvOutputReference(this.terraformResource, this.terraformAttribute, index, this.wrapsSet);
  }
}
export interface AppSpecStaticSiteGit {
  /**
  * The name of the branch to use.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#branch App#branch}
  */
  readonly branch?: string;
  /**
  * The clone URL of the repo.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#repo_clone_url App#repo_clone_url}
  */
  readonly repoCloneUrl?: string;
}

export function appSpecStaticSiteGitToTerraform(struct?: AppSpecStaticSiteGitOutputReference | AppSpecStaticSiteGit): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    branch: cdktf.stringToTerraform(struct!.branch),
    repo_clone_url: cdktf.stringToTerraform(struct!.repoCloneUrl),
  }
}

export class AppSpecStaticSiteGitOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string) {
    super(terraformResource, terraformAttribute, false, 0);
  }

  public get internalValue(): AppSpecStaticSiteGit | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._branch !== undefined) {
      hasAnyValues = true;
      internalValueResult.branch = this._branch;
    }
    if (this._repoCloneUrl !== undefined) {
      hasAnyValues = true;
      internalValueResult.repoCloneUrl = this._repoCloneUrl;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecStaticSiteGit | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this._branch = undefined;
      this._repoCloneUrl = undefined;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this._branch = value.branch;
      this._repoCloneUrl = value.repoCloneUrl;
    }
  }

  // branch - computed: false, optional: true, required: false
  private _branch?: string; 
  public get branch() {
    return this.getStringAttribute('branch');
  }
  public set branch(value: string) {
    this._branch = value;
  }
  public resetBranch() {
    this._branch = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get branchInput() {
    return this._branch;
  }

  // repo_clone_url - computed: false, optional: true, required: false
  private _repoCloneUrl?: string; 
  public get repoCloneUrl() {
    return this.getStringAttribute('repo_clone_url');
  }
  public set repoCloneUrl(value: string) {
    this._repoCloneUrl = value;
  }
  public resetRepoCloneUrl() {
    this._repoCloneUrl = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get repoCloneUrlInput() {
    return this._repoCloneUrl;
  }
}
export interface AppSpecStaticSiteGithub {
  /**
  * The name of the branch to use.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#branch App#branch}
  */
  readonly branch?: string;
  /**
  * Whether to automatically deploy new commits made to the repo
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#deploy_on_push App#deploy_on_push}
  */
  readonly deployOnPush?: boolean | cdktf.IResolvable;
  /**
  * The name of the repo in the format `owner/repo`.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#repo App#repo}
  */
  readonly repo?: string;
}

export function appSpecStaticSiteGithubToTerraform(struct?: AppSpecStaticSiteGithubOutputReference | AppSpecStaticSiteGithub): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    branch: cdktf.stringToTerraform(struct!.branch),
    deploy_on_push: cdktf.booleanToTerraform(struct!.deployOnPush),
    repo: cdktf.stringToTerraform(struct!.repo),
  }
}

export class AppSpecStaticSiteGithubOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string) {
    super(terraformResource, terraformAttribute, false, 0);
  }

  public get internalValue(): AppSpecStaticSiteGithub | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._branch !== undefined) {
      hasAnyValues = true;
      internalValueResult.branch = this._branch;
    }
    if (this._deployOnPush !== undefined) {
      hasAnyValues = true;
      internalValueResult.deployOnPush = this._deployOnPush;
    }
    if (this._repo !== undefined) {
      hasAnyValues = true;
      internalValueResult.repo = this._repo;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecStaticSiteGithub | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this._branch = undefined;
      this._deployOnPush = undefined;
      this._repo = undefined;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this._branch = value.branch;
      this._deployOnPush = value.deployOnPush;
      this._repo = value.repo;
    }
  }

  // branch - computed: false, optional: true, required: false
  private _branch?: string; 
  public get branch() {
    return this.getStringAttribute('branch');
  }
  public set branch(value: string) {
    this._branch = value;
  }
  public resetBranch() {
    this._branch = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get branchInput() {
    return this._branch;
  }

  // deploy_on_push - computed: false, optional: true, required: false
  private _deployOnPush?: boolean | cdktf.IResolvable; 
  public get deployOnPush() {
    return this.getBooleanAttribute('deploy_on_push');
  }
  public set deployOnPush(value: boolean | cdktf.IResolvable) {
    this._deployOnPush = value;
  }
  public resetDeployOnPush() {
    this._deployOnPush = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get deployOnPushInput() {
    return this._deployOnPush;
  }

  // repo - computed: false, optional: true, required: false
  private _repo?: string; 
  public get repo() {
    return this.getStringAttribute('repo');
  }
  public set repo(value: string) {
    this._repo = value;
  }
  public resetRepo() {
    this._repo = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get repoInput() {
    return this._repo;
  }
}
export interface AppSpecStaticSiteGitlab {
  /**
  * The name of the branch to use.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#branch App#branch}
  */
  readonly branch?: string;
  /**
  * Whether to automatically deploy new commits made to the repo
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#deploy_on_push App#deploy_on_push}
  */
  readonly deployOnPush?: boolean | cdktf.IResolvable;
  /**
  * The name of the repo in the format `owner/repo`.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#repo App#repo}
  */
  readonly repo?: string;
}

export function appSpecStaticSiteGitlabToTerraform(struct?: AppSpecStaticSiteGitlabOutputReference | AppSpecStaticSiteGitlab): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    branch: cdktf.stringToTerraform(struct!.branch),
    deploy_on_push: cdktf.booleanToTerraform(struct!.deployOnPush),
    repo: cdktf.stringToTerraform(struct!.repo),
  }
}

export class AppSpecStaticSiteGitlabOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string) {
    super(terraformResource, terraformAttribute, false, 0);
  }

  public get internalValue(): AppSpecStaticSiteGitlab | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._branch !== undefined) {
      hasAnyValues = true;
      internalValueResult.branch = this._branch;
    }
    if (this._deployOnPush !== undefined) {
      hasAnyValues = true;
      internalValueResult.deployOnPush = this._deployOnPush;
    }
    if (this._repo !== undefined) {
      hasAnyValues = true;
      internalValueResult.repo = this._repo;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecStaticSiteGitlab | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this._branch = undefined;
      this._deployOnPush = undefined;
      this._repo = undefined;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this._branch = value.branch;
      this._deployOnPush = value.deployOnPush;
      this._repo = value.repo;
    }
  }

  // branch - computed: false, optional: true, required: false
  private _branch?: string; 
  public get branch() {
    return this.getStringAttribute('branch');
  }
  public set branch(value: string) {
    this._branch = value;
  }
  public resetBranch() {
    this._branch = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get branchInput() {
    return this._branch;
  }

  // deploy_on_push - computed: false, optional: true, required: false
  private _deployOnPush?: boolean | cdktf.IResolvable; 
  public get deployOnPush() {
    return this.getBooleanAttribute('deploy_on_push');
  }
  public set deployOnPush(value: boolean | cdktf.IResolvable) {
    this._deployOnPush = value;
  }
  public resetDeployOnPush() {
    this._deployOnPush = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get deployOnPushInput() {
    return this._deployOnPush;
  }

  // repo - computed: false, optional: true, required: false
  private _repo?: string; 
  public get repo() {
    return this.getStringAttribute('repo');
  }
  public set repo(value: string) {
    this._repo = value;
  }
  public resetRepo() {
    this._repo = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get repoInput() {
    return this._repo;
  }
}
export interface AppSpecStaticSiteRoutes {
  /**
  * Path specifies an route by HTTP path prefix. Paths must start with / and must be unique within the app.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#path App#path}
  */
  readonly path?: string;
  /**
  *  An optional flag to preserve the path that is forwarded to the backend service.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#preserve_path_prefix App#preserve_path_prefix}
  */
  readonly preservePathPrefix?: boolean | cdktf.IResolvable;
}

export function appSpecStaticSiteRoutesToTerraform(struct?: AppSpecStaticSiteRoutes | cdktf.IResolvable): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    path: cdktf.stringToTerraform(struct!.path),
    preserve_path_prefix: cdktf.booleanToTerraform(struct!.preservePathPrefix),
  }
}

export class AppSpecStaticSiteRoutesOutputReference extends cdktf.ComplexObject {
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

  public get internalValue(): AppSpecStaticSiteRoutes | cdktf.IResolvable | undefined {
    if (this.resolvableValue) {
      return this.resolvableValue;
    }
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._path !== undefined) {
      hasAnyValues = true;
      internalValueResult.path = this._path;
    }
    if (this._preservePathPrefix !== undefined) {
      hasAnyValues = true;
      internalValueResult.preservePathPrefix = this._preservePathPrefix;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecStaticSiteRoutes | cdktf.IResolvable | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this.resolvableValue = undefined;
      this._path = undefined;
      this._preservePathPrefix = undefined;
    }
    else if (cdktf.Tokenization.isResolvable(value)) {
      this.isEmptyObject = false;
      this.resolvableValue = value;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this.resolvableValue = undefined;
      this._path = value.path;
      this._preservePathPrefix = value.preservePathPrefix;
    }
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

  // preserve_path_prefix - computed: false, optional: true, required: false
  private _preservePathPrefix?: boolean | cdktf.IResolvable; 
  public get preservePathPrefix() {
    return this.getBooleanAttribute('preserve_path_prefix');
  }
  public set preservePathPrefix(value: boolean | cdktf.IResolvable) {
    this._preservePathPrefix = value;
  }
  public resetPreservePathPrefix() {
    this._preservePathPrefix = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get preservePathPrefixInput() {
    return this._preservePathPrefix;
  }
}

export class AppSpecStaticSiteRoutesList extends cdktf.ComplexList {
  public internalValue? : AppSpecStaticSiteRoutes[] | cdktf.IResolvable

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
  public get(index: number): AppSpecStaticSiteRoutesOutputReference {
    return new AppSpecStaticSiteRoutesOutputReference(this.terraformResource, this.terraformAttribute, index, this.wrapsSet);
  }
}
export interface AppSpecStaticSite {
  /**
  * An optional build command to run while building this component from source.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#build_command App#build_command}
  */
  readonly buildCommand?: string;
  /**
  * The name of the document to use as the fallback for any requests to documents that are not found when serving this static site.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#catchall_document App#catchall_document}
  */
  readonly catchallDocument?: string;
  /**
  * The path to a Dockerfile relative to the root of the repo. If set, overrides usage of buildpacks.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#dockerfile_path App#dockerfile_path}
  */
  readonly dockerfilePath?: string;
  /**
  * An environment slug describing the type of this app.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#environment_slug App#environment_slug}
  */
  readonly environmentSlug?: string;
  /**
  * The name of the error document to use when serving this static site.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#error_document App#error_document}
  */
  readonly errorDocument?: string;
  /**
  * The name of the index document to use when serving this static site.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#index_document App#index_document}
  */
  readonly indexDocument?: string;
  /**
  * The name of the component
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#name App#name}
  */
  readonly name: string;
  /**
  * An optional path to where the built assets will be located, relative to the build context. If not set, App Platform will automatically scan for these directory names: `_static`, `dist`, `public`.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#output_dir App#output_dir}
  */
  readonly outputDir?: string;
  /**
  * An optional path to the working directory to use for the build.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#source_dir App#source_dir}
  */
  readonly sourceDir?: string;
  /**
  * cors block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#cors App#cors}
  */
  readonly cors?: AppSpecStaticSiteCors;
  /**
  * env block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#env App#env}
  */
  readonly env?: AppSpecStaticSiteEnv[] | cdktf.IResolvable;
  /**
  * git block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#git App#git}
  */
  readonly git?: AppSpecStaticSiteGit;
  /**
  * github block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#github App#github}
  */
  readonly github?: AppSpecStaticSiteGithub;
  /**
  * gitlab block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#gitlab App#gitlab}
  */
  readonly gitlab?: AppSpecStaticSiteGitlab;
  /**
  * routes block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#routes App#routes}
  */
  readonly routes?: AppSpecStaticSiteRoutes[] | cdktf.IResolvable;
}

export function appSpecStaticSiteToTerraform(struct?: AppSpecStaticSite | cdktf.IResolvable): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    build_command: cdktf.stringToTerraform(struct!.buildCommand),
    catchall_document: cdktf.stringToTerraform(struct!.catchallDocument),
    dockerfile_path: cdktf.stringToTerraform(struct!.dockerfilePath),
    environment_slug: cdktf.stringToTerraform(struct!.environmentSlug),
    error_document: cdktf.stringToTerraform(struct!.errorDocument),
    index_document: cdktf.stringToTerraform(struct!.indexDocument),
    name: cdktf.stringToTerraform(struct!.name),
    output_dir: cdktf.stringToTerraform(struct!.outputDir),
    source_dir: cdktf.stringToTerraform(struct!.sourceDir),
    cors: appSpecStaticSiteCorsToTerraform(struct!.cors),
    env: cdktf.listMapper(appSpecStaticSiteEnvToTerraform, true)(struct!.env),
    git: appSpecStaticSiteGitToTerraform(struct!.git),
    github: appSpecStaticSiteGithubToTerraform(struct!.github),
    gitlab: appSpecStaticSiteGitlabToTerraform(struct!.gitlab),
    routes: cdktf.listMapper(appSpecStaticSiteRoutesToTerraform, true)(struct!.routes),
  }
}

export class AppSpecStaticSiteOutputReference extends cdktf.ComplexObject {
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

  public get internalValue(): AppSpecStaticSite | cdktf.IResolvable | undefined {
    if (this.resolvableValue) {
      return this.resolvableValue;
    }
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._buildCommand !== undefined) {
      hasAnyValues = true;
      internalValueResult.buildCommand = this._buildCommand;
    }
    if (this._catchallDocument !== undefined) {
      hasAnyValues = true;
      internalValueResult.catchallDocument = this._catchallDocument;
    }
    if (this._dockerfilePath !== undefined) {
      hasAnyValues = true;
      internalValueResult.dockerfilePath = this._dockerfilePath;
    }
    if (this._environmentSlug !== undefined) {
      hasAnyValues = true;
      internalValueResult.environmentSlug = this._environmentSlug;
    }
    if (this._errorDocument !== undefined) {
      hasAnyValues = true;
      internalValueResult.errorDocument = this._errorDocument;
    }
    if (this._indexDocument !== undefined) {
      hasAnyValues = true;
      internalValueResult.indexDocument = this._indexDocument;
    }
    if (this._name !== undefined) {
      hasAnyValues = true;
      internalValueResult.name = this._name;
    }
    if (this._outputDir !== undefined) {
      hasAnyValues = true;
      internalValueResult.outputDir = this._outputDir;
    }
    if (this._sourceDir !== undefined) {
      hasAnyValues = true;
      internalValueResult.sourceDir = this._sourceDir;
    }
    if (this._cors?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.cors = this._cors?.internalValue;
    }
    if (this._env?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.env = this._env?.internalValue;
    }
    if (this._git?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.git = this._git?.internalValue;
    }
    if (this._github?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.github = this._github?.internalValue;
    }
    if (this._gitlab?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.gitlab = this._gitlab?.internalValue;
    }
    if (this._routes?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.routes = this._routes?.internalValue;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecStaticSite | cdktf.IResolvable | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this.resolvableValue = undefined;
      this._buildCommand = undefined;
      this._catchallDocument = undefined;
      this._dockerfilePath = undefined;
      this._environmentSlug = undefined;
      this._errorDocument = undefined;
      this._indexDocument = undefined;
      this._name = undefined;
      this._outputDir = undefined;
      this._sourceDir = undefined;
      this._cors.internalValue = undefined;
      this._env.internalValue = undefined;
      this._git.internalValue = undefined;
      this._github.internalValue = undefined;
      this._gitlab.internalValue = undefined;
      this._routes.internalValue = undefined;
    }
    else if (cdktf.Tokenization.isResolvable(value)) {
      this.isEmptyObject = false;
      this.resolvableValue = value;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this.resolvableValue = undefined;
      this._buildCommand = value.buildCommand;
      this._catchallDocument = value.catchallDocument;
      this._dockerfilePath = value.dockerfilePath;
      this._environmentSlug = value.environmentSlug;
      this._errorDocument = value.errorDocument;
      this._indexDocument = value.indexDocument;
      this._name = value.name;
      this._outputDir = value.outputDir;
      this._sourceDir = value.sourceDir;
      this._cors.internalValue = value.cors;
      this._env.internalValue = value.env;
      this._git.internalValue = value.git;
      this._github.internalValue = value.github;
      this._gitlab.internalValue = value.gitlab;
      this._routes.internalValue = value.routes;
    }
  }

  // build_command - computed: false, optional: true, required: false
  private _buildCommand?: string; 
  public get buildCommand() {
    return this.getStringAttribute('build_command');
  }
  public set buildCommand(value: string) {
    this._buildCommand = value;
  }
  public resetBuildCommand() {
    this._buildCommand = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get buildCommandInput() {
    return this._buildCommand;
  }

  // catchall_document - computed: false, optional: true, required: false
  private _catchallDocument?: string; 
  public get catchallDocument() {
    return this.getStringAttribute('catchall_document');
  }
  public set catchallDocument(value: string) {
    this._catchallDocument = value;
  }
  public resetCatchallDocument() {
    this._catchallDocument = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get catchallDocumentInput() {
    return this._catchallDocument;
  }

  // dockerfile_path - computed: false, optional: true, required: false
  private _dockerfilePath?: string; 
  public get dockerfilePath() {
    return this.getStringAttribute('dockerfile_path');
  }
  public set dockerfilePath(value: string) {
    this._dockerfilePath = value;
  }
  public resetDockerfilePath() {
    this._dockerfilePath = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get dockerfilePathInput() {
    return this._dockerfilePath;
  }

  // environment_slug - computed: false, optional: true, required: false
  private _environmentSlug?: string; 
  public get environmentSlug() {
    return this.getStringAttribute('environment_slug');
  }
  public set environmentSlug(value: string) {
    this._environmentSlug = value;
  }
  public resetEnvironmentSlug() {
    this._environmentSlug = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get environmentSlugInput() {
    return this._environmentSlug;
  }

  // error_document - computed: false, optional: true, required: false
  private _errorDocument?: string; 
  public get errorDocument() {
    return this.getStringAttribute('error_document');
  }
  public set errorDocument(value: string) {
    this._errorDocument = value;
  }
  public resetErrorDocument() {
    this._errorDocument = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get errorDocumentInput() {
    return this._errorDocument;
  }

  // index_document - computed: false, optional: true, required: false
  private _indexDocument?: string; 
  public get indexDocument() {
    return this.getStringAttribute('index_document');
  }
  public set indexDocument(value: string) {
    this._indexDocument = value;
  }
  public resetIndexDocument() {
    this._indexDocument = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get indexDocumentInput() {
    return this._indexDocument;
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

  // output_dir - computed: false, optional: true, required: false
  private _outputDir?: string; 
  public get outputDir() {
    return this.getStringAttribute('output_dir');
  }
  public set outputDir(value: string) {
    this._outputDir = value;
  }
  public resetOutputDir() {
    this._outputDir = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get outputDirInput() {
    return this._outputDir;
  }

  // source_dir - computed: false, optional: true, required: false
  private _sourceDir?: string; 
  public get sourceDir() {
    return this.getStringAttribute('source_dir');
  }
  public set sourceDir(value: string) {
    this._sourceDir = value;
  }
  public resetSourceDir() {
    this._sourceDir = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get sourceDirInput() {
    return this._sourceDir;
  }

  // cors - computed: false, optional: true, required: false
  private _cors = new AppSpecStaticSiteCorsOutputReference(this, "cors");
  public get cors() {
    return this._cors;
  }
  public putCors(value: AppSpecStaticSiteCors) {
    this._cors.internalValue = value;
  }
  public resetCors() {
    this._cors.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get corsInput() {
    return this._cors.internalValue;
  }

  // env - computed: false, optional: true, required: false
  private _env = new AppSpecStaticSiteEnvList(this, "env", true);
  public get env() {
    return this._env;
  }
  public putEnv(value: AppSpecStaticSiteEnv[] | cdktf.IResolvable) {
    this._env.internalValue = value;
  }
  public resetEnv() {
    this._env.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get envInput() {
    return this._env.internalValue;
  }

  // git - computed: false, optional: true, required: false
  private _git = new AppSpecStaticSiteGitOutputReference(this, "git");
  public get git() {
    return this._git;
  }
  public putGit(value: AppSpecStaticSiteGit) {
    this._git.internalValue = value;
  }
  public resetGit() {
    this._git.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get gitInput() {
    return this._git.internalValue;
  }

  // github - computed: false, optional: true, required: false
  private _github = new AppSpecStaticSiteGithubOutputReference(this, "github");
  public get github() {
    return this._github;
  }
  public putGithub(value: AppSpecStaticSiteGithub) {
    this._github.internalValue = value;
  }
  public resetGithub() {
    this._github.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get githubInput() {
    return this._github.internalValue;
  }

  // gitlab - computed: false, optional: true, required: false
  private _gitlab = new AppSpecStaticSiteGitlabOutputReference(this, "gitlab");
  public get gitlab() {
    return this._gitlab;
  }
  public putGitlab(value: AppSpecStaticSiteGitlab) {
    this._gitlab.internalValue = value;
  }
  public resetGitlab() {
    this._gitlab.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get gitlabInput() {
    return this._gitlab.internalValue;
  }

  // routes - computed: false, optional: true, required: false
  private _routes = new AppSpecStaticSiteRoutesList(this, "routes", false);
  public get routes() {
    return this._routes;
  }
  public putRoutes(value: AppSpecStaticSiteRoutes[] | cdktf.IResolvable) {
    this._routes.internalValue = value;
  }
  public resetRoutes() {
    this._routes.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get routesInput() {
    return this._routes.internalValue;
  }
}

export class AppSpecStaticSiteList extends cdktf.ComplexList {
  public internalValue? : AppSpecStaticSite[] | cdktf.IResolvable

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
  public get(index: number): AppSpecStaticSiteOutputReference {
    return new AppSpecStaticSiteOutputReference(this.terraformResource, this.terraformAttribute, index, this.wrapsSet);
  }
}
export interface AppSpecWorkerAlert {
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#disabled App#disabled}
  */
  readonly disabled?: boolean | cdktf.IResolvable;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#operator App#operator}
  */
  readonly operator: string;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#rule App#rule}
  */
  readonly rule: string;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#value App#value}
  */
  readonly value: number;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#window App#window}
  */
  readonly window: string;
}

export function appSpecWorkerAlertToTerraform(struct?: AppSpecWorkerAlert | cdktf.IResolvable): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    disabled: cdktf.booleanToTerraform(struct!.disabled),
    operator: cdktf.stringToTerraform(struct!.operator),
    rule: cdktf.stringToTerraform(struct!.rule),
    value: cdktf.numberToTerraform(struct!.value),
    window: cdktf.stringToTerraform(struct!.window),
  }
}

export class AppSpecWorkerAlertOutputReference extends cdktf.ComplexObject {
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

  public get internalValue(): AppSpecWorkerAlert | cdktf.IResolvable | undefined {
    if (this.resolvableValue) {
      return this.resolvableValue;
    }
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._disabled !== undefined) {
      hasAnyValues = true;
      internalValueResult.disabled = this._disabled;
    }
    if (this._operator !== undefined) {
      hasAnyValues = true;
      internalValueResult.operator = this._operator;
    }
    if (this._rule !== undefined) {
      hasAnyValues = true;
      internalValueResult.rule = this._rule;
    }
    if (this._value !== undefined) {
      hasAnyValues = true;
      internalValueResult.value = this._value;
    }
    if (this._window !== undefined) {
      hasAnyValues = true;
      internalValueResult.window = this._window;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecWorkerAlert | cdktf.IResolvable | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this.resolvableValue = undefined;
      this._disabled = undefined;
      this._operator = undefined;
      this._rule = undefined;
      this._value = undefined;
      this._window = undefined;
    }
    else if (cdktf.Tokenization.isResolvable(value)) {
      this.isEmptyObject = false;
      this.resolvableValue = value;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this.resolvableValue = undefined;
      this._disabled = value.disabled;
      this._operator = value.operator;
      this._rule = value.rule;
      this._value = value.value;
      this._window = value.window;
    }
  }

  // disabled - computed: false, optional: true, required: false
  private _disabled?: boolean | cdktf.IResolvable; 
  public get disabled() {
    return this.getBooleanAttribute('disabled');
  }
  public set disabled(value: boolean | cdktf.IResolvable) {
    this._disabled = value;
  }
  public resetDisabled() {
    this._disabled = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get disabledInput() {
    return this._disabled;
  }

  // operator - computed: false, optional: false, required: true
  private _operator?: string; 
  public get operator() {
    return this.getStringAttribute('operator');
  }
  public set operator(value: string) {
    this._operator = value;
  }
  // Temporarily expose input value. Use with caution.
  public get operatorInput() {
    return this._operator;
  }

  // rule - computed: false, optional: false, required: true
  private _rule?: string; 
  public get rule() {
    return this.getStringAttribute('rule');
  }
  public set rule(value: string) {
    this._rule = value;
  }
  // Temporarily expose input value. Use with caution.
  public get ruleInput() {
    return this._rule;
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
}

export class AppSpecWorkerAlertList extends cdktf.ComplexList {
  public internalValue? : AppSpecWorkerAlert[] | cdktf.IResolvable

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
  public get(index: number): AppSpecWorkerAlertOutputReference {
    return new AppSpecWorkerAlertOutputReference(this.terraformResource, this.terraformAttribute, index, this.wrapsSet);
  }
}
export interface AppSpecWorkerEnv {
  /**
  * The name of the environment variable.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#key App#key}
  */
  readonly key?: string;
  /**
  * The visibility scope of the environment variable.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#scope App#scope}
  */
  readonly scope?: string;
  /**
  * The type of the environment variable.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#type App#type}
  */
  readonly type?: string;
  /**
  * The value of the environment variable.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#value App#value}
  */
  readonly value?: string;
}

export function appSpecWorkerEnvToTerraform(struct?: AppSpecWorkerEnv | cdktf.IResolvable): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    key: cdktf.stringToTerraform(struct!.key),
    scope: cdktf.stringToTerraform(struct!.scope),
    type: cdktf.stringToTerraform(struct!.type),
    value: cdktf.stringToTerraform(struct!.value),
  }
}

export class AppSpecWorkerEnvOutputReference extends cdktf.ComplexObject {
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

  public get internalValue(): AppSpecWorkerEnv | cdktf.IResolvable | undefined {
    if (this.resolvableValue) {
      return this.resolvableValue;
    }
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._key !== undefined) {
      hasAnyValues = true;
      internalValueResult.key = this._key;
    }
    if (this._scope !== undefined) {
      hasAnyValues = true;
      internalValueResult.scope = this._scope;
    }
    if (this._type !== undefined) {
      hasAnyValues = true;
      internalValueResult.type = this._type;
    }
    if (this._value !== undefined) {
      hasAnyValues = true;
      internalValueResult.value = this._value;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecWorkerEnv | cdktf.IResolvable | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this.resolvableValue = undefined;
      this._key = undefined;
      this._scope = undefined;
      this._type = undefined;
      this._value = undefined;
    }
    else if (cdktf.Tokenization.isResolvable(value)) {
      this.isEmptyObject = false;
      this.resolvableValue = value;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this.resolvableValue = undefined;
      this._key = value.key;
      this._scope = value.scope;
      this._type = value.type;
      this._value = value.value;
    }
  }

  // key - computed: false, optional: true, required: false
  private _key?: string; 
  public get key() {
    return this.getStringAttribute('key');
  }
  public set key(value: string) {
    this._key = value;
  }
  public resetKey() {
    this._key = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get keyInput() {
    return this._key;
  }

  // scope - computed: false, optional: true, required: false
  private _scope?: string; 
  public get scope() {
    return this.getStringAttribute('scope');
  }
  public set scope(value: string) {
    this._scope = value;
  }
  public resetScope() {
    this._scope = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get scopeInput() {
    return this._scope;
  }

  // type - computed: true, optional: true, required: false
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

  // value - computed: false, optional: true, required: false
  private _value?: string; 
  public get value() {
    return this.getStringAttribute('value');
  }
  public set value(value: string) {
    this._value = value;
  }
  public resetValue() {
    this._value = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get valueInput() {
    return this._value;
  }
}

export class AppSpecWorkerEnvList extends cdktf.ComplexList {
  public internalValue? : AppSpecWorkerEnv[] | cdktf.IResolvable

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
  public get(index: number): AppSpecWorkerEnvOutputReference {
    return new AppSpecWorkerEnvOutputReference(this.terraformResource, this.terraformAttribute, index, this.wrapsSet);
  }
}
export interface AppSpecWorkerGit {
  /**
  * The name of the branch to use.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#branch App#branch}
  */
  readonly branch?: string;
  /**
  * The clone URL of the repo.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#repo_clone_url App#repo_clone_url}
  */
  readonly repoCloneUrl?: string;
}

export function appSpecWorkerGitToTerraform(struct?: AppSpecWorkerGitOutputReference | AppSpecWorkerGit): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    branch: cdktf.stringToTerraform(struct!.branch),
    repo_clone_url: cdktf.stringToTerraform(struct!.repoCloneUrl),
  }
}

export class AppSpecWorkerGitOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string) {
    super(terraformResource, terraformAttribute, false, 0);
  }

  public get internalValue(): AppSpecWorkerGit | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._branch !== undefined) {
      hasAnyValues = true;
      internalValueResult.branch = this._branch;
    }
    if (this._repoCloneUrl !== undefined) {
      hasAnyValues = true;
      internalValueResult.repoCloneUrl = this._repoCloneUrl;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecWorkerGit | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this._branch = undefined;
      this._repoCloneUrl = undefined;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this._branch = value.branch;
      this._repoCloneUrl = value.repoCloneUrl;
    }
  }

  // branch - computed: false, optional: true, required: false
  private _branch?: string; 
  public get branch() {
    return this.getStringAttribute('branch');
  }
  public set branch(value: string) {
    this._branch = value;
  }
  public resetBranch() {
    this._branch = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get branchInput() {
    return this._branch;
  }

  // repo_clone_url - computed: false, optional: true, required: false
  private _repoCloneUrl?: string; 
  public get repoCloneUrl() {
    return this.getStringAttribute('repo_clone_url');
  }
  public set repoCloneUrl(value: string) {
    this._repoCloneUrl = value;
  }
  public resetRepoCloneUrl() {
    this._repoCloneUrl = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get repoCloneUrlInput() {
    return this._repoCloneUrl;
  }
}
export interface AppSpecWorkerGithub {
  /**
  * The name of the branch to use.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#branch App#branch}
  */
  readonly branch?: string;
  /**
  * Whether to automatically deploy new commits made to the repo
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#deploy_on_push App#deploy_on_push}
  */
  readonly deployOnPush?: boolean | cdktf.IResolvable;
  /**
  * The name of the repo in the format `owner/repo`.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#repo App#repo}
  */
  readonly repo?: string;
}

export function appSpecWorkerGithubToTerraform(struct?: AppSpecWorkerGithubOutputReference | AppSpecWorkerGithub): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    branch: cdktf.stringToTerraform(struct!.branch),
    deploy_on_push: cdktf.booleanToTerraform(struct!.deployOnPush),
    repo: cdktf.stringToTerraform(struct!.repo),
  }
}

export class AppSpecWorkerGithubOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string) {
    super(terraformResource, terraformAttribute, false, 0);
  }

  public get internalValue(): AppSpecWorkerGithub | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._branch !== undefined) {
      hasAnyValues = true;
      internalValueResult.branch = this._branch;
    }
    if (this._deployOnPush !== undefined) {
      hasAnyValues = true;
      internalValueResult.deployOnPush = this._deployOnPush;
    }
    if (this._repo !== undefined) {
      hasAnyValues = true;
      internalValueResult.repo = this._repo;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecWorkerGithub | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this._branch = undefined;
      this._deployOnPush = undefined;
      this._repo = undefined;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this._branch = value.branch;
      this._deployOnPush = value.deployOnPush;
      this._repo = value.repo;
    }
  }

  // branch - computed: false, optional: true, required: false
  private _branch?: string; 
  public get branch() {
    return this.getStringAttribute('branch');
  }
  public set branch(value: string) {
    this._branch = value;
  }
  public resetBranch() {
    this._branch = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get branchInput() {
    return this._branch;
  }

  // deploy_on_push - computed: false, optional: true, required: false
  private _deployOnPush?: boolean | cdktf.IResolvable; 
  public get deployOnPush() {
    return this.getBooleanAttribute('deploy_on_push');
  }
  public set deployOnPush(value: boolean | cdktf.IResolvable) {
    this._deployOnPush = value;
  }
  public resetDeployOnPush() {
    this._deployOnPush = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get deployOnPushInput() {
    return this._deployOnPush;
  }

  // repo - computed: false, optional: true, required: false
  private _repo?: string; 
  public get repo() {
    return this.getStringAttribute('repo');
  }
  public set repo(value: string) {
    this._repo = value;
  }
  public resetRepo() {
    this._repo = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get repoInput() {
    return this._repo;
  }
}
export interface AppSpecWorkerGitlab {
  /**
  * The name of the branch to use.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#branch App#branch}
  */
  readonly branch?: string;
  /**
  * Whether to automatically deploy new commits made to the repo
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#deploy_on_push App#deploy_on_push}
  */
  readonly deployOnPush?: boolean | cdktf.IResolvable;
  /**
  * The name of the repo in the format `owner/repo`.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#repo App#repo}
  */
  readonly repo?: string;
}

export function appSpecWorkerGitlabToTerraform(struct?: AppSpecWorkerGitlabOutputReference | AppSpecWorkerGitlab): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    branch: cdktf.stringToTerraform(struct!.branch),
    deploy_on_push: cdktf.booleanToTerraform(struct!.deployOnPush),
    repo: cdktf.stringToTerraform(struct!.repo),
  }
}

export class AppSpecWorkerGitlabOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string) {
    super(terraformResource, terraformAttribute, false, 0);
  }

  public get internalValue(): AppSpecWorkerGitlab | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._branch !== undefined) {
      hasAnyValues = true;
      internalValueResult.branch = this._branch;
    }
    if (this._deployOnPush !== undefined) {
      hasAnyValues = true;
      internalValueResult.deployOnPush = this._deployOnPush;
    }
    if (this._repo !== undefined) {
      hasAnyValues = true;
      internalValueResult.repo = this._repo;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecWorkerGitlab | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this._branch = undefined;
      this._deployOnPush = undefined;
      this._repo = undefined;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this._branch = value.branch;
      this._deployOnPush = value.deployOnPush;
      this._repo = value.repo;
    }
  }

  // branch - computed: false, optional: true, required: false
  private _branch?: string; 
  public get branch() {
    return this.getStringAttribute('branch');
  }
  public set branch(value: string) {
    this._branch = value;
  }
  public resetBranch() {
    this._branch = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get branchInput() {
    return this._branch;
  }

  // deploy_on_push - computed: false, optional: true, required: false
  private _deployOnPush?: boolean | cdktf.IResolvable; 
  public get deployOnPush() {
    return this.getBooleanAttribute('deploy_on_push');
  }
  public set deployOnPush(value: boolean | cdktf.IResolvable) {
    this._deployOnPush = value;
  }
  public resetDeployOnPush() {
    this._deployOnPush = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get deployOnPushInput() {
    return this._deployOnPush;
  }

  // repo - computed: false, optional: true, required: false
  private _repo?: string; 
  public get repo() {
    return this.getStringAttribute('repo');
  }
  public set repo(value: string) {
    this._repo = value;
  }
  public resetRepo() {
    this._repo = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get repoInput() {
    return this._repo;
  }
}
export interface AppSpecWorkerImageDeployOnPush {
  /**
  * Whether to automatically deploy images pushed to DOCR.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#enabled App#enabled}
  */
  readonly enabled?: boolean | cdktf.IResolvable;
}

export function appSpecWorkerImageDeployOnPushToTerraform(struct?: AppSpecWorkerImageDeployOnPush | cdktf.IResolvable): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    enabled: cdktf.booleanToTerraform(struct!.enabled),
  }
}

export class AppSpecWorkerImageDeployOnPushOutputReference extends cdktf.ComplexObject {
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

  public get internalValue(): AppSpecWorkerImageDeployOnPush | cdktf.IResolvable | undefined {
    if (this.resolvableValue) {
      return this.resolvableValue;
    }
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._enabled !== undefined) {
      hasAnyValues = true;
      internalValueResult.enabled = this._enabled;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecWorkerImageDeployOnPush | cdktf.IResolvable | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this.resolvableValue = undefined;
      this._enabled = undefined;
    }
    else if (cdktf.Tokenization.isResolvable(value)) {
      this.isEmptyObject = false;
      this.resolvableValue = value;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this.resolvableValue = undefined;
      this._enabled = value.enabled;
    }
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
}

export class AppSpecWorkerImageDeployOnPushList extends cdktf.ComplexList {
  public internalValue? : AppSpecWorkerImageDeployOnPush[] | cdktf.IResolvable

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
  public get(index: number): AppSpecWorkerImageDeployOnPushOutputReference {
    return new AppSpecWorkerImageDeployOnPushOutputReference(this.terraformResource, this.terraformAttribute, index, this.wrapsSet);
  }
}
export interface AppSpecWorkerImage {
  /**
  * The registry name. Must be left empty for the DOCR registry type.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#registry App#registry}
  */
  readonly registry?: string;
  /**
  * The registry type.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#registry_type App#registry_type}
  */
  readonly registryType: string;
  /**
  * The repository name.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#repository App#repository}
  */
  readonly repository: string;
  /**
  * The repository tag. Defaults to latest if not provided.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#tag App#tag}
  */
  readonly tag?: string;
  /**
  * deploy_on_push block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#deploy_on_push App#deploy_on_push}
  */
  readonly deployOnPush?: AppSpecWorkerImageDeployOnPush[] | cdktf.IResolvable;
}

export function appSpecWorkerImageToTerraform(struct?: AppSpecWorkerImageOutputReference | AppSpecWorkerImage): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    registry: cdktf.stringToTerraform(struct!.registry),
    registry_type: cdktf.stringToTerraform(struct!.registryType),
    repository: cdktf.stringToTerraform(struct!.repository),
    tag: cdktf.stringToTerraform(struct!.tag),
    deploy_on_push: cdktf.listMapper(appSpecWorkerImageDeployOnPushToTerraform, true)(struct!.deployOnPush),
  }
}

export class AppSpecWorkerImageOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string) {
    super(terraformResource, terraformAttribute, false, 0);
  }

  public get internalValue(): AppSpecWorkerImage | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._registry !== undefined) {
      hasAnyValues = true;
      internalValueResult.registry = this._registry;
    }
    if (this._registryType !== undefined) {
      hasAnyValues = true;
      internalValueResult.registryType = this._registryType;
    }
    if (this._repository !== undefined) {
      hasAnyValues = true;
      internalValueResult.repository = this._repository;
    }
    if (this._tag !== undefined) {
      hasAnyValues = true;
      internalValueResult.tag = this._tag;
    }
    if (this._deployOnPush?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.deployOnPush = this._deployOnPush?.internalValue;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecWorkerImage | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this._registry = undefined;
      this._registryType = undefined;
      this._repository = undefined;
      this._tag = undefined;
      this._deployOnPush.internalValue = undefined;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this._registry = value.registry;
      this._registryType = value.registryType;
      this._repository = value.repository;
      this._tag = value.tag;
      this._deployOnPush.internalValue = value.deployOnPush;
    }
  }

  // registry - computed: false, optional: true, required: false
  private _registry?: string; 
  public get registry() {
    return this.getStringAttribute('registry');
  }
  public set registry(value: string) {
    this._registry = value;
  }
  public resetRegistry() {
    this._registry = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get registryInput() {
    return this._registry;
  }

  // registry_type - computed: false, optional: false, required: true
  private _registryType?: string; 
  public get registryType() {
    return this.getStringAttribute('registry_type');
  }
  public set registryType(value: string) {
    this._registryType = value;
  }
  // Temporarily expose input value. Use with caution.
  public get registryTypeInput() {
    return this._registryType;
  }

  // repository - computed: false, optional: false, required: true
  private _repository?: string; 
  public get repository() {
    return this.getStringAttribute('repository');
  }
  public set repository(value: string) {
    this._repository = value;
  }
  // Temporarily expose input value. Use with caution.
  public get repositoryInput() {
    return this._repository;
  }

  // tag - computed: false, optional: true, required: false
  private _tag?: string; 
  public get tag() {
    return this.getStringAttribute('tag');
  }
  public set tag(value: string) {
    this._tag = value;
  }
  public resetTag() {
    this._tag = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get tagInput() {
    return this._tag;
  }

  // deploy_on_push - computed: false, optional: true, required: false
  private _deployOnPush = new AppSpecWorkerImageDeployOnPushList(this, "deploy_on_push", false);
  public get deployOnPush() {
    return this._deployOnPush;
  }
  public putDeployOnPush(value: AppSpecWorkerImageDeployOnPush[] | cdktf.IResolvable) {
    this._deployOnPush.internalValue = value;
  }
  public resetDeployOnPush() {
    this._deployOnPush.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get deployOnPushInput() {
    return this._deployOnPush.internalValue;
  }
}
export interface AppSpecWorkerLogDestinationDatadog {
  /**
  * Datadog API key.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#api_key App#api_key}
  */
  readonly apiKey: string;
  /**
  * Datadog HTTP log intake endpoint.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#endpoint App#endpoint}
  */
  readonly endpoint?: string;
}

export function appSpecWorkerLogDestinationDatadogToTerraform(struct?: AppSpecWorkerLogDestinationDatadogOutputReference | AppSpecWorkerLogDestinationDatadog): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    api_key: cdktf.stringToTerraform(struct!.apiKey),
    endpoint: cdktf.stringToTerraform(struct!.endpoint),
  }
}

export class AppSpecWorkerLogDestinationDatadogOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string) {
    super(terraformResource, terraformAttribute, false, 0);
  }

  public get internalValue(): AppSpecWorkerLogDestinationDatadog | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._apiKey !== undefined) {
      hasAnyValues = true;
      internalValueResult.apiKey = this._apiKey;
    }
    if (this._endpoint !== undefined) {
      hasAnyValues = true;
      internalValueResult.endpoint = this._endpoint;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecWorkerLogDestinationDatadog | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this._apiKey = undefined;
      this._endpoint = undefined;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this._apiKey = value.apiKey;
      this._endpoint = value.endpoint;
    }
  }

  // api_key - computed: false, optional: false, required: true
  private _apiKey?: string; 
  public get apiKey() {
    return this.getStringAttribute('api_key');
  }
  public set apiKey(value: string) {
    this._apiKey = value;
  }
  // Temporarily expose input value. Use with caution.
  public get apiKeyInput() {
    return this._apiKey;
  }

  // endpoint - computed: false, optional: true, required: false
  private _endpoint?: string; 
  public get endpoint() {
    return this.getStringAttribute('endpoint');
  }
  public set endpoint(value: string) {
    this._endpoint = value;
  }
  public resetEndpoint() {
    this._endpoint = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get endpointInput() {
    return this._endpoint;
  }
}
export interface AppSpecWorkerLogDestinationLogtail {
  /**
  * Logtail token.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#token App#token}
  */
  readonly token: string;
}

export function appSpecWorkerLogDestinationLogtailToTerraform(struct?: AppSpecWorkerLogDestinationLogtailOutputReference | AppSpecWorkerLogDestinationLogtail): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    token: cdktf.stringToTerraform(struct!.token),
  }
}

export class AppSpecWorkerLogDestinationLogtailOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string) {
    super(terraformResource, terraformAttribute, false, 0);
  }

  public get internalValue(): AppSpecWorkerLogDestinationLogtail | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._token !== undefined) {
      hasAnyValues = true;
      internalValueResult.token = this._token;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecWorkerLogDestinationLogtail | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this._token = undefined;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this._token = value.token;
    }
  }

  // token - computed: false, optional: false, required: true
  private _token?: string; 
  public get token() {
    return this.getStringAttribute('token');
  }
  public set token(value: string) {
    this._token = value;
  }
  // Temporarily expose input value. Use with caution.
  public get tokenInput() {
    return this._token;
  }
}
export interface AppSpecWorkerLogDestinationPapertrail {
  /**
  * Papertrail syslog endpoint.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#endpoint App#endpoint}
  */
  readonly endpoint: string;
}

export function appSpecWorkerLogDestinationPapertrailToTerraform(struct?: AppSpecWorkerLogDestinationPapertrailOutputReference | AppSpecWorkerLogDestinationPapertrail): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    endpoint: cdktf.stringToTerraform(struct!.endpoint),
  }
}

export class AppSpecWorkerLogDestinationPapertrailOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string) {
    super(terraformResource, terraformAttribute, false, 0);
  }

  public get internalValue(): AppSpecWorkerLogDestinationPapertrail | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._endpoint !== undefined) {
      hasAnyValues = true;
      internalValueResult.endpoint = this._endpoint;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecWorkerLogDestinationPapertrail | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this._endpoint = undefined;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this._endpoint = value.endpoint;
    }
  }

  // endpoint - computed: false, optional: false, required: true
  private _endpoint?: string; 
  public get endpoint() {
    return this.getStringAttribute('endpoint');
  }
  public set endpoint(value: string) {
    this._endpoint = value;
  }
  // Temporarily expose input value. Use with caution.
  public get endpointInput() {
    return this._endpoint;
  }
}
export interface AppSpecWorkerLogDestination {
  /**
  * Name of the log destination
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#name App#name}
  */
  readonly name: string;
  /**
  * datadog block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#datadog App#datadog}
  */
  readonly datadog?: AppSpecWorkerLogDestinationDatadog;
  /**
  * logtail block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#logtail App#logtail}
  */
  readonly logtail?: AppSpecWorkerLogDestinationLogtail;
  /**
  * papertrail block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#papertrail App#papertrail}
  */
  readonly papertrail?: AppSpecWorkerLogDestinationPapertrail;
}

export function appSpecWorkerLogDestinationToTerraform(struct?: AppSpecWorkerLogDestination | cdktf.IResolvable): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    name: cdktf.stringToTerraform(struct!.name),
    datadog: appSpecWorkerLogDestinationDatadogToTerraform(struct!.datadog),
    logtail: appSpecWorkerLogDestinationLogtailToTerraform(struct!.logtail),
    papertrail: appSpecWorkerLogDestinationPapertrailToTerraform(struct!.papertrail),
  }
}

export class AppSpecWorkerLogDestinationOutputReference extends cdktf.ComplexObject {
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

  public get internalValue(): AppSpecWorkerLogDestination | cdktf.IResolvable | undefined {
    if (this.resolvableValue) {
      return this.resolvableValue;
    }
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._name !== undefined) {
      hasAnyValues = true;
      internalValueResult.name = this._name;
    }
    if (this._datadog?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.datadog = this._datadog?.internalValue;
    }
    if (this._logtail?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.logtail = this._logtail?.internalValue;
    }
    if (this._papertrail?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.papertrail = this._papertrail?.internalValue;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecWorkerLogDestination | cdktf.IResolvable | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this.resolvableValue = undefined;
      this._name = undefined;
      this._datadog.internalValue = undefined;
      this._logtail.internalValue = undefined;
      this._papertrail.internalValue = undefined;
    }
    else if (cdktf.Tokenization.isResolvable(value)) {
      this.isEmptyObject = false;
      this.resolvableValue = value;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this.resolvableValue = undefined;
      this._name = value.name;
      this._datadog.internalValue = value.datadog;
      this._logtail.internalValue = value.logtail;
      this._papertrail.internalValue = value.papertrail;
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

  // datadog - computed: false, optional: true, required: false
  private _datadog = new AppSpecWorkerLogDestinationDatadogOutputReference(this, "datadog");
  public get datadog() {
    return this._datadog;
  }
  public putDatadog(value: AppSpecWorkerLogDestinationDatadog) {
    this._datadog.internalValue = value;
  }
  public resetDatadog() {
    this._datadog.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get datadogInput() {
    return this._datadog.internalValue;
  }

  // logtail - computed: false, optional: true, required: false
  private _logtail = new AppSpecWorkerLogDestinationLogtailOutputReference(this, "logtail");
  public get logtail() {
    return this._logtail;
  }
  public putLogtail(value: AppSpecWorkerLogDestinationLogtail) {
    this._logtail.internalValue = value;
  }
  public resetLogtail() {
    this._logtail.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get logtailInput() {
    return this._logtail.internalValue;
  }

  // papertrail - computed: false, optional: true, required: false
  private _papertrail = new AppSpecWorkerLogDestinationPapertrailOutputReference(this, "papertrail");
  public get papertrail() {
    return this._papertrail;
  }
  public putPapertrail(value: AppSpecWorkerLogDestinationPapertrail) {
    this._papertrail.internalValue = value;
  }
  public resetPapertrail() {
    this._papertrail.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get papertrailInput() {
    return this._papertrail.internalValue;
  }
}

export class AppSpecWorkerLogDestinationList extends cdktf.ComplexList {
  public internalValue? : AppSpecWorkerLogDestination[] | cdktf.IResolvable

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
  public get(index: number): AppSpecWorkerLogDestinationOutputReference {
    return new AppSpecWorkerLogDestinationOutputReference(this.terraformResource, this.terraformAttribute, index, this.wrapsSet);
  }
}
export interface AppSpecWorker {
  /**
  * An optional build command to run while building this component from source.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#build_command App#build_command}
  */
  readonly buildCommand?: string;
  /**
  * The path to a Dockerfile relative to the root of the repo. If set, overrides usage of buildpacks.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#dockerfile_path App#dockerfile_path}
  */
  readonly dockerfilePath?: string;
  /**
  * An environment slug describing the type of this app.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#environment_slug App#environment_slug}
  */
  readonly environmentSlug?: string;
  /**
  * The amount of instances that this component should be scaled to.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#instance_count App#instance_count}
  */
  readonly instanceCount?: number;
  /**
  * The instance size to use for this component.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#instance_size_slug App#instance_size_slug}
  */
  readonly instanceSizeSlug?: string;
  /**
  * The name of the component
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#name App#name}
  */
  readonly name: string;
  /**
  * An optional run command to override the component's default.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#run_command App#run_command}
  */
  readonly runCommand?: string;
  /**
  * An optional path to the working directory to use for the build.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#source_dir App#source_dir}
  */
  readonly sourceDir?: string;
  /**
  * alert block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#alert App#alert}
  */
  readonly alert?: AppSpecWorkerAlert[] | cdktf.IResolvable;
  /**
  * env block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#env App#env}
  */
  readonly env?: AppSpecWorkerEnv[] | cdktf.IResolvable;
  /**
  * git block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#git App#git}
  */
  readonly git?: AppSpecWorkerGit;
  /**
  * github block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#github App#github}
  */
  readonly github?: AppSpecWorkerGithub;
  /**
  * gitlab block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#gitlab App#gitlab}
  */
  readonly gitlab?: AppSpecWorkerGitlab;
  /**
  * image block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#image App#image}
  */
  readonly image?: AppSpecWorkerImage;
  /**
  * log_destination block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#log_destination App#log_destination}
  */
  readonly logDestination?: AppSpecWorkerLogDestination[] | cdktf.IResolvable;
}

export function appSpecWorkerToTerraform(struct?: AppSpecWorker | cdktf.IResolvable): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    build_command: cdktf.stringToTerraform(struct!.buildCommand),
    dockerfile_path: cdktf.stringToTerraform(struct!.dockerfilePath),
    environment_slug: cdktf.stringToTerraform(struct!.environmentSlug),
    instance_count: cdktf.numberToTerraform(struct!.instanceCount),
    instance_size_slug: cdktf.stringToTerraform(struct!.instanceSizeSlug),
    name: cdktf.stringToTerraform(struct!.name),
    run_command: cdktf.stringToTerraform(struct!.runCommand),
    source_dir: cdktf.stringToTerraform(struct!.sourceDir),
    alert: cdktf.listMapper(appSpecWorkerAlertToTerraform, true)(struct!.alert),
    env: cdktf.listMapper(appSpecWorkerEnvToTerraform, true)(struct!.env),
    git: appSpecWorkerGitToTerraform(struct!.git),
    github: appSpecWorkerGithubToTerraform(struct!.github),
    gitlab: appSpecWorkerGitlabToTerraform(struct!.gitlab),
    image: appSpecWorkerImageToTerraform(struct!.image),
    log_destination: cdktf.listMapper(appSpecWorkerLogDestinationToTerraform, true)(struct!.logDestination),
  }
}

export class AppSpecWorkerOutputReference extends cdktf.ComplexObject {
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

  public get internalValue(): AppSpecWorker | cdktf.IResolvable | undefined {
    if (this.resolvableValue) {
      return this.resolvableValue;
    }
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._buildCommand !== undefined) {
      hasAnyValues = true;
      internalValueResult.buildCommand = this._buildCommand;
    }
    if (this._dockerfilePath !== undefined) {
      hasAnyValues = true;
      internalValueResult.dockerfilePath = this._dockerfilePath;
    }
    if (this._environmentSlug !== undefined) {
      hasAnyValues = true;
      internalValueResult.environmentSlug = this._environmentSlug;
    }
    if (this._instanceCount !== undefined) {
      hasAnyValues = true;
      internalValueResult.instanceCount = this._instanceCount;
    }
    if (this._instanceSizeSlug !== undefined) {
      hasAnyValues = true;
      internalValueResult.instanceSizeSlug = this._instanceSizeSlug;
    }
    if (this._name !== undefined) {
      hasAnyValues = true;
      internalValueResult.name = this._name;
    }
    if (this._runCommand !== undefined) {
      hasAnyValues = true;
      internalValueResult.runCommand = this._runCommand;
    }
    if (this._sourceDir !== undefined) {
      hasAnyValues = true;
      internalValueResult.sourceDir = this._sourceDir;
    }
    if (this._alert?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.alert = this._alert?.internalValue;
    }
    if (this._env?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.env = this._env?.internalValue;
    }
    if (this._git?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.git = this._git?.internalValue;
    }
    if (this._github?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.github = this._github?.internalValue;
    }
    if (this._gitlab?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.gitlab = this._gitlab?.internalValue;
    }
    if (this._image?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.image = this._image?.internalValue;
    }
    if (this._logDestination?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.logDestination = this._logDestination?.internalValue;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpecWorker | cdktf.IResolvable | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this.resolvableValue = undefined;
      this._buildCommand = undefined;
      this._dockerfilePath = undefined;
      this._environmentSlug = undefined;
      this._instanceCount = undefined;
      this._instanceSizeSlug = undefined;
      this._name = undefined;
      this._runCommand = undefined;
      this._sourceDir = undefined;
      this._alert.internalValue = undefined;
      this._env.internalValue = undefined;
      this._git.internalValue = undefined;
      this._github.internalValue = undefined;
      this._gitlab.internalValue = undefined;
      this._image.internalValue = undefined;
      this._logDestination.internalValue = undefined;
    }
    else if (cdktf.Tokenization.isResolvable(value)) {
      this.isEmptyObject = false;
      this.resolvableValue = value;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this.resolvableValue = undefined;
      this._buildCommand = value.buildCommand;
      this._dockerfilePath = value.dockerfilePath;
      this._environmentSlug = value.environmentSlug;
      this._instanceCount = value.instanceCount;
      this._instanceSizeSlug = value.instanceSizeSlug;
      this._name = value.name;
      this._runCommand = value.runCommand;
      this._sourceDir = value.sourceDir;
      this._alert.internalValue = value.alert;
      this._env.internalValue = value.env;
      this._git.internalValue = value.git;
      this._github.internalValue = value.github;
      this._gitlab.internalValue = value.gitlab;
      this._image.internalValue = value.image;
      this._logDestination.internalValue = value.logDestination;
    }
  }

  // build_command - computed: false, optional: true, required: false
  private _buildCommand?: string; 
  public get buildCommand() {
    return this.getStringAttribute('build_command');
  }
  public set buildCommand(value: string) {
    this._buildCommand = value;
  }
  public resetBuildCommand() {
    this._buildCommand = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get buildCommandInput() {
    return this._buildCommand;
  }

  // dockerfile_path - computed: false, optional: true, required: false
  private _dockerfilePath?: string; 
  public get dockerfilePath() {
    return this.getStringAttribute('dockerfile_path');
  }
  public set dockerfilePath(value: string) {
    this._dockerfilePath = value;
  }
  public resetDockerfilePath() {
    this._dockerfilePath = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get dockerfilePathInput() {
    return this._dockerfilePath;
  }

  // environment_slug - computed: false, optional: true, required: false
  private _environmentSlug?: string; 
  public get environmentSlug() {
    return this.getStringAttribute('environment_slug');
  }
  public set environmentSlug(value: string) {
    this._environmentSlug = value;
  }
  public resetEnvironmentSlug() {
    this._environmentSlug = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get environmentSlugInput() {
    return this._environmentSlug;
  }

  // instance_count - computed: false, optional: true, required: false
  private _instanceCount?: number; 
  public get instanceCount() {
    return this.getNumberAttribute('instance_count');
  }
  public set instanceCount(value: number) {
    this._instanceCount = value;
  }
  public resetInstanceCount() {
    this._instanceCount = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get instanceCountInput() {
    return this._instanceCount;
  }

  // instance_size_slug - computed: false, optional: true, required: false
  private _instanceSizeSlug?: string; 
  public get instanceSizeSlug() {
    return this.getStringAttribute('instance_size_slug');
  }
  public set instanceSizeSlug(value: string) {
    this._instanceSizeSlug = value;
  }
  public resetInstanceSizeSlug() {
    this._instanceSizeSlug = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get instanceSizeSlugInput() {
    return this._instanceSizeSlug;
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

  // run_command - computed: false, optional: true, required: false
  private _runCommand?: string; 
  public get runCommand() {
    return this.getStringAttribute('run_command');
  }
  public set runCommand(value: string) {
    this._runCommand = value;
  }
  public resetRunCommand() {
    this._runCommand = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get runCommandInput() {
    return this._runCommand;
  }

  // source_dir - computed: false, optional: true, required: false
  private _sourceDir?: string; 
  public get sourceDir() {
    return this.getStringAttribute('source_dir');
  }
  public set sourceDir(value: string) {
    this._sourceDir = value;
  }
  public resetSourceDir() {
    this._sourceDir = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get sourceDirInput() {
    return this._sourceDir;
  }

  // alert - computed: false, optional: true, required: false
  private _alert = new AppSpecWorkerAlertList(this, "alert", false);
  public get alert() {
    return this._alert;
  }
  public putAlert(value: AppSpecWorkerAlert[] | cdktf.IResolvable) {
    this._alert.internalValue = value;
  }
  public resetAlert() {
    this._alert.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get alertInput() {
    return this._alert.internalValue;
  }

  // env - computed: false, optional: true, required: false
  private _env = new AppSpecWorkerEnvList(this, "env", true);
  public get env() {
    return this._env;
  }
  public putEnv(value: AppSpecWorkerEnv[] | cdktf.IResolvable) {
    this._env.internalValue = value;
  }
  public resetEnv() {
    this._env.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get envInput() {
    return this._env.internalValue;
  }

  // git - computed: false, optional: true, required: false
  private _git = new AppSpecWorkerGitOutputReference(this, "git");
  public get git() {
    return this._git;
  }
  public putGit(value: AppSpecWorkerGit) {
    this._git.internalValue = value;
  }
  public resetGit() {
    this._git.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get gitInput() {
    return this._git.internalValue;
  }

  // github - computed: false, optional: true, required: false
  private _github = new AppSpecWorkerGithubOutputReference(this, "github");
  public get github() {
    return this._github;
  }
  public putGithub(value: AppSpecWorkerGithub) {
    this._github.internalValue = value;
  }
  public resetGithub() {
    this._github.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get githubInput() {
    return this._github.internalValue;
  }

  // gitlab - computed: false, optional: true, required: false
  private _gitlab = new AppSpecWorkerGitlabOutputReference(this, "gitlab");
  public get gitlab() {
    return this._gitlab;
  }
  public putGitlab(value: AppSpecWorkerGitlab) {
    this._gitlab.internalValue = value;
  }
  public resetGitlab() {
    this._gitlab.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get gitlabInput() {
    return this._gitlab.internalValue;
  }

  // image - computed: false, optional: true, required: false
  private _image = new AppSpecWorkerImageOutputReference(this, "image");
  public get image() {
    return this._image;
  }
  public putImage(value: AppSpecWorkerImage) {
    this._image.internalValue = value;
  }
  public resetImage() {
    this._image.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get imageInput() {
    return this._image.internalValue;
  }

  // log_destination - computed: false, optional: true, required: false
  private _logDestination = new AppSpecWorkerLogDestinationList(this, "log_destination", false);
  public get logDestination() {
    return this._logDestination;
  }
  public putLogDestination(value: AppSpecWorkerLogDestination[] | cdktf.IResolvable) {
    this._logDestination.internalValue = value;
  }
  public resetLogDestination() {
    this._logDestination.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get logDestinationInput() {
    return this._logDestination.internalValue;
  }
}

export class AppSpecWorkerList extends cdktf.ComplexList {
  public internalValue? : AppSpecWorker[] | cdktf.IResolvable

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
  public get(index: number): AppSpecWorkerOutputReference {
    return new AppSpecWorkerOutputReference(this.terraformResource, this.terraformAttribute, index, this.wrapsSet);
  }
}
export interface AppSpec {
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#domains App#domains}
  */
  readonly domains?: string[];
  /**
  * The name of the app. Must be unique across all apps in the same account.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#name App#name}
  */
  readonly name: string;
  /**
  * The slug for the DigitalOcean data center region hosting the app
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#region App#region}
  */
  readonly region?: string;
  /**
  * alert block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#alert App#alert}
  */
  readonly alert?: AppSpecAlert[] | cdktf.IResolvable;
  /**
  * database block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#database App#database}
  */
  readonly database?: AppSpecDatabase[] | cdktf.IResolvable;
  /**
  * domain block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#domain App#domain}
  */
  readonly domain?: AppSpecDomain[] | cdktf.IResolvable;
  /**
  * env block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#env App#env}
  */
  readonly env?: AppSpecEnv[] | cdktf.IResolvable;
  /**
  * function block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#function App#function}
  */
  readonly function?: AppSpecFunction[] | cdktf.IResolvable;
  /**
  * job block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#job App#job}
  */
  readonly job?: AppSpecJob[] | cdktf.IResolvable;
  /**
  * service block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#service App#service}
  */
  readonly service?: AppSpecService[] | cdktf.IResolvable;
  /**
  * static_site block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#static_site App#static_site}
  */
  readonly staticSite?: AppSpecStaticSite[] | cdktf.IResolvable;
  /**
  * worker block
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#worker App#worker}
  */
  readonly worker?: AppSpecWorker[] | cdktf.IResolvable;
}

export function appSpecToTerraform(struct?: AppSpecOutputReference | AppSpec): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    domains: cdktf.listMapper(cdktf.stringToTerraform, false)(struct!.domains),
    name: cdktf.stringToTerraform(struct!.name),
    region: cdktf.stringToTerraform(struct!.region),
    alert: cdktf.listMapper(appSpecAlertToTerraform, true)(struct!.alert),
    database: cdktf.listMapper(appSpecDatabaseToTerraform, true)(struct!.database),
    domain: cdktf.listMapper(appSpecDomainToTerraform, true)(struct!.domain),
    env: cdktf.listMapper(appSpecEnvToTerraform, true)(struct!.env),
    function: cdktf.listMapper(appSpecFunctionToTerraform, true)(struct!.function),
    job: cdktf.listMapper(appSpecJobToTerraform, true)(struct!.job),
    service: cdktf.listMapper(appSpecServiceToTerraform, true)(struct!.service),
    static_site: cdktf.listMapper(appSpecStaticSiteToTerraform, true)(struct!.staticSite),
    worker: cdktf.listMapper(appSpecWorkerToTerraform, true)(struct!.worker),
  }
}

export class AppSpecOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string) {
    super(terraformResource, terraformAttribute, false, 0);
  }

  public get internalValue(): AppSpec | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._domains !== undefined) {
      hasAnyValues = true;
      internalValueResult.domains = this._domains;
    }
    if (this._name !== undefined) {
      hasAnyValues = true;
      internalValueResult.name = this._name;
    }
    if (this._region !== undefined) {
      hasAnyValues = true;
      internalValueResult.region = this._region;
    }
    if (this._alert?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.alert = this._alert?.internalValue;
    }
    if (this._database?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.database = this._database?.internalValue;
    }
    if (this._domain?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.domain = this._domain?.internalValue;
    }
    if (this._env?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.env = this._env?.internalValue;
    }
    if (this._function?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.function = this._function?.internalValue;
    }
    if (this._job?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.job = this._job?.internalValue;
    }
    if (this._service?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.service = this._service?.internalValue;
    }
    if (this._staticSite?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.staticSite = this._staticSite?.internalValue;
    }
    if (this._worker?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.worker = this._worker?.internalValue;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: AppSpec | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this._domains = undefined;
      this._name = undefined;
      this._region = undefined;
      this._alert.internalValue = undefined;
      this._database.internalValue = undefined;
      this._domain.internalValue = undefined;
      this._env.internalValue = undefined;
      this._function.internalValue = undefined;
      this._job.internalValue = undefined;
      this._service.internalValue = undefined;
      this._staticSite.internalValue = undefined;
      this._worker.internalValue = undefined;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this._domains = value.domains;
      this._name = value.name;
      this._region = value.region;
      this._alert.internalValue = value.alert;
      this._database.internalValue = value.database;
      this._domain.internalValue = value.domain;
      this._env.internalValue = value.env;
      this._function.internalValue = value.function;
      this._job.internalValue = value.job;
      this._service.internalValue = value.service;
      this._staticSite.internalValue = value.staticSite;
      this._worker.internalValue = value.worker;
    }
  }

  // domains - computed: true, optional: true, required: false
  private _domains?: string[]; 
  public get domains() {
    return cdktf.Fn.tolist(this.getListAttribute('domains'));
  }
  public set domains(value: string[]) {
    this._domains = value;
  }
  public resetDomains() {
    this._domains = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get domainsInput() {
    return this._domains;
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

  // region - computed: false, optional: true, required: false
  private _region?: string; 
  public get region() {
    return this.getStringAttribute('region');
  }
  public set region(value: string) {
    this._region = value;
  }
  public resetRegion() {
    this._region = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get regionInput() {
    return this._region;
  }

  // alert - computed: false, optional: true, required: false
  private _alert = new AppSpecAlertList(this, "alert", true);
  public get alert() {
    return this._alert;
  }
  public putAlert(value: AppSpecAlert[] | cdktf.IResolvable) {
    this._alert.internalValue = value;
  }
  public resetAlert() {
    this._alert.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get alertInput() {
    return this._alert.internalValue;
  }

  // database - computed: false, optional: true, required: false
  private _database = new AppSpecDatabaseList(this, "database", false);
  public get database() {
    return this._database;
  }
  public putDatabase(value: AppSpecDatabase[] | cdktf.IResolvable) {
    this._database.internalValue = value;
  }
  public resetDatabase() {
    this._database.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get databaseInput() {
    return this._database.internalValue;
  }

  // domain - computed: false, optional: true, required: false
  private _domain = new AppSpecDomainList(this, "domain", false);
  public get domain() {
    return this._domain;
  }
  public putDomain(value: AppSpecDomain[] | cdktf.IResolvable) {
    this._domain.internalValue = value;
  }
  public resetDomain() {
    this._domain.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get domainInput() {
    return this._domain.internalValue;
  }

  // env - computed: false, optional: true, required: false
  private _env = new AppSpecEnvList(this, "env", true);
  public get env() {
    return this._env;
  }
  public putEnv(value: AppSpecEnv[] | cdktf.IResolvable) {
    this._env.internalValue = value;
  }
  public resetEnv() {
    this._env.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get envInput() {
    return this._env.internalValue;
  }

  // function - computed: false, optional: true, required: false
  private _function = new AppSpecFunctionList(this, "function", false);
  public get function() {
    return this._function;
  }
  public putFunction(value: AppSpecFunction[] | cdktf.IResolvable) {
    this._function.internalValue = value;
  }
  public resetFunction() {
    this._function.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get functionInput() {
    return this._function.internalValue;
  }

  // job - computed: false, optional: true, required: false
  private _job = new AppSpecJobList(this, "job", false);
  public get job() {
    return this._job;
  }
  public putJob(value: AppSpecJob[] | cdktf.IResolvable) {
    this._job.internalValue = value;
  }
  public resetJob() {
    this._job.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get jobInput() {
    return this._job.internalValue;
  }

  // service - computed: false, optional: true, required: false
  private _service = new AppSpecServiceList(this, "service", false);
  public get service() {
    return this._service;
  }
  public putService(value: AppSpecService[] | cdktf.IResolvable) {
    this._service.internalValue = value;
  }
  public resetService() {
    this._service.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get serviceInput() {
    return this._service.internalValue;
  }

  // static_site - computed: false, optional: true, required: false
  private _staticSite = new AppSpecStaticSiteList(this, "static_site", false);
  public get staticSite() {
    return this._staticSite;
  }
  public putStaticSite(value: AppSpecStaticSite[] | cdktf.IResolvable) {
    this._staticSite.internalValue = value;
  }
  public resetStaticSite() {
    this._staticSite.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get staticSiteInput() {
    return this._staticSite.internalValue;
  }

  // worker - computed: false, optional: true, required: false
  private _worker = new AppSpecWorkerList(this, "worker", false);
  public get worker() {
    return this._worker;
  }
  public putWorker(value: AppSpecWorker[] | cdktf.IResolvable) {
    this._worker.internalValue = value;
  }
  public resetWorker() {
    this._worker.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get workerInput() {
    return this._worker.internalValue;
  }
}
export interface AppTimeouts {
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/app#create App#create}
  */
  readonly create?: string;
}

export function appTimeoutsToTerraform(struct?: AppTimeoutsOutputReference | AppTimeouts | cdktf.IResolvable): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    create: cdktf.stringToTerraform(struct!.create),
  }
}

export class AppTimeoutsOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;
  private resolvableValue?: cdktf.IResolvable;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string) {
    super(terraformResource, terraformAttribute, false, 0);
  }

  public get internalValue(): AppTimeouts | cdktf.IResolvable | undefined {
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

  public set internalValue(value: AppTimeouts | cdktf.IResolvable | undefined) {
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
* Represents a {@link https://www.terraform.io/docs/providers/digitalocean/r/app digitalocean_app}
*/
export class App extends cdktf.TerraformResource {

  // =================
  // STATIC PROPERTIES
  // =================
  public static readonly tfResourceType = "digitalocean_app";

  // ===========
  // INITIALIZER
  // ===========

  /**
  * Create a new {@link https://www.terraform.io/docs/providers/digitalocean/r/app digitalocean_app} Resource
  *
  * @param scope The scope in which to define this construct
  * @param id The scoped construct ID. Must be unique amongst siblings in the same scope
  * @param options AppConfig = {}
  */
  public constructor(scope: Construct, id: string, config: AppConfig = {}) {
    super(scope, id, {
      terraformResourceType: 'digitalocean_app',
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
    this._spec.internalValue = config.spec;
    this._timeouts.internalValue = config.timeouts;
  }

  // ==========
  // ATTRIBUTES
  // ==========

  // active_deployment_id - computed: true, optional: false, required: false
  public get activeDeploymentId() {
    return this.getStringAttribute('active_deployment_id');
  }

  // created_at - computed: true, optional: false, required: false
  public get createdAt() {
    return this.getStringAttribute('created_at');
  }

  // default_ingress - computed: true, optional: false, required: false
  public get defaultIngress() {
    return this.getStringAttribute('default_ingress');
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

  // live_url - computed: true, optional: false, required: false
  public get liveUrl() {
    return this.getStringAttribute('live_url');
  }

  // updated_at - computed: true, optional: false, required: false
  public get updatedAt() {
    return this.getStringAttribute('updated_at');
  }

  // urn - computed: true, optional: false, required: false
  public get urn() {
    return this.getStringAttribute('urn');
  }

  // spec - computed: false, optional: true, required: false
  private _spec = new AppSpecOutputReference(this, "spec");
  public get spec() {
    return this._spec;
  }
  public putSpec(value: AppSpec) {
    this._spec.internalValue = value;
  }
  public resetSpec() {
    this._spec.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get specInput() {
    return this._spec.internalValue;
  }

  // timeouts - computed: false, optional: true, required: false
  private _timeouts = new AppTimeoutsOutputReference(this, "timeouts");
  public get timeouts() {
    return this._timeouts;
  }
  public putTimeouts(value: AppTimeouts) {
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
      id: cdktf.stringToTerraform(this._id),
      spec: appSpecToTerraform(this._spec.internalValue),
      timeouts: appTimeoutsToTerraform(this._timeouts.internalValue),
    };
  }
}
