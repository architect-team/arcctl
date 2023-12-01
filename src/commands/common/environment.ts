import winston from 'winston';
import { Datacenter, DatacenterRecord } from '../../datacenters/index.ts';
import { Environment } from '../../environments/index.ts';
import { EnvironmentStore } from '../../environments/store.ts';
import { InfraGraph } from '../../graphs/index.ts';

export class EnvironmentUtils {
  constructor(
    private readonly environmentStore: EnvironmentStore,
  ) {}

  /**
   * Store the pipeline in the datacenter secret manager and then log
   * it to the environment store
   */
  public async saveEnvironment(
    datacenterName: string,
    environmentName: string,
    environment: Environment,
    graph: InfraGraph,
  ): Promise<void> {
    await this.environmentStore.save({
      name: environmentName,
      datacenter: datacenterName,
      config: environment,
      priorState: graph,
    });
  }

  public async removeEnvironment(name: string, datacenterName: string, datacenterConfig: Datacenter): Promise<void> {
    await this.environmentStore.remove(name);
  }

  public async applyEnvironment(
    name: string,
    datacenterRecord: DatacenterRecord,
    environment: Environment,
    graph: InfraGraph,
    options?: {
      logger?: winston.Logger;
      concurrency?: number;
    },
  ): Promise<boolean> {
    return graph
      .apply({ logger: options?.logger, concurrency: options?.concurrency })
      .toPromise()
      .then(async () => {
        await this.saveEnvironment(
          datacenterRecord.name,
          name,
          environment,
          graph,
        );

        return true;
      })
      .catch(async (err) => {
        console.error(err);
        await this.saveEnvironment(
          datacenterRecord.name,
          name,
          environment,
          graph,
        );
        return false;
      });
  }
}
