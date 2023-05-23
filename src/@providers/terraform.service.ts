import { ResourceInputs, ResourceType } from '../@resources/index.js';
import { ProviderCredentials } from './credentials.js';
import { ResourceModule } from './module.js';
import { BaseService } from './service.js';
import { Construct } from 'constructs';

export type ModuleConstructor<
  T extends ResourceType,
  C extends ProviderCredentials,
> = new (
  scope: Construct,
  name: string,
  inputs: ResourceInputs[T],
) => ResourceModule<T, C>;

export abstract class TerraformResourceService<
  T extends ResourceType,
  C extends ProviderCredentials,
> extends BaseService<T> {
  /**
   * The module used to create and manage an instance of the resource
   * using Terraform CDK
   *
   * @see https://developer.hashicorp.com/terraform/cdktf
   */
  abstract readonly construct: ModuleConstructor<T, C>;
}
