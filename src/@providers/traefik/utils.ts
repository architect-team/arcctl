import * as path from 'std/path/mod.ts';
import { WritableResourceService } from '../base.service.ts';
import { Provider } from '../provider.ts';
import { ProviderStore } from '../store.ts';

export type TraefikTaskServiceOptions = {
  account: string;
  providerStore: ProviderStore;
  volume: string;
  mountPath: string;
};

export class TraefikTaskService {
  private account: Provider;
  private taskService: WritableResourceService<'task', any>;
  private providerStore: ProviderStore;
  private volume: string;
  private mountPath: string;

  public constructor(options: TraefikTaskServiceOptions) {
    const account = options.providerStore.getProvider(options.account);
    if (!account) {
      throw new Error(`Invalid account name: ${options.account}`);
    } else if (!account.resources.task || !('apply' in account.resources.task)) {
      throw new Error(`The ${account.name} account cannot run tasks`);
    }

    this.account = account;
    this.taskService = account.resources.task as WritableResourceService<'task', any>;
    this.providerStore = options.providerStore;
    this.volume = options.volume;
    this.mountPath = options.mountPath;
  }

  public exec(cmd: string[]): Promise<{ stdout?: string; stderr?: string }> {
    return new Promise((resolve, reject) => {
      let stdout: string | undefined;
      let stderr: string | undefined;
      this.taskService.apply({
        type: 'task',
        account: this.account.name,
        image: 'alpine:latest',
        command: cmd,
        volume_mounts: [{
          mount_path: this.mountPath,
          volume: this.volume,
        }],
      }, {
        providerStore: this.providerStore,
        cwd: path.resolve('.terraform'),
        id: 'list-traefik-services',
      })
        .subscribe({
          next: (res) => {
            stdout = res.outputs?.stdout;
            stderr = res.outputs?.stderr;
          },
          complete: () => {
            resolve({
              stdout: stdout?.replace(/^\s+|\s+$/g, '') || '',
              stderr: stderr?.replace(/^\s+|\s+$/g, '') || '',
            });
          },
          error: reject,
        });
    });
  }

  public async listAllFiles(dir: string): Promise<string[]> {
    const { stdout } = await this.exec(['/bin/sh', '-c', `ls ${dir}`]);
    return stdout ? stdout.split('\n').filter((item) => Boolean(item)) : [];
  }

  public async listConfigFiles(dir: string, suffix: string): Promise<string[]> {
    const allFiles = await this.listAllFiles(dir);
    if (allFiles.length <= 0) {
      return allFiles;
    }

    const { stdout } = await this.exec([
      '/bin/sh',
      '-c',
      'find ' + dir + '*' + suffix + ' -maxdepth 1 -type f',
    ]);
    return stdout ? stdout.split('\n').filter((item) => Boolean(item)) : [];
  }

  public async getContents(filename: string) {
    const { stdout } = await this.exec(['/bin/sh', '-c', 'cat ' + filename]);
    return stdout || '';
  }

  public deleteFile(filename: string) {
    return this.exec(['/bin/sh', '-c', 'rm ' + filename]);
  }

  public writeFile(filename: string, contents: string) {
    return this.exec([
      '/bin/sh',
      '-c',
      `echo -e \"${contents}\" > ${filename}`,
    ]);
  }
}
