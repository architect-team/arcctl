import { Datacenter } from '../datacenters/datacenter.ts';
import { parseDatacenter } from '../datacenters/parser.ts';
import fs from 'fs';
import os from 'os';
import path from 'path';

export type DatacenterRecord = {
  name: string;
  config: Datacenter;
};

export class DatacenterStore {
  private _datacenters?: DatacenterRecord[];

  constructor(
    private config_dir: string = os.tmpdir(),
    private datacenter_filename: string = 'datacenters.json',
  ) {
    this.getDatacenters();
  }

  private get datacenters_config_file() {
    return path.join(this.config_dir, this.datacenter_filename);
  }

  saveFile(name: string, content: string): string {
    const file_path = path.join(this.config_dir, name);
    fs.mkdirSync(path.dirname(file_path), { recursive: true });
    fs.writeFileSync(file_path, content);
    return file_path;
  }

  async getDatacenter(name: string): Promise<DatacenterRecord | undefined> {
    const datacenters = await this.getDatacenters();
    return datacenters.find((record) => record.name === name);
  }

  async getDatacenters(): Promise<DatacenterRecord[]> {
    if (this._datacenters) {
      return this._datacenters;
    }

    try {
      const fileContents = fs.readFileSync(
        this.datacenters_config_file,
        'utf8',
      );
      const rawDatacenters = JSON.parse(fileContents);

      const datacenters: DatacenterRecord[] = [];
      for (const raw of rawDatacenters) {
        datacenters.push({
          name: raw.name,
          config: await parseDatacenter(raw.config),
        });
      }

      this._datacenters = datacenters;
    } catch {
      this._datacenters = [];
    }

    return this._datacenters;
  }

  async saveDatacenter(input: DatacenterRecord): Promise<void> {
    const allDatacenters = await this.getDatacenters();
    const foundIndex = allDatacenters.findIndex((d) => d.name === input.name);
    if (foundIndex >= 0) {
      allDatacenters[foundIndex] = input;
    } else {
      allDatacenters.push(input);
    }
    this.saveDatacenters(allDatacenters);
  }

  async removeDatacenter(name: string): Promise<void> {
    const allDatacenters = await this.getDatacenters();
    const foundIndex = allDatacenters.findIndex((d) => d.name === name);
    if (foundIndex < 0) {
      throw new Error(`The ${name} datacenter was not found`);
    }

    allDatacenters.splice(foundIndex, 1);
    await this.saveDatacenters(allDatacenters);
  }

  async saveDatacenters(datacenters: DatacenterRecord[]): Promise<void> {
    await fs.promises.mkdir(path.dirname(this.datacenters_config_file), {
      recursive: true,
    });
    await fs.promises.writeFile(
      this.datacenters_config_file,
      JSON.stringify(datacenters, null, 2),
    );
  }
}
