import { CloudEdge } from '../cloud-graph/edge.ts';
import { Pipeline } from '../pipeline/pipeline.ts';
import { PipelineStep } from '../pipeline/step.ts';
import { BaseStore } from '../secrets/base-store.ts';
import { SecretStore } from '../secrets/store.ts';
import { Datacenter } from './datacenter.ts';
import { parseDatacenter } from './parser.ts';

export type DatacenterRecord = {
  name: string;
  config: Datacenter;
  lastPipeline: Pipeline;
};

export class DatacenterStore extends BaseStore<DatacenterRecord> {
  constructor(
    secretStore: SecretStore,
  ) {
    super('datacenters', secretStore);
    this.find();
  }

  public async find(): Promise<DatacenterRecord[]> {
    await this.load(async (raw: any) => {
      const pipeline = new Pipeline({
        steps: raw.lastPipeline.steps.map((step: any) => new PipelineStep(step)),
        edges: raw.lastPipeline.edges.map((edge: any) => new CloudEdge(edge)),
      });
      return {
        name: raw.name,
        config: await parseDatacenter(raw.config),
        lastPipeline: pipeline,
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
    this.saveAll(allDatacenters);
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
