import {
  ResourceInputs,
  ResourceOutputs,
  ResourceType,
} from '../@resources/index.ts';
import { ProviderCredentials } from './credentials.ts';
import { ProviderStore } from './store.ts';
import { SaveFileFn } from './types.ts';
import { TerraformResource } from 'npm:cdktf';
import { Construct } from 'npm:constructs';

export interface ResourceModuleHooks {
  afterCreate?: (
    saveFile: SaveFileFn,
    saveProvider: ProviderStore['saveProvider'],
    getOutputValue: (id: string) => Promise<any>,
  ) => Promise<void>;
  afterDelete?: () => Promise<void>;
  afterImport?: () => Promise<void>;
}

export abstract class ResourceModule<
  T extends ResourceType,
  C extends ProviderCredentials,
> extends Construct {
  abstract outputs: ResourceOutputs[T];
  hooks: ResourceModuleHooks = {};

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
