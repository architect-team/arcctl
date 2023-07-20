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
  private providerStore: ProviderStore;
  private volume: string;
  private mountPath: string;

  public constructor(private options: TraefikTaskServiceOptions) {
    this.providerStore = options.providerStore;
    this.volume = options.volume;
    this.mountPath = options.mountPath;
  }

  private async getAccount(): Promise<Provider> {
    const account = await this.options.providerStore.get(this.options.account);
    if (!account) {
      throw new Error(`Invalid account name: ${this.options.account}`);
    } else if (!account.resources.task || !('apply' in account.resources.task)) {
      throw new Error(`The ${account.name} account cannot run tasks`);
    }
    return account;
  }

  private async getTaskService(): Promise<WritableResourceService<'task', any>> {
    const account = await this.getAccount();
    return account.resources.task as WritableResourceService<'task', any>;
  }

  public exec(cmd: string[]): Promise<{ stdout?: string; stderr?: string }> {
    return new Promise((resolve, reject) => {
      (async () => {
        let stdout: string | undefined;
        let stderr: string | undefined;
        (await this.getTaskService()).apply({
          type: 'task',
          account: (await this.getAccount()).name,
          image: 'alpine:latest',
          command: cmd,
          volume_mounts: [{
            mount_path: this.mountPath,
            volume: this.volume,
          }],
        }, {
          providerStore: this.providerStore,
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
      })();
    });
  }

  public async listConfigFiles(dir: string, suffix: string): Promise<string[]> {
    const { stdout } = await this.exec([
      '/bin/sh',
      '-c',
      'find ' + dir + '*' + suffix + ' -maxdepth 2 -type f',
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
      `mkdir -p $(dirname ${filename}) && echo -e \"${contents}\" > ${filename}`,
    ]);
  }
}
