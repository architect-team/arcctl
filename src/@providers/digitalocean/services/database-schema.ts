import { ResourceOutputs } from '../../../@resources/types.js';
import { PagingOptions, PagingResponse } from '../../../utils/paging.js';
import { TerraformResourceService } from '../../terraform.service.js';
import { DigitaloceanCredentials } from '../credentials.js';
import { DigitaloceanDatabaseSchemaModule } from '../modules/database-schema.js';
import { createApiClient } from 'dots-wrapper';

export class DigitaloceanDatabaseSchemaService extends TerraformResourceService<
  'databaseSchema',
  DigitaloceanCredentials
> {
  private client: ReturnType<typeof createApiClient>;

  constructor(credentials: DigitaloceanCredentials) {
    super();
    this.client = createApiClient({ token: credentials.token });
  }

  get(id: string): Promise<ResourceOutputs['databaseSchema'] | undefined> {
    throw new Error('Method not implemented.');
  }

  list(
    filterOptions?: Partial<ResourceOutputs['databaseSchema']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['databaseSchema']>> {
    throw new Error('Method not implemented.');
  }

  readonly construct = DigitaloceanDatabaseSchemaModule;
}
