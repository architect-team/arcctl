import { Datacenter } from './datacenter.ts';
import { parseDatacenter } from './parser.ts';
import fs from 'fs';
import os from 'os';
import path from 'path';

export type DatacenterRecord = {
  name: string;
  config: Datacenter;

  // Refers to a secret containing the last pipeline that was run
  lastPipeline: {
    account: string;
    secret: string;
  };
};

export class DatacenterStore {
  private _records?: DatacenterRecord[];

  constructor(private config_dir: string = os.tmpdir(), private datacenter_filename: string = 'datacenters.json') {
    this.find();
  }

  private get datacenters_config_file() {
    return path.join(this.config_dir, this.datacenter_filename);
  }

  private async saveAll(datacenters: DatacenterRecord[]): Promise<void> {
    await fs.promises.mkdir(path.dirname(this.datacenters_config_file), {
      recursive: true,
    });
    await fs.promises.writeFile(this.datacenters_config_file, JSON.stringify(datacenters, null, 2));
  }

  public async find(): Promise<DatacenterRecord[]> {
    if (this._records) {
      return this._records;
    }

    let rawDatacenters = [];
    try {
      const fileContents = fs.readFileSync(this.datacenters_config_file, 'utf8');
      rawDatacenters = JSON.parse(fileContents);
    } catch {
      this._records = [];
    }

    const datacenters: DatacenterRecord[] = [];
    for (const raw of rawDatacenters) {
      datacenters.push({
        name: raw.name,
        config: await parseDatacenter(raw.config),
        lastPipeline: raw.lastPipeline,
      });
    }

    this._records = datacenters;

    return this._records;
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
