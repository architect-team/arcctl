import { ResourceType } from '../@resources/index.ts';
import { TerraformVersion } from '../plugins/terraform-plugin.ts';
import { ProviderCredentials, ProviderCredentialsSchema } from './credentials.ts';
import { BaseService } from './service.ts';
import { CldctlTestResource } from './tests.ts';
import { SaveFileFn } from './types.ts';
import { Construct } from 'constructs';

export type ProviderResources = {
  [T in ResourceType]?: BaseService<T>;
};

type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

export abstract class Provider<C extends ProviderCredentials = ProviderCredentials> {
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
   * @see https://ajv.ts.org/
   */
  static readonly CredentialsSchema: ProviderCredentialsSchema;

  /**
   * A set of resource types that this provider can interact with, and the
   * methods it supports
   */
  abstract readonly resources: ProviderResources;

  tests: CldctlTestResource<ProviderCredentials> = [];

  constructor(readonly name: string, readonly credentials: C, readonly saveFile: SaveFileFn) {}

  public abstract testCredentials(): Promise<boolean>;

  public getResourceEntries(): Entries<{
    [T in ResourceType]: BaseService<T>;
  }> {
    return Object.entries(this.resources) as Entries<{
      [T in ResourceType]: BaseService<T>;
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
