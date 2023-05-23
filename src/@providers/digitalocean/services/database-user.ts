import { ResourceOutputs } from '../../../@resources/types.js';
import { PagingOptions, PagingResponse } from '../../../utils/paging.js';
import { TerraformResourceService } from '../../terraform.service.js';
import { DigitaloceanCredentials } from '../credentials.js';
import { DigitaloceanDatabaseUserModule } from '../modules/database-user.js';
import { createApiClient } from 'dots-wrapper';

export class DigitaloceanDatabaseUserService extends TerraformResourceService<
  'databaseUser',
  DigitaloceanCredentials
> {
  private client: ReturnType<typeof createApiClient>;

  constructor(credentials: DigitaloceanCredentials) {
    super();
    this.client = createApiClient({ token: credentials.token });
  }

  get(id: string): Promise<ResourceOutputs['databaseUser'] | undefined> {
    throw new Error('Method not implemented.');
  }

  list(
    filterOptions?: Partial<ResourceOutputs['databaseUser']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['databaseUser']>> {
    throw new Error('Method not implemented.');
  }

  readonly construct = DigitaloceanDatabaseUserModule;
}
