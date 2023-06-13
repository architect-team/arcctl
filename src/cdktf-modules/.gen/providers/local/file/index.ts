// https://www.terraform.io/docs/providers/local/r/file
// generated from terraform resource schema

import { Construct } from 'constructs';
import * as cdktf from 'cdktf';

// Configuration

export interface FileConfig extends cdktf.TerraformMetaArguments {
  /**
  * Content to store in the file, expected to be a UTF-8 encoded string.
 Conflicts with `sensitive_content`, `content_base64` and `source`.
 Exactly one of these four arguments must be specified.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/local/r/file#content File#content}
  */
  readonly content?: string;
  /**
  * Content to store in the file, expected to be binary encoded as base64 string.
 Conflicts with `content`, `sensitive_content` and `source`.
 Exactly one of these four arguments must be specified.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/local/r/file#content_base64 File#content_base64}
  */
  readonly contentBase64?: string;
  /**
  * Permissions to set for directories created (before umask), expressed as string in
 [numeric notation](https://en.wikipedia.org/wiki/File-system_permissions#Numeric_notation).
 Default value is `"0777"`.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/local/r/file#directory_permission File#directory_permission}
  */
  readonly directoryPermission?: string;
  /**
  * Permissions to set for the output file (before umask), expressed as string in
 [numeric notation](https://en.wikipedia.org/wiki/File-system_permissions#Numeric_notation).
 Default value is `"0777"`.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/local/r/file#file_permission File#file_permission}
  */
  readonly filePermission?: string;
  /**
  * The path to the file that will be created.
 Missing parent directories will be created.
 If the file already exists, it will be overridden with the given content.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/local/r/file#filename File#filename}
  */
  readonly filename: string;
  /**
  * Sensitive content to store in the file, expected to be an UTF-8 encoded string.
 Will not be displayed in diffs.
 Conflicts with `content`, `content_base64` and `source`.
 Exactly one of these four arguments must be specified.
 If in need to use _sensitive_ content, please use the [`local_sensitive_file`](./sensitive_file.html)
 resource instead.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/local/r/file#sensitive_content File#sensitive_content}
  */
  readonly sensitiveContent?: string;
  /**
  * Path to file to use as source for the one we are creating.
 Conflicts with `content`, `sensitive_content` and `content_base64`.
 Exactly one of these four arguments must be specified.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/local/r/file#source File#source}
  */
  readonly source?: string;
}

/**
* Represents a {@link https://www.terraform.io/docs/providers/local/r/file local_file}
*/
export class File extends cdktf.TerraformResource {

  // =================
  // STATIC PROPERTIES
  // =================
  public static readonly tfResourceType = "local_file";

  // ===========
  // INITIALIZER
  // ===========

  /**
  * Create a new {@link https://www.terraform.io/docs/providers/local/r/file local_file} Resource
  *
  * @param scope The scope in which to define this construct
  * @param id The scoped construct ID. Must be unique amongst siblings in the same scope
  * @param options FileConfig
  */
  public constructor(scope: Construct, id: string, config: FileConfig) {
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
    this._content = config.content;
    this._contentBase64 = config.contentBase64;
    this._directoryPermission = config.directoryPermission;
    this._filePermission = config.filePermission;
    this._filename = config.filename;
    this._sensitiveContent = config.sensitiveContent;
    this._source = config.source;
  }

  // ==========
  // ATTRIBUTES
  // ==========

  // content - computed: false, optional: true, required: false
  private _content?: string; 
  public get content() {
    return this.getStringAttribute('content');
  }
  public set content(value: string) {
    this._content = value;
  }
  public resetContent() {
    this._content = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get contentInput() {
    return this._content;
  }

  // content_base64 - computed: false, optional: true, required: false
  private _contentBase64?: string; 
  public get contentBase64() {
    return this.getStringAttribute('content_base64');
  }
  public set contentBase64(value: string) {
    this._contentBase64 = value;
  }
  public resetContentBase64() {
    this._contentBase64 = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get contentBase64Input() {
    return this._contentBase64;
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

  // directory_permission - computed: true, optional: true, required: false
  private _directoryPermission?: string; 
  public get directoryPermission() {
    return this.getStringAttribute('directory_permission');
  }
  public set directoryPermission(value: string) {
    this._directoryPermission = value;
  }
  public resetDirectoryPermission() {
    this._directoryPermission = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get directoryPermissionInput() {
    return this._directoryPermission;
  }

  // file_permission - computed: true, optional: true, required: false
  private _filePermission?: string; 
  public get filePermission() {
    return this.getStringAttribute('file_permission');
  }
  public set filePermission(value: string) {
    this._filePermission = value;
  }
  public resetFilePermission() {
    this._filePermission = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get filePermissionInput() {
    return this._filePermission;
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

  // sensitive_content - computed: false, optional: true, required: false
  private _sensitiveContent?: string; 
  public get sensitiveContent() {
    return this.getStringAttribute('sensitive_content');
  }
  public set sensitiveContent(value: string) {
    this._sensitiveContent = value;
  }
  public resetSensitiveContent() {
    this._sensitiveContent = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get sensitiveContentInput() {
    return this._sensitiveContent;
  }

  // source - computed: false, optional: true, required: false
  private _source?: string; 
  public get source() {
    return this.getStringAttribute('source');
  }
  public set source(value: string) {
    this._source = value;
  }
  public resetSource() {
    this._source = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get sourceInput() {
    return this._source;
  }

  // =========
  // SYNTHESIS
  // =========

  protected synthesizeAttributes(): { [name: string]: any } {
    return {
      content: cdktf.stringToTerraform(this._content),
      content_base64: cdktf.stringToTerraform(this._contentBase64),
      directory_permission: cdktf.stringToTerraform(this._directoryPermission),
      file_permission: cdktf.stringToTerraform(this._filePermission),
      filename: cdktf.stringToTerraform(this._filename),
      sensitive_content: cdktf.stringToTerraform(this._sensitiveContent),
      source: cdktf.stringToTerraform(this._source),
    };
  }
}
