import { Construct } from 'constructs';
import { createApiClient } from 'dots-wrapper';
import { ResourceOutputs } from '../../../@resources/types.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { ProviderStore } from '../../store.ts';
import { TerraformResourceService } from '../../terraform.service.ts';
import { DigitaloceanProvider as TerraformDigitaloceanProvider } from '../.gen/providers/digitalocean/provider/index.ts';
import { DigitaloceanCredentials } from '../credentials.ts';
import { DigitaloceanDatabaseSchemaModule } from '../modules/database-schema.ts';

export class DigitaloceanDatabaseSchemaService extends TerraformResourceService<
  'databaseSchema',
  DigitaloceanCredentials
> {
  private client: ReturnType<typeof createApiClient>;

  readonly terraform_version = '1.4.5';
  readonly construct = DigitaloceanDatabaseSchemaModule;

  constructor(accountName: string, credentials: DigitaloceanCredentials, providerStore: ProviderStore) {
    super(accountName, credentials, providerStore);
    this.client = createApiClient({ token: credentials.token });
  }

  public configureTerraformProviders(scope: Construct): TerraformDigitaloceanProvider {
    return new TerraformDigitaloceanProvider(scope, 'digitalocean', {
      token: this.credentials.token,
    });
  }

  get(_id: string): Promise<ResourceOutputs['databaseSchema'] | undefined> {
    throw new Error('Method not implemented.');
  }

  list(
    _filterOptions?: Partial<ResourceOutputs['databaseSchema']>,
    _pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['databaseSchema']>> {
    throw new Error('Method not implemented.');
  }
}
