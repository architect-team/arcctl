import { TerraformResource } from 'cdktf';
import { Construct } from 'constructs';
import { ResourceInputs, ResourceOutputs, ResourceType } from '../@resources/index.ts';
import { SensitiveFile, SensitiveFileConfig } from '../cdktf-modules/.gen/providers/local/sensitive-file/index.ts';
import { ProviderCredentials } from './credentials.ts';
import { ProviderStore } from './store.ts';

export type FileConstruct = new (_scope: Construct, _id: string, _config: SensitiveFileConfig) => SensitiveFile;

export type ResourceModuleOptions<T extends ResourceType, C extends ProviderCredentials> = {
  id: string;
  accountName: string;
  credentials: C;
  inputs?: ResourceInputs[T];
  providerStore: ProviderStore;
  FileConstruct: FileConstruct;
};

export interface ResourceModuleConstructor<T extends ResourceType, C extends ProviderCredentials> {
  new (scope: Construct, options: ResourceModuleOptions<T, C>): ResourceModule<T, C>;
}

export abstract class ResourceModule<T extends ResourceType, C extends ProviderCredentials> extends Construct {
  credentials: C;
  accountName: string;
  providerStore: ProviderStore;
  inputs?: ResourceInputs[T];
  abstract outputs: ResourceOutputs[T];

  constructor(scope: Construct, options: ResourceModuleOptions<T, C>) {
    super(scope, options.id);
    this.accountName = options.accountName;
    this.inputs = options.inputs;
    this.credentials = options.credentials;
    this.providerStore = options.providerStore;
  }

  getResourceRef(resource: TerraformResource): string {
    const type = resource.terraformResourceType;
    const id = resource.friendlyUniqueId;
    return [type, id].join('.');
  }

  abstract genImports(resourceId: string): Promise<Record<string, string>>;

  abstract getDisplayNames(): Record<string, string>;
}
