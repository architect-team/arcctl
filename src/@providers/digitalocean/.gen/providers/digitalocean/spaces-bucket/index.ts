// https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/spaces_bucket
// generated from terraform resource schema

import { Construct } from 'constructs';
import * as cdktf from 'cdktf';

// Configuration

export interface SpacesBucketConfig extends cdktf.TerraformMetaArguments {
  /**
  * Canned ACL applied on bucket creation
  * 
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/spaces_bucket#acl SpacesBucket#acl}
  */
  readonly acl?: string;
  /**
  * Unless true, the bucket will only be destroyed if empty
  * 
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/spaces_bucket#force_destroy SpacesBucket#force_destroy}
  */
  readonly forceDestroy?: boolean | cdktf.IResolvable;
  /**
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/spaces_bucket#id SpacesBucket#id}
  *
  * Please be aware that the id field is automatically added to all resources in Terraform providers using a Terraform provider SDK version below 2.
  * If you experience problems setting this value it might not be settable. Please take a look at the provider documentation to ensure it should be settable.
  */
  readonly id?: string;
  /**
  * Bucket name
  * 
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/spaces_bucket#name SpacesBucket#name}
  */
  readonly name: string;
  /**
  * Bucket region
  * 
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/spaces_bucket#region SpacesBucket#region}
  */
  readonly region?: string;
  /**
  * cors_rule block
  * 
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/spaces_bucket#cors_rule SpacesBucket#cors_rule}
  */
  readonly corsRule?: SpacesBucketCorsRule[] | cdktf.IResolvable;
  /**
  * lifecycle_rule block
  * 
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/spaces_bucket#lifecycle_rule SpacesBucket#lifecycle_rule}
  */
  readonly lifecycleRule?: SpacesBucketLifecycleRule[] | cdktf.IResolvable;
  /**
  * versioning block
  * 
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/spaces_bucket#versioning SpacesBucket#versioning}
  */
  readonly versioning?: SpacesBucketVersioning;
}
export interface SpacesBucketCorsRule {
  /**
  * A list of headers that will be included in the CORS preflight request's Access-Control-Request-Headers. A header may contain one wildcard (e.g. x-amz-*).
  * 
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/spaces_bucket#allowed_headers SpacesBucket#allowed_headers}
  */
  readonly allowedHeaders?: string[];
  /**
  * A list of HTTP methods (e.g. GET) which are allowed from the specified origin.
  * 
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/spaces_bucket#allowed_methods SpacesBucket#allowed_methods}
  */
  readonly allowedMethods: string[];
  /**
  * A list of hosts from which requests using the specified methods are allowed. A host may contain one wildcard (e.g. http://*.example.com).
  * 
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/spaces_bucket#allowed_origins SpacesBucket#allowed_origins}
  */
  readonly allowedOrigins: string[];
  /**
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/spaces_bucket#max_age_seconds SpacesBucket#max_age_seconds}
  */
  readonly maxAgeSeconds?: number;
}

export function spacesBucketCorsRuleToTerraform(struct?: SpacesBucketCorsRule | cdktf.IResolvable): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    allowed_headers: cdktf.listMapper(cdktf.stringToTerraform, false)(struct!.allowedHeaders),
    allowed_methods: cdktf.listMapper(cdktf.stringToTerraform, false)(struct!.allowedMethods),
    allowed_origins: cdktf.listMapper(cdktf.stringToTerraform, false)(struct!.allowedOrigins),
    max_age_seconds: cdktf.numberToTerraform(struct!.maxAgeSeconds),
  }
}

export class SpacesBucketCorsRuleOutputReference extends cdktf.ComplexObject {
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

  public get internalValue(): SpacesBucketCorsRule | cdktf.IResolvable | undefined {
    if (this.resolvableValue) {
      return this.resolvableValue;
    }
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._allowedHeaders !== undefined) {
      hasAnyValues = true;
      internalValueResult.allowedHeaders = this._allowedHeaders;
    }
    if (this._allowedMethods !== undefined) {
      hasAnyValues = true;
      internalValueResult.allowedMethods = this._allowedMethods;
    }
    if (this._allowedOrigins !== undefined) {
      hasAnyValues = true;
      internalValueResult.allowedOrigins = this._allowedOrigins;
    }
    if (this._maxAgeSeconds !== undefined) {
      hasAnyValues = true;
      internalValueResult.maxAgeSeconds = this._maxAgeSeconds;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: SpacesBucketCorsRule | cdktf.IResolvable | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this.resolvableValue = undefined;
      this._allowedHeaders = undefined;
      this._allowedMethods = undefined;
      this._allowedOrigins = undefined;
      this._maxAgeSeconds = undefined;
    }
    else if (cdktf.Tokenization.isResolvable(value)) {
      this.isEmptyObject = false;
      this.resolvableValue = value;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this.resolvableValue = undefined;
      this._allowedHeaders = value.allowedHeaders;
      this._allowedMethods = value.allowedMethods;
      this._allowedOrigins = value.allowedOrigins;
      this._maxAgeSeconds = value.maxAgeSeconds;
    }
  }

  // allowed_headers - computed: false, optional: true, required: false
  private _allowedHeaders?: string[]; 
  public get allowedHeaders() {
    return this.getListAttribute('allowed_headers');
  }
  public set allowedHeaders(value: string[]) {
    this._allowedHeaders = value;
  }
  public resetAllowedHeaders() {
    this._allowedHeaders = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get allowedHeadersInput() {
    return this._allowedHeaders;
  }

  // allowed_methods - computed: false, optional: false, required: true
  private _allowedMethods?: string[]; 
  public get allowedMethods() {
    return this.getListAttribute('allowed_methods');
  }
  public set allowedMethods(value: string[]) {
    this._allowedMethods = value;
  }
  // Temporarily expose input value. Use with caution.
  public get allowedMethodsInput() {
    return this._allowedMethods;
  }

  // allowed_origins - computed: false, optional: false, required: true
  private _allowedOrigins?: string[]; 
  public get allowedOrigins() {
    return this.getListAttribute('allowed_origins');
  }
  public set allowedOrigins(value: string[]) {
    this._allowedOrigins = value;
  }
  // Temporarily expose input value. Use with caution.
  public get allowedOriginsInput() {
    return this._allowedOrigins;
  }

  // max_age_seconds - computed: false, optional: true, required: false
  private _maxAgeSeconds?: number; 
  public get maxAgeSeconds() {
    return this.getNumberAttribute('max_age_seconds');
  }
  public set maxAgeSeconds(value: number) {
    this._maxAgeSeconds = value;
  }
  public resetMaxAgeSeconds() {
    this._maxAgeSeconds = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get maxAgeSecondsInput() {
    return this._maxAgeSeconds;
  }
}

export class SpacesBucketCorsRuleList extends cdktf.ComplexList {
  public internalValue? : SpacesBucketCorsRule[] | cdktf.IResolvable

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
  public get(index: number): SpacesBucketCorsRuleOutputReference {
    return new SpacesBucketCorsRuleOutputReference(this.terraformResource, this.terraformAttribute, index, this.wrapsSet);
  }
}
export interface SpacesBucketLifecycleRuleExpiration {
  /**
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/spaces_bucket#date SpacesBucket#date}
  */
  readonly date?: string;
  /**
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/spaces_bucket#days SpacesBucket#days}
  */
  readonly days?: number;
  /**
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/spaces_bucket#expired_object_delete_marker SpacesBucket#expired_object_delete_marker}
  */
  readonly expiredObjectDeleteMarker?: boolean | cdktf.IResolvable;
}

export function spacesBucketLifecycleRuleExpirationToTerraform(struct?: SpacesBucketLifecycleRuleExpirationOutputReference | SpacesBucketLifecycleRuleExpiration): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    date: cdktf.stringToTerraform(struct!.date),
    days: cdktf.numberToTerraform(struct!.days),
    expired_object_delete_marker: cdktf.booleanToTerraform(struct!.expiredObjectDeleteMarker),
  }
}

export class SpacesBucketLifecycleRuleExpirationOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string) {
    super(terraformResource, terraformAttribute, false, 0);
  }

  public get internalValue(): SpacesBucketLifecycleRuleExpiration | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._date !== undefined) {
      hasAnyValues = true;
      internalValueResult.date = this._date;
    }
    if (this._days !== undefined) {
      hasAnyValues = true;
      internalValueResult.days = this._days;
    }
    if (this._expiredObjectDeleteMarker !== undefined) {
      hasAnyValues = true;
      internalValueResult.expiredObjectDeleteMarker = this._expiredObjectDeleteMarker;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: SpacesBucketLifecycleRuleExpiration | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this._date = undefined;
      this._days = undefined;
      this._expiredObjectDeleteMarker = undefined;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this._date = value.date;
      this._days = value.days;
      this._expiredObjectDeleteMarker = value.expiredObjectDeleteMarker;
    }
  }

  // date - computed: false, optional: true, required: false
  private _date?: string; 
  public get date() {
    return this.getStringAttribute('date');
  }
  public set date(value: string) {
    this._date = value;
  }
  public resetDate() {
    this._date = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get dateInput() {
    return this._date;
  }

  // days - computed: false, optional: true, required: false
  private _days?: number; 
  public get days() {
    return this.getNumberAttribute('days');
  }
  public set days(value: number) {
    this._days = value;
  }
  public resetDays() {
    this._days = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get daysInput() {
    return this._days;
  }

  // expired_object_delete_marker - computed: false, optional: true, required: false
  private _expiredObjectDeleteMarker?: boolean | cdktf.IResolvable; 
  public get expiredObjectDeleteMarker() {
    return this.getBooleanAttribute('expired_object_delete_marker');
  }
  public set expiredObjectDeleteMarker(value: boolean | cdktf.IResolvable) {
    this._expiredObjectDeleteMarker = value;
  }
  public resetExpiredObjectDeleteMarker() {
    this._expiredObjectDeleteMarker = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get expiredObjectDeleteMarkerInput() {
    return this._expiredObjectDeleteMarker;
  }
}
export interface SpacesBucketLifecycleRuleNoncurrentVersionExpiration {
  /**
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/spaces_bucket#days SpacesBucket#days}
  */
  readonly days?: number;
}

export function spacesBucketLifecycleRuleNoncurrentVersionExpirationToTerraform(struct?: SpacesBucketLifecycleRuleNoncurrentVersionExpirationOutputReference | SpacesBucketLifecycleRuleNoncurrentVersionExpiration): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    days: cdktf.numberToTerraform(struct!.days),
  }
}

export class SpacesBucketLifecycleRuleNoncurrentVersionExpirationOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string) {
    super(terraformResource, terraformAttribute, false, 0);
  }

  public get internalValue(): SpacesBucketLifecycleRuleNoncurrentVersionExpiration | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._days !== undefined) {
      hasAnyValues = true;
      internalValueResult.days = this._days;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: SpacesBucketLifecycleRuleNoncurrentVersionExpiration | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this._days = undefined;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this._days = value.days;
    }
  }

  // days - computed: false, optional: true, required: false
  private _days?: number; 
  public get days() {
    return this.getNumberAttribute('days');
  }
  public set days(value: number) {
    this._days = value;
  }
  public resetDays() {
    this._days = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get daysInput() {
    return this._days;
  }
}
export interface SpacesBucketLifecycleRule {
  /**
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/spaces_bucket#abort_incomplete_multipart_upload_days SpacesBucket#abort_incomplete_multipart_upload_days}
  */
  readonly abortIncompleteMultipartUploadDays?: number;
  /**
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/spaces_bucket#enabled SpacesBucket#enabled}
  */
  readonly enabled: boolean | cdktf.IResolvable;
  /**
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/spaces_bucket#id SpacesBucket#id}
  *
  * Please be aware that the id field is automatically added to all resources in Terraform providers using a Terraform provider SDK version below 2.
  * If you experience problems setting this value it might not be settable. Please take a look at the provider documentation to ensure it should be settable.
  */
  readonly id?: string;
  /**
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/spaces_bucket#prefix SpacesBucket#prefix}
  */
  readonly prefix?: string;
  /**
  * expiration block
  * 
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/spaces_bucket#expiration SpacesBucket#expiration}
  */
  readonly expiration?: SpacesBucketLifecycleRuleExpiration;
  /**
  * noncurrent_version_expiration block
  * 
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/spaces_bucket#noncurrent_version_expiration SpacesBucket#noncurrent_version_expiration}
  */
  readonly noncurrentVersionExpiration?: SpacesBucketLifecycleRuleNoncurrentVersionExpiration;
}

export function spacesBucketLifecycleRuleToTerraform(struct?: SpacesBucketLifecycleRule | cdktf.IResolvable): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    abort_incomplete_multipart_upload_days: cdktf.numberToTerraform(struct!.abortIncompleteMultipartUploadDays),
    enabled: cdktf.booleanToTerraform(struct!.enabled),
    id: cdktf.stringToTerraform(struct!.id),
    prefix: cdktf.stringToTerraform(struct!.prefix),
    expiration: spacesBucketLifecycleRuleExpirationToTerraform(struct!.expiration),
    noncurrent_version_expiration: spacesBucketLifecycleRuleNoncurrentVersionExpirationToTerraform(struct!.noncurrentVersionExpiration),
  }
}

export class SpacesBucketLifecycleRuleOutputReference extends cdktf.ComplexObject {
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

  public get internalValue(): SpacesBucketLifecycleRule | cdktf.IResolvable | undefined {
    if (this.resolvableValue) {
      return this.resolvableValue;
    }
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._abortIncompleteMultipartUploadDays !== undefined) {
      hasAnyValues = true;
      internalValueResult.abortIncompleteMultipartUploadDays = this._abortIncompleteMultipartUploadDays;
    }
    if (this._enabled !== undefined) {
      hasAnyValues = true;
      internalValueResult.enabled = this._enabled;
    }
    if (this._id !== undefined) {
      hasAnyValues = true;
      internalValueResult.id = this._id;
    }
    if (this._prefix !== undefined) {
      hasAnyValues = true;
      internalValueResult.prefix = this._prefix;
    }
    if (this._expiration?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.expiration = this._expiration?.internalValue;
    }
    if (this._noncurrentVersionExpiration?.internalValue !== undefined) {
      hasAnyValues = true;
      internalValueResult.noncurrentVersionExpiration = this._noncurrentVersionExpiration?.internalValue;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: SpacesBucketLifecycleRule | cdktf.IResolvable | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this.resolvableValue = undefined;
      this._abortIncompleteMultipartUploadDays = undefined;
      this._enabled = undefined;
      this._id = undefined;
      this._prefix = undefined;
      this._expiration.internalValue = undefined;
      this._noncurrentVersionExpiration.internalValue = undefined;
    }
    else if (cdktf.Tokenization.isResolvable(value)) {
      this.isEmptyObject = false;
      this.resolvableValue = value;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this.resolvableValue = undefined;
      this._abortIncompleteMultipartUploadDays = value.abortIncompleteMultipartUploadDays;
      this._enabled = value.enabled;
      this._id = value.id;
      this._prefix = value.prefix;
      this._expiration.internalValue = value.expiration;
      this._noncurrentVersionExpiration.internalValue = value.noncurrentVersionExpiration;
    }
  }

  // abort_incomplete_multipart_upload_days - computed: false, optional: true, required: false
  private _abortIncompleteMultipartUploadDays?: number; 
  public get abortIncompleteMultipartUploadDays() {
    return this.getNumberAttribute('abort_incomplete_multipart_upload_days');
  }
  public set abortIncompleteMultipartUploadDays(value: number) {
    this._abortIncompleteMultipartUploadDays = value;
  }
  public resetAbortIncompleteMultipartUploadDays() {
    this._abortIncompleteMultipartUploadDays = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get abortIncompleteMultipartUploadDaysInput() {
    return this._abortIncompleteMultipartUploadDays;
  }

  // enabled - computed: false, optional: false, required: true
  private _enabled?: boolean | cdktf.IResolvable; 
  public get enabled() {
    return this.getBooleanAttribute('enabled');
  }
  public set enabled(value: boolean | cdktf.IResolvable) {
    this._enabled = value;
  }
  // Temporarily expose input value. Use with caution.
  public get enabledInput() {
    return this._enabled;
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

  // expiration - computed: false, optional: true, required: false
  private _expiration = new SpacesBucketLifecycleRuleExpirationOutputReference(this, "expiration");
  public get expiration() {
    return this._expiration;
  }
  public putExpiration(value: SpacesBucketLifecycleRuleExpiration) {
    this._expiration.internalValue = value;
  }
  public resetExpiration() {
    this._expiration.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get expirationInput() {
    return this._expiration.internalValue;
  }

  // noncurrent_version_expiration - computed: false, optional: true, required: false
  private _noncurrentVersionExpiration = new SpacesBucketLifecycleRuleNoncurrentVersionExpirationOutputReference(this, "noncurrent_version_expiration");
  public get noncurrentVersionExpiration() {
    return this._noncurrentVersionExpiration;
  }
  public putNoncurrentVersionExpiration(value: SpacesBucketLifecycleRuleNoncurrentVersionExpiration) {
    this._noncurrentVersionExpiration.internalValue = value;
  }
  public resetNoncurrentVersionExpiration() {
    this._noncurrentVersionExpiration.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get noncurrentVersionExpirationInput() {
    return this._noncurrentVersionExpiration.internalValue;
  }
}

export class SpacesBucketLifecycleRuleList extends cdktf.ComplexList {
  public internalValue? : SpacesBucketLifecycleRule[] | cdktf.IResolvable

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
  public get(index: number): SpacesBucketLifecycleRuleOutputReference {
    return new SpacesBucketLifecycleRuleOutputReference(this.terraformResource, this.terraformAttribute, index, this.wrapsSet);
  }
}
export interface SpacesBucketVersioning {
  /**
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/spaces_bucket#enabled SpacesBucket#enabled}
  */
  readonly enabled?: boolean | cdktf.IResolvable;
}

export function spacesBucketVersioningToTerraform(struct?: SpacesBucketVersioningOutputReference | SpacesBucketVersioning): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    enabled: cdktf.booleanToTerraform(struct!.enabled),
  }
}

export class SpacesBucketVersioningOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string) {
    super(terraformResource, terraformAttribute, false, 0);
  }

  public get internalValue(): SpacesBucketVersioning | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._enabled !== undefined) {
      hasAnyValues = true;
      internalValueResult.enabled = this._enabled;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: SpacesBucketVersioning | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this._enabled = undefined;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
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

/**
* Represents a {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/spaces_bucket digitalocean_spaces_bucket}
*/
export class SpacesBucket extends cdktf.TerraformResource {

  // =================
  // STATIC PROPERTIES
  // =================
  public static readonly tfResourceType = "digitalocean_spaces_bucket";

  // ===========
  // INITIALIZER
  // ===========

  /**
  * Create a new {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs/resources/spaces_bucket digitalocean_spaces_bucket} Resource
  *
  * @param scope The scope in which to define this construct
  * @param id The scoped construct ID. Must be unique amongst siblings in the same scope
  * @param options SpacesBucketConfig
  */
  public constructor(scope: Construct, id: string, config: SpacesBucketConfig) {
    super(scope, id, {
      terraformResourceType: 'digitalocean_spaces_bucket',
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
    this._acl = config.acl;
    this._forceDestroy = config.forceDestroy;
    this._id = config.id;
    this._name = config.name;
    this._region = config.region;
    this._corsRule.internalValue = config.corsRule;
    this._lifecycleRule.internalValue = config.lifecycleRule;
    this._versioning.internalValue = config.versioning;
  }

  // ==========
  // ATTRIBUTES
  // ==========

  // acl - computed: false, optional: true, required: false
  private _acl?: string; 
  public get acl() {
    return this.getStringAttribute('acl');
  }
  public set acl(value: string) {
    this._acl = value;
  }
  public resetAcl() {
    this._acl = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get aclInput() {
    return this._acl;
  }

  // bucket_domain_name - computed: true, optional: false, required: false
  public get bucketDomainName() {
    return this.getStringAttribute('bucket_domain_name');
  }

  // endpoint - computed: true, optional: false, required: false
  public get endpoint() {
    return this.getStringAttribute('endpoint');
  }

  // force_destroy - computed: false, optional: true, required: false
  private _forceDestroy?: boolean | cdktf.IResolvable; 
  public get forceDestroy() {
    return this.getBooleanAttribute('force_destroy');
  }
  public set forceDestroy(value: boolean | cdktf.IResolvable) {
    this._forceDestroy = value;
  }
  public resetForceDestroy() {
    this._forceDestroy = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get forceDestroyInput() {
    return this._forceDestroy;
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

  // urn - computed: true, optional: false, required: false
  public get urn() {
    return this.getStringAttribute('urn');
  }

  // cors_rule - computed: false, optional: true, required: false
  private _corsRule = new SpacesBucketCorsRuleList(this, "cors_rule", false);
  public get corsRule() {
    return this._corsRule;
  }
  public putCorsRule(value: SpacesBucketCorsRule[] | cdktf.IResolvable) {
    this._corsRule.internalValue = value;
  }
  public resetCorsRule() {
    this._corsRule.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get corsRuleInput() {
    return this._corsRule.internalValue;
  }

  // lifecycle_rule - computed: false, optional: true, required: false
  private _lifecycleRule = new SpacesBucketLifecycleRuleList(this, "lifecycle_rule", false);
  public get lifecycleRule() {
    return this._lifecycleRule;
  }
  public putLifecycleRule(value: SpacesBucketLifecycleRule[] | cdktf.IResolvable) {
    this._lifecycleRule.internalValue = value;
  }
  public resetLifecycleRule() {
    this._lifecycleRule.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get lifecycleRuleInput() {
    return this._lifecycleRule.internalValue;
  }

  // versioning - computed: false, optional: true, required: false
  private _versioning = new SpacesBucketVersioningOutputReference(this, "versioning");
  public get versioning() {
    return this._versioning;
  }
  public putVersioning(value: SpacesBucketVersioning) {
    this._versioning.internalValue = value;
  }
  public resetVersioning() {
    this._versioning.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get versioningInput() {
    return this._versioning.internalValue;
  }

  // =========
  // SYNTHESIS
  // =========

  protected synthesizeAttributes(): { [name: string]: any } {
    return {
      acl: cdktf.stringToTerraform(this._acl),
      force_destroy: cdktf.booleanToTerraform(this._forceDestroy),
      id: cdktf.stringToTerraform(this._id),
      name: cdktf.stringToTerraform(this._name),
      region: cdktf.stringToTerraform(this._region),
      cors_rule: cdktf.listMapper(spacesBucketCorsRuleToTerraform, true)(this._corsRule.internalValue),
      lifecycle_rule: cdktf.listMapper(spacesBucketLifecycleRuleToTerraform, true)(this._lifecycleRule.internalValue),
      versioning: spacesBucketVersioningToTerraform(this._versioning.internalValue),
    };
  }
}
