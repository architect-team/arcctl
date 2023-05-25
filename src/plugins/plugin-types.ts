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
  commandOptions?: Deno.CommandOptions;
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
  exec(args: string[], opts: PluginOptions): Deno.ChildProcess;
}
