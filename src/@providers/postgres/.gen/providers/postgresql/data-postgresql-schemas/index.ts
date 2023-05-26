// https://www.terraform.io/docs/providers/postgresql/d/schemas
// generated from terraform resource schema

import { Construct } from 'constructs';
import * as cdktf from 'cdktf';

// Configuration

export interface DataPostgresqlSchemasConfig extends cdktf.TerraformMetaArguments {
  /**
  * The PostgreSQL database which will be queried for schema names
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql/d/schemas#database DataPostgresqlSchemas#database}
  */
  readonly database: string;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql/d/schemas#id DataPostgresqlSchemas#id}
  *
  * Please be aware that the id field is automatically added to all resources in Terraform providers using a Terraform provider SDK version below 2.
  * If you experience problems setting this value it might not be settable. Please take a look at the provider documentation to ensure it should be settable.
  */
  readonly id?: string;
  /**
  * Determines whether to include system schemas (pg_ prefix and information_schema). 'public' will always be included.
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql/d/schemas#include_system_schemas DataPostgresqlSchemas#include_system_schemas}
  */
  readonly includeSystemSchemas?: boolean | cdktf.IResolvable;
  /**
  * Expression(s) which will be pattern matched in the query using the PostgreSQL LIKE ALL operator
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql/d/schemas#like_all_patterns DataPostgresqlSchemas#like_all_patterns}
  */
  readonly likeAllPatterns?: string[];
  /**
  * Expression(s) which will be pattern matched in the query using the PostgreSQL LIKE ANY operator
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql/d/schemas#like_any_patterns DataPostgresqlSchemas#like_any_patterns}
  */
  readonly likeAnyPatterns?: string[];
  /**
  * Expression(s) which will be pattern matched in the query using the PostgreSQL NOT LIKE ALL operator
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql/d/schemas#not_like_all_patterns DataPostgresqlSchemas#not_like_all_patterns}
  */
  readonly notLikeAllPatterns?: string[];
  /**
  * Expression which will be pattern matched in the query using the PostgreSQL ~ (regular expression match) operator
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql/d/schemas#regex_pattern DataPostgresqlSchemas#regex_pattern}
  */
  readonly regexPattern?: string;
}

/**
* Represents a {@link https://www.terraform.io/docs/providers/postgresql/d/schemas postgresql_schemas}
*/
export class DataPostgresqlSchemas extends cdktf.TerraformDataSource {

  // =================
  // STATIC PROPERTIES
  // =================
  public static readonly tfResourceType = "postgresql_schemas";

  // ===========
  // INITIALIZER
  // ===========

  /**
  * Create a new {@link https://www.terraform.io/docs/providers/postgresql/d/schemas postgresql_schemas} Data Source
  *
  * @param scope The scope in which to define this construct
  * @param id The scoped construct ID. Must be unique amongst siblings in the same scope
  * @param options DataPostgresqlSchemasConfig
  */
  public constructor(scope: Construct, id: string, config: DataPostgresqlSchemasConfig) {
    super(scope, id, {
      terraformResourceType: 'postgresql_schemas',
      terraformGeneratorMetadata: {
        providerName: 'postgresql',
        providerVersion: '1.19.0',
        providerVersionConstraint: '1.19.0'
      },
      provider: config.provider,
      dependsOn: config.dependsOn,
      count: config.count,
      lifecycle: config.lifecycle,
      provisioners: config.provisioners,
      connection: config.connection,
      forEach: config.forEach
    });
    this._database = config.database;
    this._id = config.id;
    this._includeSystemSchemas = config.includeSystemSchemas;
    this._likeAllPatterns = config.likeAllPatterns;
    this._likeAnyPatterns = config.likeAnyPatterns;
    this._notLikeAllPatterns = config.notLikeAllPatterns;
    this._regexPattern = config.regexPattern;
  }

  // ==========
  // ATTRIBUTES
  // ==========

  // database - computed: false, optional: false, required: true
  private _database?: string; 
  public get database() {
    return this.getStringAttribute('database');
  }
  public set database(value: string) {
    this._database = value;
  }
  // Temporarily expose input value. Use with caution.
  public get databaseInput() {
    return this._database;
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

  // include_system_schemas - computed: false, optional: true, required: false
  private _includeSystemSchemas?: boolean | cdktf.IResolvable; 
  public get includeSystemSchemas() {
    return this.getBooleanAttribute('include_system_schemas');
  }
  public set includeSystemSchemas(value: boolean | cdktf.IResolvable) {
    this._includeSystemSchemas = value;
  }
  public resetIncludeSystemSchemas() {
    this._includeSystemSchemas = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get includeSystemSchemasInput() {
    return this._includeSystemSchemas;
  }

  // like_all_patterns - computed: false, optional: true, required: false
  private _likeAllPatterns?: string[]; 
  public get likeAllPatterns() {
    return this.getListAttribute('like_all_patterns');
  }
  public set likeAllPatterns(value: string[]) {
    this._likeAllPatterns = value;
  }
  public resetLikeAllPatterns() {
    this._likeAllPatterns = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get likeAllPatternsInput() {
    return this._likeAllPatterns;
  }

  // like_any_patterns - computed: false, optional: true, required: false
  private _likeAnyPatterns?: string[]; 
  public get likeAnyPatterns() {
    return this.getListAttribute('like_any_patterns');
  }
  public set likeAnyPatterns(value: string[]) {
    this._likeAnyPatterns = value;
  }
  public resetLikeAnyPatterns() {
    this._likeAnyPatterns = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get likeAnyPatternsInput() {
    return this._likeAnyPatterns;
  }

  // not_like_all_patterns - computed: false, optional: true, required: false
  private _notLikeAllPatterns?: string[]; 
  public get notLikeAllPatterns() {
    return this.getListAttribute('not_like_all_patterns');
  }
  public set notLikeAllPatterns(value: string[]) {
    this._notLikeAllPatterns = value;
  }
  public resetNotLikeAllPatterns() {
    this._notLikeAllPatterns = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get notLikeAllPatternsInput() {
    return this._notLikeAllPatterns;
  }

  // regex_pattern - computed: false, optional: true, required: false
  private _regexPattern?: string; 
  public get regexPattern() {
    return this.getStringAttribute('regex_pattern');
  }
  public set regexPattern(value: string) {
    this._regexPattern = value;
  }
  public resetRegexPattern() {
    this._regexPattern = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get regexPatternInput() {
    return this._regexPattern;
  }

  // schemas - computed: true, optional: false, required: false
  public get schemas() {
    return cdktf.Fn.tolist(this.getListAttribute('schemas'));
  }

  // =========
  // SYNTHESIS
  // =========

  protected synthesizeAttributes(): { [name: string]: any } {
    return {
      database: cdktf.stringToTerraform(this._database),
      id: cdktf.stringToTerraform(this._id),
      include_system_schemas: cdktf.booleanToTerraform(this._includeSystemSchemas),
      like_all_patterns: cdktf.listMapper(cdktf.stringToTerraform, false)(this._likeAllPatterns),
      like_any_patterns: cdktf.listMapper(cdktf.stringToTerraform, false)(this._likeAnyPatterns),
      not_like_all_patterns: cdktf.listMapper(cdktf.stringToTerraform, false)(this._notLikeAllPatterns),
      regex_pattern: cdktf.stringToTerraform(this._regexPattern),
    };
  }
}
