// https://www.terraform.io/docs/providers/digitalocean/r/container_registry_docker_credentials
// generated from terraform resource schema

import { Construct } from 'npm:constructs';
import * as cdktf from 'cdktf';

// Configuration

export interface ContainerRegistryDockerCredentialsConfig extends cdktf.TerraformMetaArguments {
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/container_registry_docker_credentials#expiry_seconds ContainerRegistryDockerCredentials#expiry_seconds}
  */
  readonly expirySeconds?: number;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/container_registry_docker_credentials#id ContainerRegistryDockerCredentials#id}
  *
  * Please be aware that the id field is automatically added to all resources in Terraform providers using a Terraform provider SDK version below 2.
  * If you experience problems setting this value it might not be settable. Please take a look at the provider documentation to ensure it should be settable.
  */
  readonly id?: string;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/container_registry_docker_credentials#registry_name ContainerRegistryDockerCredentials#registry_name}
  */
  readonly registryName: string;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/container_registry_docker_credentials#write ContainerRegistryDockerCredentials#write}
  */
  readonly write?: boolean | cdktf.IResolvable;
}

/**
* Represents a {@link https://www.terraform.io/docs/providers/digitalocean/r/container_registry_docker_credentials digitalocean_container_registry_docker_credentials}
*/
export class ContainerRegistryDockerCredentials extends cdktf.TerraformResource {

  // =================
  // STATIC PROPERTIES
  // =================
  public static readonly tfResourceType = "digitalocean_container_registry_docker_credentials";

  // ===========
  // INITIALIZER
  // ===========

  /**
  * Create a new {@link https://www.terraform.io/docs/providers/digitalocean/r/container_registry_docker_credentials digitalocean_container_registry_docker_credentials} Resource
  *
  * @param scope The scope in which to define this construct
  * @param id The scoped construct ID. Must be unique amongst siblings in the same scope
  * @param options ContainerRegistryDockerCredentialsConfig
  */
  public constructor(scope: Construct, id: string, config: ContainerRegistryDockerCredentialsConfig) {
    super(scope, id, {
      terraformResourceType: 'digitalocean_container_registry_docker_credentials',
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
    this._expirySeconds = config.expirySeconds;
    this._id = config.id;
    this._registryName = config.registryName;
    this._write = config.write;
  }

  // ==========
  // ATTRIBUTES
  // ==========

  // credential_expiration_time - computed: true, optional: false, required: false
  public get credentialExpirationTime() {
    return this.getStringAttribute('credential_expiration_time');
  }

  // docker_credentials - computed: true, optional: false, required: false
  public get dockerCredentials() {
    return this.getStringAttribute('docker_credentials');
  }

  // expiry_seconds - computed: false, optional: true, required: false
  private _expirySeconds?: number;
  public get expirySeconds() {
    return this.getNumberAttribute('expiry_seconds');
  }
  public set expirySeconds(value: number) {
    this._expirySeconds = value;
  }
  public resetExpirySeconds() {
    this._expirySeconds = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get expirySecondsInput() {
    return this._expirySeconds;
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

  // registry_name - computed: false, optional: false, required: true
  private _registryName?: string;
  public get registryName() {
    return this.getStringAttribute('registry_name');
  }
  public set registryName(value: string) {
    this._registryName = value;
  }
  // Temporarily expose input value. Use with caution.
  public get registryNameInput() {
    return this._registryName;
  }

  // write - computed: false, optional: true, required: false
  private _write?: boolean | cdktf.IResolvable;
  public get write() {
    return this.getBooleanAttribute('write');
  }
  public set write(value: boolean | cdktf.IResolvable) {
    this._write = value;
  }
  public resetWrite() {
    this._write = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get writeInput() {
    return this._write;
  }

  // =========
  // SYNTHESIS
  // =========

  protected synthesizeAttributes(): { [name: string]: any } {
    return {
      expiry_seconds: cdktf.numberToTerraform(this._expirySeconds),
      id: cdktf.stringToTerraform(this._id),
      registry_name: cdktf.stringToTerraform(this._registryName),
      write: cdktf.booleanToTerraform(this._write),
    };
  }
}
