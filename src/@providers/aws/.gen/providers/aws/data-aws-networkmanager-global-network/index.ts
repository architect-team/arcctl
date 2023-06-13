// https://www.terraform.io/docs/providers/aws/d/networkmanager_global_network
// generated from terraform resource schema

import { Construct } from 'constructs';
import * as cdktf from 'cdktf';

// Configuration

export interface DataAwsNetworkmanagerGlobalNetworkConfig extends cdktf.TerraformMetaArguments {
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/aws/d/networkmanager_global_network#global_network_id DataAwsNetworkmanagerGlobalNetwork#global_network_id}
  */
  readonly globalNetworkId: string;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/aws/d/networkmanager_global_network#id DataAwsNetworkmanagerGlobalNetwork#id}
  *
  * Please be aware that the id field is automatically added to all resources in Terraform providers using a Terraform provider SDK version below 2.
  * If you experience problems setting this value it might not be settable. Please take a look at the provider documentation to ensure it should be settable.
  */
  readonly id?: string;
  /**
  * Docs at Terraform Registry: {@link https://www.terraform.io/docs/providers/aws/d/networkmanager_global_network#tags DataAwsNetworkmanagerGlobalNetwork#tags}
  */
  readonly tags?: { [key: string]: string };
}

/**
* Represents a {@link https://www.terraform.io/docs/providers/aws/d/networkmanager_global_network aws_networkmanager_global_network}
*/
export class DataAwsNetworkmanagerGlobalNetwork extends cdktf.TerraformDataSource {

  // =================
  // STATIC PROPERTIES
  // =================
  public static readonly tfResourceType = "aws_networkmanager_global_network";

  // ===========
  // INITIALIZER
  // ===========

  /**
  * Create a new {@link https://www.terraform.io/docs/providers/aws/d/networkmanager_global_network aws_networkmanager_global_network} Data Source
  *
  * @param scope The scope in which to define this construct
  * @param id The scoped construct ID. Must be unique amongst siblings in the same scope
  * @param options DataAwsNetworkmanagerGlobalNetworkConfig
  */
  public constructor(scope: Construct, id: string, config: DataAwsNetworkmanagerGlobalNetworkConfig) {
    super(scope, id, {
      terraformResourceType: 'aws_networkmanager_global_network',
      terraformGeneratorMetadata: {
        providerName: 'aws',
        providerVersion: '4.61.0',
        providerVersionConstraint: '4.61.0'
      },
      provider: config.provider,
      dependsOn: config.dependsOn,
      count: config.count,
      lifecycle: config.lifecycle,
      provisioners: config.provisioners,
      connection: config.connection,
      forEach: config.forEach
    });
    this._globalNetworkId = config.globalNetworkId;
    this._id = config.id;
    this._tags = config.tags;
  }

  // ==========
  // ATTRIBUTES
  // ==========

  // arn - computed: true, optional: false, required: false
  public get arn() {
    return this.getStringAttribute('arn');
  }

  // description - computed: true, optional: false, required: false
  public get description() {
    return this.getStringAttribute('description');
  }

  // global_network_id - computed: false, optional: false, required: true
  private _globalNetworkId?: string; 
  public get globalNetworkId() {
    return this.getStringAttribute('global_network_id');
  }
  public set globalNetworkId(value: string) {
    this._globalNetworkId = value;
  }
  // Temporarily expose input value. Use with caution.
  public get globalNetworkIdInput() {
    return this._globalNetworkId;
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

  // tags - computed: true, optional: true, required: false
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

  // =========
  // SYNTHESIS
  // =========

  protected synthesizeAttributes(): { [name: string]: any } {
    return {
      global_network_id: cdktf.stringToTerraform(this._globalNetworkId),
      id: cdktf.stringToTerraform(this._id),
      tags: cdktf.hashMapper(cdktf.stringToTerraform)(this._tags),
    };
  }
}
