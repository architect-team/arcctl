import * as path from 'std/path/mod.ts';
import { ConfigFile } from './configfile/file.ts';
import { NativeCredentialsClient } from './credentials/native-client.ts';

const CONFIG_FILE_NAME = 'config.json';
const CONFIG_FILE_DIR = '.docker';
const OLD_CONFIG_FILE = '.dockercfg';
const CONTEXTS_DIR = 'contexts';

export class Config {
  private static initConfigDir?: boolean;
  private static configDir?: string;
  private static homeDir?: string;

  private static resetHomeDir(): void {
    this.homeDir = undefined;
  }

  private static getHomeDir(): string {
    if (!this.homeDir) {
      this.homeDir = Deno.env.get('HOME') || '';
    }

    return this.homeDir;
  }

  private static resetConfigDir(): void {
    this.configDir = undefined;
    this.initConfigDir = false;
  }

  private static setConfigDir(): void {
    if (this.configDir) {
      return;
    }

    this.configDir = Deno.env.get('DOCKER_CONFIG') || '';
    if (!this.configDir) {
      this.configDir = path.join(this.getHomeDir(), CONFIG_FILE_DIR);
    }
  }

  public static dir(): string {
    if (!this.initConfigDir) {
      this.setConfigDir();
      this.initConfigDir = true;
    }

    return this.configDir || '';
  }

  public static contextStoreDir(): string {
    return path.join(this.dir(), CONTEXTS_DIR);
  }

  public static setDir(dir: string): void {
    this.configDir = dir;
  }

  public static path(...p: string[]): string {
    const full = path.join(this.dir(), ...p);
    if (!(full.startsWith(this.dir() + path.SEP))) {
      throw new Error(`path ${full} is outside of the root config directory ${this.dir()}`);
    }

    return full;
  }

  public static load(inputDir?: string): ConfigFile {
    const configDir = inputDir || this.dir();
    const filename = path.join(configDir, CONFIG_FILE_NAME);
    return new ConfigFile(filename);
  }

  public static async loadDefaultConfigFile(): Promise<ConfigFile> {
    const file = this.load();
    if (!file.containsAuth()) {
      switch (Deno.build.os) {
        case 'darwin': {
          const store = await new Promise<string>((resolve) => {
            const client = new NativeCredentialsClient('osxkeychain');
            client.version().then(() => resolve('osxkeychain')).catch(() => resolve(''));
          });

          file.credsStore = store;
          break;
        }
        case 'linux': {
          const store = await new Promise<string>((resolve) => {
            const passClient = new NativeCredentialsClient('pass');
            const secretServiceClient = new NativeCredentialsClient('secretservice');
            passClient.version().then(() => resolve('pass')).catch(() => {
              secretServiceClient.version().then(() => resolve('secretservice')).catch(() => resolve(''));
            });
          });

          file.credsStore = store;
          break;
        }
        case 'windows': {
          const store = await new Promise<string>((resolve) => {
            const client = new NativeCredentialsClient('wincred');
            client.version().then(() => resolve('wincred')).catch(() => resolve(''));
          });

          file.credsStore = store;
          break;
        }
      }
    }

    return file;
  }
}
