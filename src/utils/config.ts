import { home_dir } from 'deps';
import * as path from 'std/path/mod.ts';
import { SupportedProviders } from '../@providers/index.ts';

const DEFAULT_CONFIG_DIRECTORY = path.join(home_dir() || '~', '.config', 'arcctl');

export type StateBackend = {
  provider: keyof typeof SupportedProviders;
  credentials: any;
  namespace: string;
};

export type CloudCtlConfigOptions = {
  configDirectory: string;
  stateBackend: StateBackend;
};

export default class ArcCtlConfig {
  private static dev: boolean;
  private static tfDirectory?: string;
  private static noCleanup: boolean;
  private static configOptions: CloudCtlConfigOptions = this.getDefaultConfig(DEFAULT_CONFIG_DIRECTORY);

  private static getDefaultStateBackend(directory: string): StateBackend {
    Deno.mkdirSync(directory, { recursive: true });
    return {
      provider: 'local',
      credentials: {
        directory,
      },
      namespace: 'arcctl-state',
    };
  }

  private static getDefaultConfig(directory: string): CloudCtlConfigOptions {
    return {
      configDirectory: directory,
      stateBackend: this.getDefaultStateBackend(directory),
    };
  }

  public static load(directory?: string): void {
    // Ensure path is resolved so that any binaries we execute are located properly.
    directory = path.resolve(directory || DEFAULT_CONFIG_DIRECTORY);

    try {
      if (Deno.statSync(path.join(directory, 'config.json')).isFile) {
        this.configOptions = JSON.parse(Deno.readTextFileSync(path.join(directory, 'config.json')));
        return;
      }
    } catch {
      // Means the file does not exist which is okay
    }
    this.configOptions = this.getDefaultConfig(directory);
  }

  public static getStateBackend(): StateBackend {
    return this.configOptions.stateBackend;
  }

  public static setStateBackend(stateBackend: StateBackend): void {
    this.configOptions.stateBackend = stateBackend;
  }

  public static save(): void {
    Deno.writeTextFileSync(
      path.join(this.getConfigDirectory(), 'config.json'),
      JSON.stringify(this.configOptions, null, 2),
    );
  }

  public static getConfigDirectory(): string {
    return this.configOptions.configDirectory;
  }

  public static getTerraformDirectory(): string {
    if (!this.tfDirectory) {
      this.tfDirectory = path.join(this.getConfigDirectory(), '/tf/', `/${crypto.randomUUID()}/`);
    }
    return this.tfDirectory!;
  }

  public static getTerraformCacheDirectory(): string {
    return path.join(this.getConfigDirectory(), '/tf-cache/');
  }

  public static getPluginDirectory(): string {
    return path.join(this.getConfigDirectory(), '/plugins/');
  }

  static setDev(dev: boolean): void {
    this.dev = dev;
  }

  static isDev(): boolean {
    return this.dev;
  }

  static setNoCleanup(noCleanup: boolean): void {
    this.noCleanup = noCleanup;
  }

  static isNoCleanup(): boolean {
    return this.noCleanup;
  }
}
