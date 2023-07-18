import winston from 'winston';
import { ProviderStore } from '../../@providers/store.ts';
import { Datacenter, DatacenterRecord } from '../../datacenters/index.ts';
import { Environment } from '../../environments/index.ts';
import { EnvironmentStore } from '../../environments/store.ts';
import { Pipeline } from '../../pipeline/index.ts';

export class EnvironmentUtils {
  constructor(
    private readonly environmentStore: EnvironmentStore,
    private readonly providerStore: ProviderStore,
  ) {}

  /**
   * Store the pipeline in the datacenter secret manager and then log
   * it to the environment store
   */
  public async saveEnvironment(
    datacenterName: string,
    environmentName: string,
    environment: Environment,
    pipeline: Pipeline,
  ): Promise<void> {
    await this.environmentStore.save({
      name: environmentName,
      datacenter: datacenterName,
      config: environment,
      lastPipeline: pipeline,
    });
  }

  public async removeEnvironment(name: string, datacenterName: string, datacenterConfig: Datacenter): Promise<void> {
    await this.environmentStore.remove(name);
  }

  public async applyEnvironment(
    name: string,
    datacenterRecord: DatacenterRecord,
    environment: Environment,
    pipeline: Pipeline,
    options?: {
      logger?: winston.Logger;
    },
  ): Promise<boolean> {
    return pipeline
      .apply({
        providerStore: this.providerStore,
        logger: options?.logger,
      })
      .then(async () => {
        await this.saveEnvironment(
          datacenterRecord.name,
          name,
          environment,
          pipeline,
        );

        return true;
      })
      .catch(async (err) => {
        console.error(err);
        await this.saveEnvironment(
          datacenterRecord.name,
          name,
          environment,
          pipeline,
        );
        return false;
      });
  }
}
