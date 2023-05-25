import {
  ResourceInputs,
  ResourceOutputs,
  ResourceType,
} from '../@resources/index.ts';
import { PagingOptions, PagingResponse } from '../utils/paging.ts';
import { ProviderCredentials } from './credentials.ts';
import { ResourceModule } from './module.ts';
import { Construct } from 'constructs';

export type ModuleConstructor<
  T extends ResourceType,
  C extends ProviderCredentials,
> = new (
  scope: Construct,
  name: string,
  inputs: ResourceInputs[T],
) => ResourceModule<T, C>;

export abstract class ResourceService<
  T extends ResourceType,
  C extends ProviderCredentials,
> {
  /**
   * Retrieve the details of an existing resource
   */
  abstract get?(id: string): Promise<ResourceOutputs[T] | undefined>;

  /**
   * Search for resources matching the specified options
   */
  abstract list?(
    filterOptions?: Partial<ResourceOutputs[T]>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs[T]>>;

  /**
   * Describes how this provider can create, update, or delete the
   * specified resource
   */
  public manage?: {
    /**
     * A set of methods that can be used to validate the input
     * values of the resource before sending to the provider
     */
    validators?: {
      /**
       * Takes in a resource input and returns a string error if the
       * value needs to change. Otherwise returns undefined.
       */
      [P in keyof ResourceInputs[T]]?: (
        value: ResourceInputs[T][P],
      ) => string | true;
    };

    /**
     * A set of simple preset input packages for the resource that
     * may be helpful to accelerate developer testing
     */
    presets?: Array<{
      /**
       * A simple description of the input package
       */
      display: string;

      /**
       * A partial set of values for the resource to automatically use
       */
      values: Partial<ResourceInputs[T]>;
    }>;

    /**
     * The module used to create and manage an instance of the resource
     * using Terraform CDK
     *
     * @see https://developer.hashicorp.com/terraform/cdktf
     */
    module: ModuleConstructor<T, C>;
  };
}
