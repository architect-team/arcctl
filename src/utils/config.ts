import { home_dir } from 'deps';
import * as path from 'std/path/mod.ts';

export default class CloudCtlConfig {
  private static dev: boolean;
  private static tfDirectory?: string;
  private static noCleanup: boolean;
  private static configDirectory?: string;

  public static setConfigDirectory(directory?: string): void {
    if (directory) {
      this.configDirectory = directory;
    } else {
      this.configDirectory = path.join(home_dir() || '~', '.config', 'arcctl');
    }
  }

  public static getConfigDirectory(): string {
    if (this.configDirectory) {
      return this.configDirectory;
    }
    throw Error('No config directory configured');
  }

  public static getTerraformDirectory(): string {
    if (!this.tfDirectory) {
      this.tfDirectory = path.join(this.getConfigDirectory(), '/tf/', `/${crypto.randomUUID()}/`);
    }
    return this.tfDirectory!;
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
