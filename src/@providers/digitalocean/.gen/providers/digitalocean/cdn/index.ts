// https://www.terraform.io/docs/providers/digitalocean/r/cdn
// generated from terraform resource schema
import * as cdktf from 'cdktf';
import { Construct } from 'constructs';

// Configuration

export interface CdnConfig extends cdktf.TerraformMetaArguments {
  /**
   * ID of a DigitalOcean managed TLS certificate for use with custom domains
   *
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/cdn#certificate_id Cdn#certificate_id}
   */
  readonly certificateId?: string;
  /**
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/cdn#certificate_name Cdn#certificate_name}
   */
  readonly certificateName?: string;
  /**
   * fully qualified domain name (FQDN) for custom subdomain, (requires certificate_id)
   *
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/cdn#custom_domain Cdn#custom_domain}
   */
  readonly customDomain?: string;
  /**
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/cdn#id Cdn#id}
   *
   * Please be aware that the id field is automatically added to all resources in Terraform providers using a Terraform provider SDK version below 2.
   * If you experience problems setting this value it might not be settable. Please take a look at the provider documentation to ensure it should be settable.
   */
  readonly id?: string;
  /**
   * fully qualified domain name (FQDN) for the origin server
   *
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/cdn#origin Cdn#origin}
   */
  readonly origin: string;
  /**
   * The amount of time the content is cached in the CDN
   *
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/cdn#ttl Cdn#ttl}
   */
  readonly ttl?: number;
}

/**
 * Represents a {@link https://www.terraform.io/docs/providers/digitalocean/r/cdn digitalocean_cdn}
 */
export class Cdn extends cdktf.TerraformResource {
  // =================
  // STATIC PROPERTIES
  // =================
  public static readonly tfResourceType = 'digitalocean_cdn';

  // ===========
  // INITIALIZER
  // ===========

  /**
   * Create a new {@link https://www.terraform.io/docs/providers/digitalocean/r/cdn digitalocean_cdn} Resource
   *
   * @param scope The scope in which to define this construct
   * @param id The scoped construct ID. Must be unique amongst siblings in the same scope
   * @param options CdnConfig
   */
  public constructor(scope: Construct, id: string, config: CdnConfig) {
    super(scope, id, {
      terraformResourceType: 'digitalocean_cdn',
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
    this._certificateId = config.certificateId;
    this._certificateName = config.certificateName;
    this._customDomain = config.customDomain;
    this._id = config.id;
    this._origin = config.origin;
    this._ttl = config.ttl;
  }

  // ==========
  // ATTRIBUTES
  // ==========

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

  // created_at - computed: true, optional: false, required: false
  public get createdAt() {
    return this.getStringAttribute('created_at');
  }

  // custom_domain - computed: false, optional: true, required: false
  private _customDomain?: string;
  public get customDomain() {
    return this.getStringAttribute('custom_domain');
  }
  public set customDomain(value: string) {
    this._customDomain = value;
  }
  public resetCustomDomain() {
    this._customDomain = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get customDomainInput() {
    return this._customDomain;
  }

  // endpoint - computed: true, optional: false, required: false
  public get endpoint() {
    return this.getStringAttribute('endpoint');
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

  // origin - computed: false, optional: false, required: true
  private _origin?: string;
  public get origin() {
    return this.getStringAttribute('origin');
  }
  public set origin(value: string) {
    this._origin = value;
  }
  // Temporarily expose input value. Use with caution.
  public get originInput() {
    return this._origin;
  }

  // ttl - computed: true, optional: true, required: false
  private _ttl?: number;
  public get ttl() {
    return this.getNumberAttribute('ttl');
  }
  public set ttl(value: number) {
    this._ttl = value;
  }
  public resetTtl() {
    this._ttl = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get ttlInput() {
    return this._ttl;
  }

  // =========
  // SYNTHESIS
  // =========

  protected synthesizeAttributes(): { [name: string]: any } {
    return {
      certificate_id: cdktf.stringToTerraform(this._certificateId),
      certificate_name: cdktf.stringToTerraform(this._certificateName),
      custom_domain: cdktf.stringToTerraform(this._customDomain),
      id: cdktf.stringToTerraform(this._id),
      origin: cdktf.stringToTerraform(this._origin),
      ttl: cdktf.numberToTerraform(this._ttl),
    };
  }
}
