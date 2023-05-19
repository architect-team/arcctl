import {
  ResourceInputs,
  ResourceOutputs,
  ResourceType,
} from '../@resources/index.js';
import { ProviderCredentials } from './credentials.js';
import { ProviderStore } from './store.js';
import { SaveFileFn } from './types.js';
import { TerraformResource } from 'cdktf';
import { Construct } from 'constructs';

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
