import { Environment } from './environment.js';
import { parseEnvironment } from './parser.js';
import fs from 'fs';
import os from 'os';
import path from 'path';

export type EnvironmentRecord = {
  name: string;
  datacenter: string;
  config?: Environment;
};

export class EnvironmentStore {
  private _records?: EnvironmentRecord[];

  constructor(
    private config_dir: string = os.tmpdir(),
    private environment_filename: string = 'environments.json',
  ) {
    this.find();
  }

  private get environments_config_file() {
    return path.join(this.config_dir, this.environment_filename);
  }

  private async saveAll(environments: EnvironmentRecord[]): Promise<void> {
    await fs.promises.mkdir(path.dirname(this.environments_config_file), {
      recursive: true,
    });
    await fs.promises.writeFile(
      this.environments_config_file,
      JSON.stringify(environments, null, 2),
    );
  }

  public async find(): Promise<EnvironmentRecord[]> {
    if (this._records) {
      return this._records;
    }

    let rawEnvironments = [];
    try {
      const fileContents = fs.readFileSync(
        this.environments_config_file,
        'utf8',
      );
      rawEnvironments = JSON.parse(fileContents);
    } catch {
      this._records = [];
    }

    const environments: EnvironmentRecord[] = [];
    for (const raw of rawEnvironments) {
      environments.push({
        name: raw.name,
        datacenter: raw.datacenter,
        config: raw.config ? await parseEnvironment(raw.config) : undefined,
      });
    }

    this._records = environments;

    return this._records;
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
    this.saveAll(allEnvironments);
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