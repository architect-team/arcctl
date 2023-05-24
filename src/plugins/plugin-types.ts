import { ExecaChildProcess, Options } from 'npm:execa';

export enum PluginArchitecture {
  AMD64,
  ARM64,
}

export enum PluginPlatform {
  LINUX,
  DARWIN,
  WINDOWS,
}

export enum PluginBundleType {
  ZIP,
  TARGZ,
}

export interface PluginOptions {
  stdout: boolean;
  execaOptions?: Options<string>;
}

export interface PluginBinary {
  url: string;
  architecture: PluginArchitecture;
  platform: PluginPlatform;
  sha256: string;
  bundleType: PluginBundleType;
  executablePath: string;
}

export interface ArchitectPlugin {
  versions: { [version: string]: PluginBinary[] };
  name: string;
  setup(pluginDirectory: string, binary: PluginBinary): Promise<void>;
  exec(args: string[], opts: PluginOptions): ExecaChildProcess<string>;
}
