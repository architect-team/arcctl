import { Config } from '@oclif/core';
import path from 'path';
import { v4 } from 'uuid';

export default class CloudCtlConfig {
  public static oclifConfig: Config;
  private static dev: boolean;
  private static tfDirectory?: string;
  private static noCleanup: boolean;
  private static configDirectory?: string;

  public static setOclifConfig(config: Config): void {
    this.oclifConfig = config;
  }

  public static setConfigDirectory(directory: string): void {
    this.configDirectory = directory;
  }

  public static getConfigDirectory(): string {
    if (this.configDirectory) {
      return this.configDirectory;
    }
    return this.oclifConfig.configDir;
  }

  public static getTerraformDirectory(): string {
    if (!this.tfDirectory) {
      this.tfDirectory = path.join(this.getConfigDirectory(), '/tf/', `/${v4()}/`);
    }
    return this.tfDirectory;
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
