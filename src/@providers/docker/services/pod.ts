import { ResourceOutputs } from '../../../@resources/index.ts';
import { exec } from '../../../utils/command.ts';
import { PagingOptions, PagingResponse } from '../../../utils/paging.ts';
import { ResourceService } from '../../base.service.ts';
import { DockerCredentials } from '../credentials.ts';
import { DockerInspectionResults, DockerPsItem } from '../types.ts';

export class DockerPodService extends ResourceService<'pod', DockerCredentials> {
  private async inspect(id: string): Promise<DockerInspectionResults | undefined> {
    const { stdout } = await exec('docker', { args: ['inspect', id] });
    const rawContents: DockerInspectionResults[] = JSON.parse(stdout);
    return rawContents.length > 0 ? rawContents[0] : undefined;
  }

  async get(id: string): Promise<ResourceOutputs['pod'] | undefined> {
    const res = await this.inspect(id);
    return res
      ? {
        id: res.Id,
        labels: res.Config.Labels,
      }
      : undefined;
  }

  async list(
    filterOptions?: Partial<ResourceOutputs['pod']>,
    pagingOptions?: Partial<PagingOptions>,
  ): Promise<PagingResponse<ResourceOutputs['pod']>> {
    const args = ['ps', '--format', 'json'];

    const labels = filterOptions?.labels || {};
    labels['io.architect'] = 'arcctl';
    for (const [key, value] of Object.entries(labels)) {
      let contents = key;
      if (value) {
        contents += `=${value}`;
      }

      args.push('--filter', `label=${contents}`);
    }

    const { stdout } = await exec('docker', { args });
    const rows = stdout.includes('\n') ? stdout.split('\n').filter((row) => Boolean(row)) : [stdout];
    const rawOutput: DockerPsItem[] = JSON.parse(`[${rows.join(',')}]`);

    const inspectedResults = await Promise.all(rawOutput.map(async (row) => {
      const res = await this.get(row.Names);
      return res!;
    }));

    return {
      total: inspectedResults.length,
      rows: inspectedResults,
    };
  }
}
