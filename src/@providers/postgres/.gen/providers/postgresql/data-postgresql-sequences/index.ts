// https://www.terraform.io/docs/providers/postgresql/d/sequences
// generated from terraform resource schema

import { Construct } from 'constructs';
import * as cdktf from 'cdktf';

// Configuration

export interface DataPostgresqlSequencesConfig extends cdktf.TerraformMetaArguments {
  /**
  * The PostgreSQL database which will be queried for sequence names
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql/d/sequences#database DataPostgresqlSequences#database}
  */
  readonly database: string;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql/d/sequences#id DataPostgresqlSequences#id}
  *
  * Please be aware that the id field is automatically added to all resources in Terraform providers using a Terraform provider SDK version below 2.
  * If you experience problems setting this value it might not be settable. Please take a look at the provider documentation to ensure it should be settable.
  */
  readonly id?: string;
  /**
  * Expression(s) which will be pattern matched against sequence names in the query using the PostgreSQL LIKE ALL operator
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql/d/sequences#like_all_patterns DataPostgresqlSequences#like_all_patterns}
  */
  readonly likeAllPatterns?: string[];
  /**
  * Expression(s) which will be pattern matched against sequence names in the query using the PostgreSQL LIKE ANY operator
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql/d/sequences#like_any_patterns DataPostgresqlSequences#like_any_patterns}
  */
  readonly likeAnyPatterns?: string[];
  /**
  * Expression(s) which will be pattern matched against sequence names in the query using the PostgreSQL NOT LIKE ALL operator
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql/d/sequences#not_like_all_patterns DataPostgresqlSequences#not_like_all_patterns}
  */
  readonly notLikeAllPatterns?: string[];
  /**
  * Expression which will be pattern matched against sequence names in the query using the PostgreSQL ~ (regular expression match) operator
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql/d/sequences#regex_pattern DataPostgresqlSequences#regex_pattern}
  */
  readonly regexPattern?: string;
  /**
  * The PostgreSQL schema(s) which will be queried for sequence names. Queries all schemas in the database by default
  * 
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/postgresql/d/sequences#schemas DataPostgresqlSequences#schemas}
  */
  readonly schemas?: string[];
}
export interface DataPostgresqlSequencesSequences {
}

export function dataPostgresqlSequencesSequencesToTerraform(struct?: DataPostgresqlSequencesSequences): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
  }
}

export class DataPostgresqlSequencesSequencesOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  * @param complexObjectIndex the index of this item in the list
  * @param complexObjectIsFromSet whether the list is wrapping a set (will add tolist() to be able to access an item via an index)
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string, complexObjectIndex: number, complexObjectIsFromSet: boolean) {
    super(terraformResource, terraformAttribute, complexObjectIsFromSet, complexObjectIndex);
  }

  public get internalValue(): DataPostgresqlSequencesSequences | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: DataPostgresqlSequencesSequences | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
    }
  }

  // data_type - computed: true, optional: false, required: false
  public get dataType() {
    return this.getStringAttribute('data_type');
  }

  // object_name - computed: true, optional: false, required: false
  public get objectName() {
    return this.getStringAttribute('object_name');
  }

  // schema_name - computed: true, optional: false, required: false
  public get schemaName() {
    return this.getStringAttribute('schema_name');
  }
}

export class DataPostgresqlSequencesSequencesList extends cdktf.ComplexList {

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
  public get(index: number): DataPostgresqlSequencesSequencesOutputReference {
    return new DataPostgresqlSequencesSequencesOutputReference(this.terraformResource, this.terraformAttribute, index, this.wrapsSet);
  }
}

/**
* Represents a {@link https://www.terraform.io/docs/providers/postgresql/d/sequences postgresql_sequences}
*/
export class DataPostgresqlSequences extends cdktf.TerraformDataSource {

  // =================
  // STATIC PROPERTIES
  // =================
  public static readonly tfResourceType = "postgresql_sequences";

  // ===========
  // INITIALIZER
  // ===========

  /**
  * Create a new {@link https://www.terraform.io/docs/providers/postgresql/d/sequences postgresql_sequences} Data Source
  *
  * @param scope The scope in which to define this construct
  * @param id The scoped construct ID. Must be unique amongst siblings in the same scope
  * @param options DataPostgresqlSequencesConfig
  */
  public constructor(scope: Construct, id: string, config: DataPostgresqlSequencesConfig) {
    super(scope, id, {
      terraformResourceType: 'postgresql_sequences',
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
    this._likeAllPatterns = config.likeAllPatterns;
    this._likeAnyPatterns = config.likeAnyPatterns;
    this._notLikeAllPatterns = config.notLikeAllPatterns;
    this._regexPattern = config.regexPattern;
    this._schemas = config.schemas;
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

  // schemas - computed: false, optional: true, required: false
  private _schemas?: string[]; 
  public get schemas() {
    return this.getListAttribute('schemas');
  }
  public set schemas(value: string[]) {
    this._schemas = value;
  }
  public resetSchemas() {
    this._schemas = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get schemasInput() {
    return this._schemas;
  }

  // sequences - computed: true, optional: false, required: false
  private _sequences = new DataPostgresqlSequencesSequencesList(this, "sequences", false);
  public get sequences() {
    return this._sequences;
  }

  // =========
  // SYNTHESIS
  // =========

  protected synthesizeAttributes(): { [name: string]: any } {
    return {
      database: cdktf.stringToTerraform(this._database),
      id: cdktf.stringToTerraform(this._id),
      like_all_patterns: cdktf.listMapper(cdktf.stringToTerraform, false)(this._likeAllPatterns),
      like_any_patterns: cdktf.listMapper(cdktf.stringToTerraform, false)(this._likeAnyPatterns),
      not_like_all_patterns: cdktf.listMapper(cdktf.stringToTerraform, false)(this._notLikeAllPatterns),
      regex_pattern: cdktf.stringToTerraform(this._regexPattern),
      schemas: cdktf.listMapper(cdktf.stringToTerraform, false)(this._schemas),
    };
  }
}
