// https://registry.terraform.io/providers/hashicorp/google/4.70.0/docs/data-sources/dataproc_metastore_service_iam_policy
// generated from terraform resource schema

import { Construct } from 'constructs';
import * as cdktf from 'cdktf';

// Configuration

export interface DataGoogleDataprocMetastoreServiceIamPolicyConfig extends cdktf.TerraformMetaArguments {
  /**
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/hashicorp/google/4.70.0/docs/data-sources/dataproc_metastore_service_iam_policy#id DataGoogleDataprocMetastoreServiceIamPolicy#id}
  *
  * Please be aware that the id field is automatically added to all resources in Terraform providers using a Terraform provider SDK version below 2.
  * If you experience problems setting this value it might not be settable. Please take a look at the provider documentation to ensure it should be settable.
  */
  readonly id?: string;
  /**
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/hashicorp/google/4.70.0/docs/data-sources/dataproc_metastore_service_iam_policy#location DataGoogleDataprocMetastoreServiceIamPolicy#location}
  */
  readonly location?: string;
  /**
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/hashicorp/google/4.70.0/docs/data-sources/dataproc_metastore_service_iam_policy#project DataGoogleDataprocMetastoreServiceIamPolicy#project}
  */
  readonly project?: string;
  /**
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/hashicorp/google/4.70.0/docs/data-sources/dataproc_metastore_service_iam_policy#service_id DataGoogleDataprocMetastoreServiceIamPolicy#service_id}
  */
  readonly serviceId: string;
}

/**
* Represents a {@link https://registry.terraform.io/providers/hashicorp/google/4.70.0/docs/data-sources/dataproc_metastore_service_iam_policy google_dataproc_metastore_service_iam_policy}
*/
export class DataGoogleDataprocMetastoreServiceIamPolicy extends cdktf.TerraformDataSource {

  // =================
  // STATIC PROPERTIES
  // =================
  public static readonly tfResourceType = "google_dataproc_metastore_service_iam_policy";

  // ===========
  // INITIALIZER
  // ===========

  /**
  * Create a new {@link https://registry.terraform.io/providers/hashicorp/google/4.70.0/docs/data-sources/dataproc_metastore_service_iam_policy google_dataproc_metastore_service_iam_policy} Data Source
  *
  * @param scope The scope in which to define this construct
  * @param id The scoped construct ID. Must be unique amongst siblings in the same scope
  * @param options DataGoogleDataprocMetastoreServiceIamPolicyConfig
  */
  public constructor(scope: Construct, id: string, config: DataGoogleDataprocMetastoreServiceIamPolicyConfig) {
    super(scope, id, {
      terraformResourceType: 'google_dataproc_metastore_service_iam_policy',
      terraformGeneratorMetadata: {
        providerName: 'google',
        providerVersion: '4.70.0',
        providerVersionConstraint: '4.70.0'
      },
      provider: config.provider,
      dependsOn: config.dependsOn,
      count: config.count,
      lifecycle: config.lifecycle,
      provisioners: config.provisioners,
      connection: config.connection,
      forEach: config.forEach
    });
    this._id = config.id;
    this._location = config.location;
    this._project = config.project;
    this._serviceId = config.serviceId;
  }

  // ==========
  // ATTRIBUTES
  // ==========

  // etag - computed: true, optional: false, required: false
  public get etag() {
    return this.getStringAttribute('etag');
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

  // location - computed: true, optional: true, required: false
  private _location?: string; 
  public get location() {
    return this.getStringAttribute('location');
  }
  public set location(value: string) {
    this._location = value;
  }
  public resetLocation() {
    this._location = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get locationInput() {
    return this._location;
  }

  // policy_data - computed: true, optional: false, required: false
  public get policyData() {
    return this.getStringAttribute('policy_data');
  }

  // project - computed: true, optional: true, required: false
  private _project?: string; 
  public get project() {
    return this.getStringAttribute('project');
  }
  public set project(value: string) {
    this._project = value;
  }
  public resetProject() {
    this._project = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get projectInput() {
    return this._project;
  }

  // service_id - computed: false, optional: false, required: true
  private _serviceId?: string; 
  public get serviceId() {
    return this.getStringAttribute('service_id');
  }
  public set serviceId(value: string) {
    this._serviceId = value;
  }
  // Temporarily expose input value. Use with caution.
  public get serviceIdInput() {
    return this._serviceId;
  }

  // =========
  // SYNTHESIS
  // =========

  protected synthesizeAttributes(): { [name: string]: any } {
    return {
      id: cdktf.stringToTerraform(this._id),
      location: cdktf.stringToTerraform(this._location),
      project: cdktf.stringToTerraform(this._project),
      service_id: cdktf.stringToTerraform(this._serviceId),
    };
  }
}