import { Pipeline } from '../pipeline/pipeline.ts';
import { BaseStore } from '../secrets/base-store.ts';
import { StateBackend } from '../utils/config.ts';
import { Datacenter } from './datacenter.ts';
import { parseDatacenter } from './parser.ts';

export type DatacenterRecord = {
  name: string;
  config: Datacenter;
  lastPipeline: Pipeline;
};

export class DatacenterStore extends BaseStore<DatacenterRecord> {
  constructor(
    stateBackend: StateBackend,
  ) {
    super('datacenters', stateBackend);
    this.find();
  }

  public async find(): Promise<DatacenterRecord[]> {
    await this.load(async (raw: any) => {
      return {
        name: raw.name,
        config: await parseDatacenter(raw.config),
        lastPipeline: new Pipeline(raw.lastPipeline),
      };
    });

    return this._records!;
  }

  public async get(name: string): Promise<DatacenterRecord | undefined> {
    const datacenters = await this.find();
    return datacenters.find((record) => record.name === name);
  }

  public async save(input: DatacenterRecord): Promise<void> {
    const allDatacenters = await this.find();
    const foundIndex = allDatacenters.findIndex((d) => d.name === input.name);
    if (foundIndex >= 0) {
      allDatacenters[foundIndex] = input;
    } else {
      allDatacenters.push(input);
    }
    await this.saveAll(allDatacenters);
  }

  public async remove(name: string): Promise<void> {
    const allDatacenters = await this.find();
    const foundIndex = allDatacenters.findIndex((d) => d.name === name);
    if (foundIndex < 0) {
      throw new Error(`The ${name} datacenter was not found`);
    }

    allDatacenters.splice(foundIndex, 1);
    await this.saveAll(allDatacenters);
  }
}
