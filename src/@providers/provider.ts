import { ResourceType } from '../@resources/index.js';
import { TerraformVersion } from '../plugins/terraform-plugin.js';
import {
  ProviderCredentials,
  ProviderCredentialsSchema,
} from './credentials.js';
import { ReadOnlyResourceService } from './service.js';
import { CldctlTestResource } from './tests.js';
import { SaveFileFn } from './types.js';
import { Construct } from 'constructs';

export type ProviderResources = {
  [T in ResourceType]?: ReadOnlyResourceService<T>;
};

type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

export abstract class Provider<
  C extends ProviderCredentials = ProviderCredentials,
> {
  /**
   * The version of terraform to use
   */
  abstract readonly terraform_version: TerraformVersion;

  /**
   * A unique name for the provider
   */
  abstract readonly type: string;

  /**
   * The schema of the credentials used to authenticate with the provider. Uses
   * JSON schema and the AJV package
   *
   * @see https://ajv.js.org/
   */
  static readonly CredentialsSchema: ProviderCredentialsSchema;

  /**
   * A set of resource types that this provider can interact with, and the
   * methods it supports
   */
  abstract readonly resources: ProviderResources;

  tests: CldctlTestResource<ProviderCredentials> = [];

  constructor(
    readonly name: string,
    readonly credentials: C,
    readonly saveFile: SaveFileFn,
  ) {}

  public abstract testCredentials(): Promise<boolean>;

  public getResourceEntries(): Entries<{
    [T in ResourceType]: ReadOnlyResourceService<T>;
  }> {
    return Object.entries(this.resources) as Entries<{
      [T in ResourceType]: ReadOnlyResourceService<T>;
    }>;
  }

  public toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      type: this.type,
      credentials: this.credentials,
    };
  }

  abstract configureTerraformProviders(scope: Construct): void;
}
