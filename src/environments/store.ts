import { InfraGraph } from '../graphs/index.ts';
import { BaseStore } from '../utils/base-store.ts';
import { Environment } from './environment.ts';
import { parseEnvironment } from './parser.ts';

export type EnvironmentRecord = {
  name: string;
  datacenter: string;
  config?: Environment;
  priorState: InfraGraph;
};

export class EnvironmentStore extends BaseStore<EnvironmentRecord> {
  constructor() {
    super('environments');
  }

  public async find(): Promise<EnvironmentRecord[]> {
    await this.load(async (raw: any) => {
      return {
        name: raw.name,
        datacenter: raw.datacenter,
        config: raw.config ? await parseEnvironment(raw.config) : undefined,
        priorState: new InfraGraph(raw.priorState),
      };
    });
    return this._records!;
  }

  public async get(name: string): Promise<EnvironmentRecord | undefined> {
    const environments = await this.find();
    return environments.find((record) => record.name === name);
  }

  public async save(input: EnvironmentRecord): Promise<void> {
    const allEnvironments = await this.find();
    const foundIndex = allEnvironments.findIndex((d) => d.name === input.name);
    if (foundIndex >= 0) {
      allEnvironments[foundIndex] = input;
    } else {
      allEnvironments.push(input);
    }
    await this.saveAll(allEnvironments);
  }

  public async remove(name: string): Promise<void> {
    const allEnvironments = await this.find();
    const foundIndex = allEnvironments.findIndex((d) => d.name === name);
    if (foundIndex < 0) {
      throw new Error(`The ${name} environment was not found`);
    }

    allEnvironments.splice(foundIndex, 1);
    await this.saveAll(allEnvironments);
  }
}
