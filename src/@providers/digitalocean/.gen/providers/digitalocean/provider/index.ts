// https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs
// generated from terraform resource schema

import { Construct } from 'constructs';
import * as cdktf from 'cdktf';

// Configuration

export interface DigitaloceanProviderConfig {
  /**
  * The URL to use for the DigitalOcean API.
  * 
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs#api_endpoint DigitaloceanProvider#api_endpoint}
  */
  readonly apiEndpoint?: string;
  /**
  * The maximum number of retries on a failed API request.
  * 
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs#http_retry_max DigitaloceanProvider#http_retry_max}
  */
  readonly httpRetryMax?: number;
  /**
  * The maximum wait time (in seconds) between failed API requests.
  * 
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs#http_retry_wait_max DigitaloceanProvider#http_retry_wait_max}
  */
  readonly httpRetryWaitMax?: number;
  /**
  * The minimum wait time (in seconds) between failed API requests.
  * 
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs#http_retry_wait_min DigitaloceanProvider#http_retry_wait_min}
  */
  readonly httpRetryWaitMin?: number;
  /**
  * The rate of requests per second to limit the HTTP client.
  * 
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs#requests_per_second DigitaloceanProvider#requests_per_second}
  */
  readonly requestsPerSecond?: number;
  /**
  * The access key ID for Spaces API operations.
  * 
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs#spaces_access_id DigitaloceanProvider#spaces_access_id}
  */
  readonly spacesAccessId?: string;
  /**
  * The URL to use for the DigitalOcean Spaces API.
  * 
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs#spaces_endpoint DigitaloceanProvider#spaces_endpoint}
  */
  readonly spacesEndpoint?: string;
  /**
  * The secret access key for Spaces API operations.
  * 
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs#spaces_secret_key DigitaloceanProvider#spaces_secret_key}
  */
  readonly spacesSecretKey?: string;
  /**
  * The token key for API operations.
  * 
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs#token DigitaloceanProvider#token}
  */
  readonly token?: string;
  /**
  * Alias name
  * 
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs#alias DigitaloceanProvider#alias}
  */
  readonly alias?: string;
}

/**
* Represents a {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs digitalocean}
*/
export class DigitaloceanProvider extends cdktf.TerraformProvider {

  // =================
  // STATIC PROPERTIES
  // =================
  public static readonly tfResourceType = "digitalocean";

  // ===========
  // INITIALIZER
  // ===========

  /**
  * Create a new {@link https://registry.terraform.io/providers/digitalocean/digitalocean/2.28.1/docs digitalocean} Resource
  *
  * @param scope The scope in which to define this construct
  * @param id The scoped construct ID. Must be unique amongst siblings in the same scope
  * @param options DigitaloceanProviderConfig = {}
  */
  public constructor(scope: Construct, id: string, config: DigitaloceanProviderConfig = {}) {
    super(scope, id, {
      terraformResourceType: 'digitalocean',
      terraformGeneratorMetadata: {
        providerName: 'digitalocean',
        providerVersion: '2.28.1',
        providerVersionConstraint: '2.28.1'
      },
      terraformProviderSource: 'digitalocean/digitalocean'
    });
    this._apiEndpoint = config.apiEndpoint;
    this._httpRetryMax = config.httpRetryMax;
    this._httpRetryWaitMax = config.httpRetryWaitMax;
    this._httpRetryWaitMin = config.httpRetryWaitMin;
    this._requestsPerSecond = config.requestsPerSecond;
    this._spacesAccessId = config.spacesAccessId;
    this._spacesEndpoint = config.spacesEndpoint;
    this._spacesSecretKey = config.spacesSecretKey;
    this._token = config.token;
    this._alias = config.alias;
  }

  // ==========
  // ATTRIBUTES
  // ==========

  // api_endpoint - computed: false, optional: true, required: false
  private _apiEndpoint?: string; 
  public get apiEndpoint() {
    return this._apiEndpoint;
  }
  public set apiEndpoint(value: string | undefined) {
    this._apiEndpoint = value;
  }
  public resetApiEndpoint() {
    this._apiEndpoint = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get apiEndpointInput() {
    return this._apiEndpoint;
  }

  // http_retry_max - computed: false, optional: true, required: false
  private _httpRetryMax?: number; 
  public get httpRetryMax() {
    return this._httpRetryMax;
  }
  public set httpRetryMax(value: number | undefined) {
    this._httpRetryMax = value;
  }
  public resetHttpRetryMax() {
    this._httpRetryMax = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get httpRetryMaxInput() {
    return this._httpRetryMax;
  }

  // http_retry_wait_max - computed: false, optional: true, required: false
  private _httpRetryWaitMax?: number; 
  public get httpRetryWaitMax() {
    return this._httpRetryWaitMax;
  }
  public set httpRetryWaitMax(value: number | undefined) {
    this._httpRetryWaitMax = value;
  }
  public resetHttpRetryWaitMax() {
    this._httpRetryWaitMax = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get httpRetryWaitMaxInput() {
    return this._httpRetryWaitMax;
  }

  // http_retry_wait_min - computed: false, optional: true, required: false
  private _httpRetryWaitMin?: number; 
  public get httpRetryWaitMin() {
    return this._httpRetryWaitMin;
  }
  public set httpRetryWaitMin(value: number | undefined) {
    this._httpRetryWaitMin = value;
  }
  public resetHttpRetryWaitMin() {
    this._httpRetryWaitMin = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get httpRetryWaitMinInput() {
    return this._httpRetryWaitMin;
  }

  // requests_per_second - computed: false, optional: true, required: false
  private _requestsPerSecond?: number; 
  public get requestsPerSecond() {
    return this._requestsPerSecond;
  }
  public set requestsPerSecond(value: number | undefined) {
    this._requestsPerSecond = value;
  }
  public resetRequestsPerSecond() {
    this._requestsPerSecond = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get requestsPerSecondInput() {
    return this._requestsPerSecond;
  }

  // spaces_access_id - computed: false, optional: true, required: false
  private _spacesAccessId?: string; 
  public get spacesAccessId() {
    return this._spacesAccessId;
  }
  public set spacesAccessId(value: string | undefined) {
    this._spacesAccessId = value;
  }
  public resetSpacesAccessId() {
    this._spacesAccessId = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get spacesAccessIdInput() {
    return this._spacesAccessId;
  }

  // spaces_endpoint - computed: false, optional: true, required: false
  private _spacesEndpoint?: string; 
  public get spacesEndpoint() {
    return this._spacesEndpoint;
  }
  public set spacesEndpoint(value: string | undefined) {
    this._spacesEndpoint = value;
  }
  public resetSpacesEndpoint() {
    this._spacesEndpoint = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get spacesEndpointInput() {
    return this._spacesEndpoint;
  }

  // spaces_secret_key - computed: false, optional: true, required: false
  private _spacesSecretKey?: string; 
  public get spacesSecretKey() {
    return this._spacesSecretKey;
  }
  public set spacesSecretKey(value: string | undefined) {
    this._spacesSecretKey = value;
  }
  public resetSpacesSecretKey() {
    this._spacesSecretKey = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get spacesSecretKeyInput() {
    return this._spacesSecretKey;
  }

  // token - computed: false, optional: true, required: false
  private _token?: string; 
  public get token() {
    return this._token;
  }
  public set token(value: string | undefined) {
    this._token = value;
  }
  public resetToken() {
    this._token = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get tokenInput() {
    return this._token;
  }

  // alias - computed: false, optional: true, required: false
  private _alias?: string; 
  public get alias() {
    return this._alias;
  }
  public set alias(value: string | undefined) {
    this._alias = value;
  }
  public resetAlias() {
    this._alias = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get aliasInput() {
    return this._alias;
  }

  // =========
  // SYNTHESIS
  // =========

  protected synthesizeAttributes(): { [name: string]: any } {
    return {
      api_endpoint: cdktf.stringToTerraform(this._apiEndpoint),
      http_retry_max: cdktf.numberToTerraform(this._httpRetryMax),
      http_retry_wait_max: cdktf.numberToTerraform(this._httpRetryWaitMax),
      http_retry_wait_min: cdktf.numberToTerraform(this._httpRetryWaitMin),
      requests_per_second: cdktf.numberToTerraform(this._requestsPerSecond),
      spaces_access_id: cdktf.stringToTerraform(this._spacesAccessId),
      spaces_endpoint: cdktf.stringToTerraform(this._spacesEndpoint),
      spaces_secret_key: cdktf.stringToTerraform(this._spacesSecretKey),
      token: cdktf.stringToTerraform(this._token),
      alias: cdktf.stringToTerraform(this._alias),
    };
  }
}
