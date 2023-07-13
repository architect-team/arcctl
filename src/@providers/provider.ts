import { ResourceType } from '../@resources/index.ts';
import { ResourceService } from './base.service.ts';
import { ProviderCredentials, ProviderCredentialsSchema } from './credentials.ts';
import { ProviderStore } from './store.ts';
import { CldctlTestResource } from './tests.ts';

export type ProviderResources<C extends ProviderCredentials> = {
  [T in ResourceType]?: ResourceService<T, C>;
};

type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

export abstract class Provider<
  C extends ProviderCredentials = ProviderCredentials,
> {
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
  abstract readonly resources: ProviderResources<C>;

  /**
   * A set of files that belong to the provider. These files should only be managed by the provider store.
   */
  readonly files: Record<string, string> = {};

  tests: CldctlTestResource<ProviderCredentials> = [];

  constructor(readonly name: string, readonly credentials: C, readonly providerStore: ProviderStore) {}

  public abstract testCredentials(): Promise<boolean>;

  public getResourceEntries(): Entries<
    {
      [T in ResourceType]: ResourceService<T, C>;
    }
  > {
    return Object.entries(this.resources) as Entries<
      {
        [T in ResourceType]: ResourceService<T, C>;
      }
    >;
  }

  public toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      type: this.type,
      credentials: this.credentials,
      files: this.files,
    };
  }
}
