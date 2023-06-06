import { ResourceInputs, ResourceOutputs, ResourceType } from '../@resources/index.ts';
import { ProviderCredentials } from './credentials.ts';
import { SensitiveFile, SensitiveFileConfig } from '../cdktf-modules/.gen/providers/local/sensitive-file/index.ts';
import { TerraformResource } from 'cdktf';
import { Construct } from 'constructs';

export type FileConstruct = new (_scope: Construct, _id: string, _config: SensitiveFileConfig) => SensitiveFile;

export type ResourceModuleOptions<T extends ResourceType> = {
  id: string;
  inputs?: ResourceInputs[T];
  FileConstruct: FileConstruct;
};

export interface ResourceModuleConstructor<T extends ResourceType, C extends ProviderCredentials> {
  new (scope: Construct, options: ResourceModuleOptions<T>): ResourceModule<T, C>;
}

export abstract class ResourceModule<T extends ResourceType, C extends ProviderCredentials> extends Construct {
  inputs?: ResourceInputs[T];
  abstract outputs: ResourceOutputs[T];

  constructor(scope: Construct, options: ResourceModuleOptions<T>) {
    super(scope, options.id);
    this.inputs = options.inputs;
  }

  getResourceRef(resource: TerraformResource): string {
    const type = resource.terraformResourceType;
    const id = resource.friendlyUniqueId;
    return [type, id].join('.');
  }

  abstract genImports(credentials: C, resourceId: string): Promise<Record<string, string>>;

  abstract getDisplayNames(): Record<string, string>;
}
