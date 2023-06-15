// https://www.terraform.io/docs/providers/local/d/file
// generated from terraform resource schema

import { Construct } from 'constructs';
import * as cdktf from 'cdktf';

// Configuration

export interface DataLocalFileConfig extends cdktf.TerraformMetaArguments {
  /**
  * Path to the file that will be read. The data source will return an error if the file does not exist.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/local/d/file#filename DataLocalFile#filename}
  */
  readonly filename: string;
}

/**
* Represents a {@link https://www.terraform.io/docs/providers/local/d/file local_file}
*/
export class DataLocalFile extends cdktf.TerraformDataSource {

  // =================
  // STATIC PROPERTIES
  // =================
  public static readonly tfResourceType = "local_file";

  // ===========
  // INITIALIZER
  // ===========

  /**
  * Create a new {@link https://www.terraform.io/docs/providers/local/d/file local_file} Data Source
  *
  * @param scope The scope in which to define this construct
  * @param id The scoped construct ID. Must be unique amongst siblings in the same scope
  * @param options DataLocalFileConfig
  */
  public constructor(scope: Construct, id: string, config: DataLocalFileConfig) {
    super(scope, id, {
      terraformResourceType: 'local_file',
      terraformGeneratorMetadata: {
        providerName: 'local',
        providerVersion: '2.4.0',
        providerVersionConstraint: '2.4.0'
      },
      provider: config.provider,
      dependsOn: config.dependsOn,
      count: config.count,
      lifecycle: config.lifecycle,
      provisioners: config.provisioners,
      connection: config.connection,
      forEach: config.forEach
    });
    this._filename = config.filename;
  }

  // ==========
  // ATTRIBUTES
  // ==========

  // content - computed: true, optional: false, required: false
  public get content() {
    return this.getStringAttribute('content');
  }

  // content_base64 - computed: true, optional: false, required: false
  public get contentBase64() {
    return this.getStringAttribute('content_base64');
  }

  // content_base64sha256 - computed: true, optional: false, required: false
  public get contentBase64Sha256() {
    return this.getStringAttribute('content_base64sha256');
  }

  // content_base64sha512 - computed: true, optional: false, required: false
  public get contentBase64Sha512() {
    return this.getStringAttribute('content_base64sha512');
  }

  // content_md5 - computed: true, optional: false, required: false
  public get contentMd5() {
    return this.getStringAttribute('content_md5');
  }

  // content_sha1 - computed: true, optional: false, required: false
  public get contentSha1() {
    return this.getStringAttribute('content_sha1');
  }

  // content_sha256 - computed: true, optional: false, required: false
  public get contentSha256() {
    return this.getStringAttribute('content_sha256');
  }

  // content_sha512 - computed: true, optional: false, required: false
  public get contentSha512() {
    return this.getStringAttribute('content_sha512');
  }

  // filename - computed: false, optional: false, required: true
  private _filename?: string; 
  public get filename() {
    return this.getStringAttribute('filename');
  }
  public set filename(value: string) {
    this._filename = value;
  }
  // Temporarily expose input value. Use with caution.
  public get filenameInput() {
    return this._filename;
  }

  // id - computed: true, optional: false, required: false
  public get id() {
    return this.getStringAttribute('id');
  }

  // =========
  // SYNTHESIS
  // =========

  protected synthesizeAttributes(): { [name: string]: any } {
    return {
      filename: cdktf.stringToTerraform(this._filename),
    };
  }
}
