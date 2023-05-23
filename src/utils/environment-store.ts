import { Environment } from '../environments/environment.js';
import { parseEnvironment } from '../environments/parser.js';
import { Pipeline, PipelineStep } from '../pipeline/index.js';
import fs from 'fs';
import os from 'os';
import path from 'path';

export type EnvironmentRecord = {
  name: string;
  datacenter: string;
  graph: Pipeline;
  config?: Environment;
};

export class EnvironmentStore {
  private _environments?: EnvironmentRecord[];

  constructor(
    private config_dir: string = os.tmpdir(),
    private environment_filename: string = 'environments.json',
  ) {
    this.getEnvironments();
  }

  private get environments_config_file() {
    return path.join(this.config_dir, this.environment_filename);
  }

  saveFile(name: string, content: string): string {
    const file_path = path.join(this.config_dir, name);
    fs.mkdirSync(path.dirname(file_path), { recursive: true });
    fs.writeFileSync(file_path, content);
    return file_path;
  }

  async getEnvironment(name: string): Promise<EnvironmentRecord | undefined> {
    const records = await this.getEnvironments();
    return records.find((r) => r.name === name);
  }

  async getEnvironments(): Promise<EnvironmentRecord[]> {
    if (this._environments) {
      return this._environments;
    }

    try {
      const fileContents = fs.readFileSync(
        this.environments_config_file,
        'utf8',
      );
      const rawEnvironmentRecords = JSON.parse(fileContents);

      const environments: EnvironmentRecord[] = [];
      for (const raw of rawEnvironmentRecords) {
        const record: EnvironmentRecord = {
          name: raw.name,
          graph: new Pipeline({
            edges: raw.graph.edges,
            nodes: raw.graph.nodes.map((n: any) => new PipelineStep(n)),
          }),
          datacenter: raw.datacenter,
        };

        if (raw.config) {
          record.config = await parseEnvironment(raw.config);
        }

        environments.push(record);
      }

      this._environments = environments;
    } catch {
      this._environments = [];
    }

    return this._environments;
  }

  async saveEnvironment(input: EnvironmentRecord): Promise<void> {
    const allEnvironments = await this.getEnvironments();
    const foundIndex = allEnvironments.findIndex((e) => e.name === input.name);
    if (foundIndex >= 0) {
      allEnvironments[foundIndex] = input;
    } else {
      allEnvironments.push(input);
    }
    this.saveEnvironments(allEnvironments);
  }

  async removeEnvironment(name: string): Promise<void> {
    const environments = await this.getEnvironments();
    const foundIndex = environments.findIndex((e) => e.name === name);
    if (foundIndex < 0) {
      throw new Error(`No environment named ${name}`);
    }

    environments.splice(foundIndex, 1);
    return this.saveEnvironments(environments);
  }

  async saveEnvironments(records: EnvironmentRecord[]): Promise<void> {
    await fs.promises.mkdir(path.dirname(this.environments_config_file), {
      recursive: true,
    });
    await fs.promises.writeFile(
      this.environments_config_file,
      JSON.stringify(records, null, 2),
    );
  }
}
