import { ResourceOutputs } from '../../../@resources/types.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { TerraformResourceService } from '../../terraform.service.ts';
import { DigitaloceanCredentials } from '../credentials.ts';
import { DigitaloceanDatabaseUserModule } from '../modules/database-user.ts';
import { DigitaloceanProvider as TerraformDigitaloceanProvider } from '../.gen/providers/digitalocean/provider/index.ts';
import { Construct } from 'constructs';

export class DigitaloceanDatabaseUserService extends TerraformResourceService<'databaseUser', DigitaloceanCredentials> {
  readonly terraform_version = '1.4.5';
  readonly construct = DigitaloceanDatabaseUserModule;

  public configureTerraformProviders(scope: Construct): TerraformDigitaloceanProvider {
    return new TerraformDigitaloceanProvider(scope, 'digitalocean', {
      token: this.credentials.token,
    });
  }

  get(_id: string): Promise<ResourceOutputs['databaseUser'] | undefined> {
    throw new Error('Method not implemented.');
  }

  list(
    _filterOptions?: Partial<ResourceOutputs['databaseUser']>,
    _pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['databaseUser']>> {
    throw new Error('Method not implemented.');
  }
}
