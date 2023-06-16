import AdmZip from "adm-zip";
import tar from "tar";
import {
  PluginArchitecture,
  PluginBinary,
  PluginBundleType,
  PluginPlatform,
} from "./plugin-types.ts";

export default class PluginUtils {
  static downloadFile(
    url: string,
    location: string,
  ): Promise<void> {
    return fetch(url).then(async (response) => {
      // TODO: replace with the following when file.writable is implemented - https://github.com/denoland/node_shims/blob/094b9cfa50aac59e7b113816ddd8bbda40493194/packages/shim-deno/src/deno/stable/classes/FsFile.ts#L65
      // const file = await Deno.create(location);
      // await response.body?.pipeTo(file.writable);

      const data = new Uint8Array(await response.arrayBuffer());
      const file = Deno.createSync(location);
      file.writeSync(data);
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
