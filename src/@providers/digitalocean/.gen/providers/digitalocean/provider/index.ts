// https://www.terraform.io/docs/providers/digitalocean
// generated from terraform resource schema

import { Construct } from 'constructs';
import * as cdktf from 'cdktf';

// Configuration

export interface DigitaloceanProviderConfig {
  /**
  * The URL to use for the DigitalOcean API.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean#api_endpoint DigitaloceanProvider#api_endpoint}
  */
  readonly apiEndpoint?: string;
  /**
  * The access key ID for Spaces API operations.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean#spaces_access_id DigitaloceanProvider#spaces_access_id}
  */
  readonly spacesAccessId?: string;
  /**
  * The URL to use for the DigitalOcean Spaces API.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean#spaces_endpoint DigitaloceanProvider#spaces_endpoint}
  */
  readonly spacesEndpoint?: string;
  /**
  * The secret access key for Spaces API operations.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean#spaces_secret_key DigitaloceanProvider#spaces_secret_key}
  */
  readonly spacesSecretKey?: string;
  /**
  * The token key for API operations.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean#token DigitaloceanProvider#token}
  */
  readonly token?: string;
  /**
  * Alias name
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean#alias DigitaloceanProvider#alias}
  */
  readonly alias?: string;
}

/**
* Represents a {@link https://www.terraform.io/docs/providers/digitalocean digitalocean}
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
  * Create a new {@link https://www.terraform.io/docs/providers/digitalocean digitalocean} Resource
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
        providerVersion: '2.26.0',
        providerVersionConstraint: '2.26.0'
      },
      terraformProviderSource: 'digitalocean/digitalocean'
    });
    this._apiEndpoint = config.apiEndpoint;
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
      spaces_access_id: cdktf.stringToTerraform(this._spacesAccessId),
      spaces_endpoint: cdktf.stringToTerraform(this._spacesEndpoint),
      spaces_secret_key: cdktf.stringToTerraform(this._spacesSecretKey),
      token: cdktf.stringToTerraform(this._token),
      alias: cdktf.stringToTerraform(this._alias),
    };
  }
}
