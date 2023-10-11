import { home_dir } from 'deps';
import * as path from 'std/path/mod.ts';
import { pathExistsSync } from './filesystem.ts';

const DEFAULT_CONFIG_DIRECTORY = path.join(home_dir() || '~', '.config', 'arcctl');

export type CloudCtlConfigOptions = {
  configDirectory: string;
};

export default class ArcCtlConfig {
  private static dev: boolean;
  private static tfDirectory?: string;
  private static noCleanup: boolean;
  private static configOptions: CloudCtlConfigOptions = this.getDefaultConfig(DEFAULT_CONFIG_DIRECTORY);

  private static getDefaultConfig(directory: string): CloudCtlConfigOptions {
    return {
      configDirectory: directory,
    };
  }

  public static load(directory?: string): void {
    directory = directory || DEFAULT_CONFIG_DIRECTORY;
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

  public static save(): void {
    const config_directory = this.getConfigDirectory();
    if (!pathExistsSync(config_directory)) {
      Deno.mkdirSync(config_directory, { recursive: true });
    }

    Deno.writeTextFileSync(
      path.join(config_directory, 'config.json'),
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
