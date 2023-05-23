import {
  ResourceInputs,
  ResourceOutputs,
  ResourceType,
} from '../@resources/index.js';
import { ProviderCredentials } from './credentials.js';
import { TerraformResource } from 'cdktf';
import { Construct } from 'constructs';

export abstract class ResourceModule<
  T extends ResourceType,
  C extends ProviderCredentials,
> extends Construct {
  abstract outputs: ResourceOutputs[T];

  constructor(
    public readonly scope: Construct,
    public readonly name: string,
    public readonly inputs: ResourceInputs[T],
  ) {
    super(scope, name);
  }

  getResourceRef(resource: TerraformResource): string {
    const type = resource.terraformResourceType;
    const id = resource.friendlyUniqueId;
    return [type, id].join('.');
  }

  abstract genImports(
    credentials: C,
    resourceId: string,
  ): Promise<Record<string, string>>;

  abstract getDisplayNames(): Record<string, string>;
}
