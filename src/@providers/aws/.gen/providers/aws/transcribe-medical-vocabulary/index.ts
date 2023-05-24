// https://www.terraform.io/docs/providers/aws/r/transcribe_medical_vocabulary
// generated from terraform resource schema

import { Construct } from 'npm:constructs';
import * as cdktf from 'npm:cdktf';

// Configuration

export interface TranscribeMedicalVocabularyConfig
  extends cdktf.TerraformMetaArguments {
  /**
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/aws/r/transcribe_medical_vocabulary#id TranscribeMedicalVocabulary#id}
   *
   * Please be aware that the id field is automatically added to all resources in Terraform providers using a Terraform provider SDK version below 2.
   * If you experience problems setting this value it might not be settable. Please take a look at the provider documentation to ensure it should be settable.
   */
  readonly id?: string;
  /**
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/aws/r/transcribe_medical_vocabulary#language_code TranscribeMedicalVocabulary#language_code}
   */
  readonly languageCode: string;
  /**
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/aws/r/transcribe_medical_vocabulary#tags TranscribeMedicalVocabulary#tags}
   */
  readonly tags?: { [key: string]: string };
  /**
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/aws/r/transcribe_medical_vocabulary#tags_all TranscribeMedicalVocabulary#tags_all}
   */
  readonly tagsAll?: { [key: string]: string };
  /**
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/aws/r/transcribe_medical_vocabulary#vocabulary_file_uri TranscribeMedicalVocabulary#vocabulary_file_uri}
   */
  readonly vocabularyFileUri: string;
  /**
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/aws/r/transcribe_medical_vocabulary#vocabulary_name TranscribeMedicalVocabulary#vocabulary_name}
   */
  readonly vocabularyName: string;
  /**
   * timeouts block
   *
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/aws/r/transcribe_medical_vocabulary#timeouts TranscribeMedicalVocabulary#timeouts}
   */
  readonly timeouts?: TranscribeMedicalVocabularyTimeouts;
}
export interface TranscribeMedicalVocabularyTimeouts {
  /**
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/aws/r/transcribe_medical_vocabulary#create TranscribeMedicalVocabulary#create}
   */
  readonly create?: string;
  /**
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/aws/r/transcribe_medical_vocabulary#delete TranscribeMedicalVocabulary#delete}
   */
  readonly delete?: string;
  /**
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/aws/r/transcribe_medical_vocabulary#update TranscribeMedicalVocabulary#update}
   */
  readonly update?: string;
}

export function transcribeMedicalVocabularyTimeoutsToTerraform(
  struct?:
    | TranscribeMedicalVocabularyTimeoutsOutputReference
    | TranscribeMedicalVocabularyTimeouts
    | cdktf.IResolvable,
): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) {
    return struct;
  }
  if (cdktf.isComplexElement(struct)) {
    throw new Error(
      'A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration',
    );
  }
  return {
    create: cdktf.stringToTerraform(struct!.create),
    delete: cdktf.stringToTerraform(struct!.delete),
    update: cdktf.stringToTerraform(struct!.update),
  };
}

export class TranscribeMedicalVocabularyTimeoutsOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;
  private resolvableValue?: cdktf.IResolvable;

  /**
   * @param terraformResource The parent resource
   * @param terraformAttribute The attribute on the parent resource this class is referencing
   */
  public constructor(
    terraformResource: cdktf.IInterpolatingParent,
    terraformAttribute: string,
  ) {
    super(terraformResource, terraformAttribute, false, 0);
  }

  public get internalValue():
    | TranscribeMedicalVocabularyTimeouts
    | cdktf.IResolvable
    | undefined {
    if (this.resolvableValue) {
      return this.resolvableValue;
    }
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._create !== undefined) {
      hasAnyValues = true;
      internalValueResult.create = this._create;
    }
    if (this._delete !== undefined) {
      hasAnyValues = true;
      internalValueResult.delete = this._delete;
    }
    if (this._update !== undefined) {
      hasAnyValues = true;
      internalValueResult.update = this._update;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(
    value: TranscribeMedicalVocabularyTimeouts | cdktf.IResolvable | undefined,
  ) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this.resolvableValue = undefined;
      this._create = undefined;
      this._delete = undefined;
      this._update = undefined;
    } else if (cdktf.Tokenization.isResolvable(value)) {
      this.isEmptyObject = false;
      this.resolvableValue = value;
    } else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this.resolvableValue = undefined;
      this._create = value.create;
      this._delete = value.delete;
      this._update = value.update;
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

  // delete - computed: false, optional: true, required: false
  private _delete?: string;
  public get delete() {
    return this.getStringAttribute('delete');
  }
  public set delete(value: string) {
    this._delete = value;
  }
  public resetDelete() {
    this._delete = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get deleteInput() {
    return this._delete;
  }

  // update - computed: false, optional: true, required: false
  private _update?: string;
  public get update() {
    return this.getStringAttribute('update');
  }
  public set update(value: string) {
    this._update = value;
  }
  public resetUpdate() {
    this._update = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get updateInput() {
    return this._update;
  }
}

/**
 * Represents a {@link https://www.terraform.io/docs/providers/aws/r/transcribe_medical_vocabulary aws_transcribe_medical_vocabulary}
 */
export class TranscribeMedicalVocabulary extends cdktf.TerraformResource {
  // =================
  // STATIC PROPERTIES
  // =================
  public static readonly tfResourceType = 'aws_transcribe_medical_vocabulary';

  // ===========
  // INITIALIZER
  // ===========

  /**
   * Create a new {@link https://www.terraform.io/docs/providers/aws/r/transcribe_medical_vocabulary aws_transcribe_medical_vocabulary} Resource
   *
   * @param scope The scope in which to define this construct
   * @param id The scoped construct ID. Must be unique amongst siblings in the same scope
   * @param options TranscribeMedicalVocabularyConfig
   */
  public constructor(
    scope: Construct,
    id: string,
    config: TranscribeMedicalVocabularyConfig,
  ) {
    super(scope, id, {
      terraformResourceType: 'aws_transcribe_medical_vocabulary',
      terraformGeneratorMetadata: {
        providerName: 'aws',
        providerVersion: '4.61.0',
        providerVersionConstraint: '4.61.0',
      },
      provider: config.provider,
      dependsOn: config.dependsOn,
      count: config.count,
      lifecycle: config.lifecycle,
      provisioners: config.provisioners,
      connection: config.connection,
      forEach: config.forEach,
    });
    this._id = config.id;
    this._languageCode = config.languageCode;
    this._tags = config.tags;
    this._tagsAll = config.tagsAll;
    this._vocabularyFileUri = config.vocabularyFileUri;
    this._vocabularyName = config.vocabularyName;
    this._timeouts.internalValue = config.timeouts;
  }

  // ==========
  // ATTRIBUTES
  // ==========

  // arn - computed: true, optional: false, required: false
  public get arn() {
    return this.getStringAttribute('arn');
  }

  // download_uri - computed: true, optional: false, required: false
  public get downloadUri() {
    return this.getStringAttribute('download_uri');
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

  // language_code - computed: false, optional: false, required: true
  private _languageCode?: string;
  public get languageCode() {
    return this.getStringAttribute('language_code');
  }
  public set languageCode(value: string) {
    this._languageCode = value;
  }
  // Temporarily expose input value. Use with caution.
  public get languageCodeInput() {
    return this._languageCode;
  }

  // tags - computed: false, optional: true, required: false
  private _tags?: { [key: string]: string };
  public get tags() {
    return this.getStringMapAttribute('tags');
  }
  public set tags(value: { [key: string]: string }) {
    this._tags = value;
  }
  public resetTags() {
    this._tags = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get tagsInput() {
    return this._tags;
  }

  // tags_all - computed: true, optional: true, required: false
  private _tagsAll?: { [key: string]: string };
  public get tagsAll() {
    return this.getStringMapAttribute('tags_all');
  }
  public set tagsAll(value: { [key: string]: string }) {
    this._tagsAll = value;
  }
  public resetTagsAll() {
    this._tagsAll = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get tagsAllInput() {
    return this._tagsAll;
  }

  // vocabulary_file_uri - computed: false, optional: false, required: true
  private _vocabularyFileUri?: string;
  public get vocabularyFileUri() {
    return this.getStringAttribute('vocabulary_file_uri');
  }
  public set vocabularyFileUri(value: string) {
    this._vocabularyFileUri = value;
  }
  // Temporarily expose input value. Use with caution.
  public get vocabularyFileUriInput() {
    return this._vocabularyFileUri;
  }

  // vocabulary_name - computed: false, optional: false, required: true
  private _vocabularyName?: string;
  public get vocabularyName() {
    return this.getStringAttribute('vocabulary_name');
  }
  public set vocabularyName(value: string) {
    this._vocabularyName = value;
  }
  // Temporarily expose input value. Use with caution.
  public get vocabularyNameInput() {
    return this._vocabularyName;
  }

  // timeouts - computed: false, optional: true, required: false
  private _timeouts = new TranscribeMedicalVocabularyTimeoutsOutputReference(
    this,
    'timeouts',
  );
  public get timeouts() {
    return this._timeouts;
  }
  public putTimeouts(value: TranscribeMedicalVocabularyTimeouts) {
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
      language_code: cdktf.stringToTerraform(this._languageCode),
      tags: cdktf.hashMapper(cdktf.stringToTerraform)(this._tags),
      tags_all: cdktf.hashMapper(cdktf.stringToTerraform)(this._tagsAll),
      vocabulary_file_uri: cdktf.stringToTerraform(this._vocabularyFileUri),
      vocabulary_name: cdktf.stringToTerraform(this._vocabularyName),
      timeouts: transcribeMedicalVocabularyTimeoutsToTerraform(
        this._timeouts.internalValue,
      ),
    };
  }
}
