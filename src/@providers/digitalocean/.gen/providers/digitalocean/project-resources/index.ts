// https://www.terraform.io/docs/providers/digitalocean/r/project_resources
// generated from terraform resource schema
import * as cdktf from 'cdktf';
import { Construct } from 'constructs';

// Configuration

export interface ProjectResourcesConfig extends cdktf.TerraformMetaArguments {
  /**
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/project_resources#id ProjectResources#id}
   *
   * Please be aware that the id field is automatically added to all resources in Terraform providers using a Terraform provider SDK version below 2.
   * If you experience problems setting this value it might not be settable. Please take a look at the provider documentation to ensure it should be settable.
   */
  readonly id?: string;
  /**
   * project ID
   *
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/project_resources#project ProjectResources#project}
   */
  readonly project: string;
  /**
   * the resources associated with the project
   *
   * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/digitalocean/r/project_resources#resources ProjectResources#resources}
   */
  readonly resources: string[];
}

/**
 * Represents a {@link https://www.terraform.io/docs/providers/digitalocean/r/project_resources digitalocean_project_resources}
 */
export class ProjectResources extends cdktf.TerraformResource {
  // =================
  // STATIC PROPERTIES
  // =================
  public static readonly tfResourceType = 'digitalocean_project_resources';

  // ===========
  // INITIALIZER
  // ===========

  /**
   * Create a new {@link https://www.terraform.io/docs/providers/digitalocean/r/project_resources digitalocean_project_resources} Resource
   *
   * @param scope The scope in which to define this construct
   * @param id The scoped construct ID. Must be unique amongst siblings in the same scope
   * @param options ProjectResourcesConfig
   */
  public constructor(
    scope: Construct,
    id: string,
    config: ProjectResourcesConfig,
  ) {
    super(scope, id, {
      terraformResourceType: 'digitalocean_project_resources',
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
    this._id = config.id;
    this._project = config.project;
    this._resources = config.resources;
  }

  // ==========
  // ATTRIBUTES
  // ==========

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

  // project - computed: false, optional: false, required: true
  private _project?: string;
  public get project() {
    return this.getStringAttribute('project');
  }
  public set project(value: string) {
    this._project = value;
  }
  // Temporarily expose input value. Use with caution.
  public get projectInput() {
    return this._project;
  }

  // resources - computed: false, optional: false, required: true
  private _resources?: string[];
  public get resources() {
    return cdktf.Fn.tolist(this.getListAttribute('resources'));
  }
  public set resources(value: string[]) {
    this._resources = value;
  }
  // Temporarily expose input value. Use with caution.
  public get resourcesInput() {
    return this._resources;
  }

  // =========
  // SYNTHESIS
  // =========

  protected synthesizeAttributes(): { [name: string]: any } {
    return {
      id: cdktf.stringToTerraform(this._id),
      project: cdktf.stringToTerraform(this._project),
      resources: cdktf.listMapper(
        cdktf.stringToTerraform,
        false,
      )(this._resources),
    };
  }
}
