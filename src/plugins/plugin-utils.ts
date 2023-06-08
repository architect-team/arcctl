import AdmZip from 'adm-zip';
import tar from 'tar';
import { PluginArchitecture, PluginBinary, PluginBundleType, PluginPlatform } from './plugin-types.ts';

export default class PluginUtils {
  static downloadFile(
    url: string,
    location: string,
    sha256: string,
  ): Promise<void> {
    return fetch(url).then(async (response) => {
      const file = await Deno.create(location);
      await response.body?.pipeTo(file.writable);
    });
  }

  static async extractFile(
    file: string,
    location: string,
    bundleType: PluginBundleType,
  ): Promise<void> {
    if (bundleType === PluginBundleType.TARGZ) {
      await tar.extract({ file, C: location });
    } else if (bundleType === PluginBundleType.ZIP) {
      const zip = new AdmZip(file);
      zip.extractAllTo(location);
    }
  }

  static getBinary(
    binaries: PluginBinary[],
    platform: PluginPlatform,
    architecture: PluginArchitecture,
  ): PluginBinary {
    for (const binary of binaries) {
      if (
        binary.platform === platform &&
        binary.architecture === architecture
      ) {
        return binary;
      }
    }
    throw new Error(
      `Unable to find proper binary for ${PluginPlatform[platform]}:${
        PluginArchitecture[architecture]
      }. Please contact Architect support for help.`,
    );
  }
}
