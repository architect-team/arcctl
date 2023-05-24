import * as fs from 'fs';
import path from 'path';
import {
  ArchitectPlugin,
  PluginArchitecture,
  PluginBundleType,
  PluginPlatform,
} from './plugin-types.ts';
import PluginUtils from './plugin-utils.ts';

type Dictionary<T> = { [key: string]: T };

export default class PluginManager {
  private static readonly plugins: Dictionary<ArchitectPlugin> = {};

  private static readonly ARCHITECTUREMAP: Dictionary<PluginArchitecture> = {
    x64: PluginArchitecture.AMD64,
    arm64: PluginArchitecture.ARM64,
  };

  private static readonly OPERATINSYSTEMMAP: Dictionary<PluginPlatform> = {
    win32: PluginPlatform.WINDOWS,
    darwin: PluginPlatform.DARWIN,
    linux: PluginPlatform.LINUX,
  };

  private static getPlatform(): PluginPlatform {
    return this.OPERATINSYSTEMMAP[process.platform];
  }

  private static getArchitecture(): PluginArchitecture {
    return this.ARCHITECTUREMAP[process.arch];
  }

  private static async removeOldPluginVersions(
    pluginDirectory: string,
    plugin: ArchitectPlugin,
  ) {
    if (!fs.existsSync(pluginDirectory)) {
      return;
    }
    const usedVersions = Object.keys(plugin.versions);
    const downloadedVersions = await fs.promises.readdir(pluginDirectory);
    for (const downloadedVersion of downloadedVersions) {
      if (usedVersions.includes(downloadedVersion)) {
        continue;
      }
      await fs.promises.rmdir(path.join(pluginDirectory, downloadedVersion), {
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
    const currentPluginDirectory = path.join(
      pluginDirectory,
      `/${plugin.name}`,
    );
    const versionPath = path.join(currentPluginDirectory, `/${version}`);

    await this.removeOldPluginVersions(currentPluginDirectory, plugin);
    await fs.promises.mkdir(versionPath, { recursive: true });

    const binary = PluginUtils.getBinary(
      plugin.versions[version],
      this.getPlatform(),
      this.getArchitecture(),
    );
    const downloadedFilePath = path.join(
      versionPath,
      `/${plugin.name}.${
        binary.bundleType === PluginBundleType.ZIP ? 'zip' : 'tar.gz'
      }`,
    );

    const executablePath = path.join(versionPath, `/${binary.executablePath}`);
    if (!fs.existsSync(executablePath)) {
      await PluginUtils.downloadFile(
        binary.url,
        downloadedFilePath,
        binary.sha256,
      );
      await PluginUtils.extractFile(
        downloadedFilePath,
        versionPath,
        binary.bundleType,
      );
      await fs.promises.chmod(executablePath, '755');
      await fs.promises.rm(downloadedFilePath);
    }

    await plugin.setup(
      versionPath,
      PluginUtils.getBinary(
        plugin.versions[version],
        this.getPlatform(),
        this.getArchitecture(),
      ),
    );

    this.plugins[id] = plugin;
    return plugin as T;
  }
}
