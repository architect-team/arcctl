import { existsSync } from 'std/fs/exists.ts';
import * as path from 'std/path/mod.ts';
import { ArchitectPlugin, PluginArchitecture, PluginBundleType, PluginPlatform } from './plugin-types.ts';
import PluginUtils from './plugin-utils.ts';

type Dictionary<T> = { [key: string]: T };

export default class PluginManager {
  private static readonly plugins: Dictionary<ArchitectPlugin> = {};

  private static readonly ARCHITECTUREMAP: Dictionary<PluginArchitecture> = {
    x86_64: PluginArchitecture.AMD64,
    aarch64: PluginArchitecture.ARM64,
  };

  private static readonly OPERATINSYSTEMMAP: Dictionary<PluginPlatform> = {
    windows: PluginPlatform.WINDOWS,
    darwin: PluginPlatform.DARWIN,
    linux: PluginPlatform.LINUX,
  };

  private static getPlatform(): PluginPlatform {
    return this.OPERATINSYSTEMMAP[Deno.build.os];
  }

  private static getArchitecture(): PluginArchitecture {
    return this.ARCHITECTUREMAP[Deno.build.arch];
  }

  private static async removeOldPluginVersions(pluginDirectory: string, plugin: ArchitectPlugin) {
    if (!existsSync(pluginDirectory)) {
      return;
    }
    const usedVersions = Object.keys(plugin.versions);
    const downloadedVersions = await Deno.readDir(pluginDirectory);
    for await (const downloadedVersion of downloadedVersions) {
      if (usedVersions.includes(downloadedVersion.name)) {
        continue;
      }
      await Deno.remove(path.join(pluginDirectory, downloadedVersion.name), {
        recursive: true,
      });
    }
  }

  static async getPlugin<T extends ArchitectPlugin>(
    configDirectory: string,
    version: string,
    ctor: { new (): T },
  ): Promise<T> {
    const id = `${ctor.name}_${version}`;
    if (this.plugins[id]) {
      return this.plugins[id] as T;
    }
    const plugin = new ctor();
    if (!plugin.versions[version]) {
      throw new Error(`Unable to find version ${version} of ${ctor.name}`);
    }
    const pluginDirectory = configDirectory;
    const currentPluginDirectory = path.join(pluginDirectory, `/${plugin.name}`);
    const versionPath = path.join(currentPluginDirectory, `/${version}`);

    await this.removeOldPluginVersions(currentPluginDirectory, plugin);
    await Deno.mkdir(versionPath, { recursive: true });

    const binary = PluginUtils.getBinary(plugin.versions[version], this.getPlatform(), this.getArchitecture());
    const downloadedFilePath = path.join(
      versionPath,
      `/${plugin.name}.${binary.bundleType === PluginBundleType.ZIP ? 'zip' : 'tar.gz'}`,
    );

    const executablePath = path.join(versionPath, `/${binary.executablePath}`);
    // if (!existsSync(executablePath)) { // TODO: comment about why this was changed - related to https://github.com/denoland/deno_std/issues/1216, https://github.com/denoland/deno_std/issues/2494
      await PluginUtils.downloadFile(binary.url, downloadedFilePath, binary.sha256);
      await PluginUtils.extractFile(downloadedFilePath, versionPath, binary.bundleType);
      try {
        await Deno.chmod(executablePath, 0o755);
      } catch {} // TODO: add a real error or something here
      try {
        await Deno.remove(downloadedFilePath);
      } catch {} // TODO: add a real error or something here
    // }

    await plugin.setup(
      versionPath,
      PluginUtils.getBinary(plugin.versions[version], this.getPlatform(), this.getArchitecture()),
    );

    this.plugins[id] = plugin;
    return plugin as T;
  }
}
