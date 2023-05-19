import AdmZip from 'adm-zip';
import axios from 'axios';
import * as fs from 'fs';
import { finished } from 'stream';
import * as tar from 'tar';
import { promisify } from 'util';
import { PluginArchitecture, PluginBinary, PluginBundleType, PluginPlatform } from './plugin-types.js';

export default class PluginUtils {
  static async downloadFile(url: string, location: string, sha256: string): Promise<void> {
    const writer = fs.createWriteStream(location);
    return axios({
      method: 'get',
      url: url,
      responseType: 'stream',
    }).then(async response => {
      response.data.pipe(writer);
      await promisify(finished)(writer);
    });
  }

  static async extractFile(file: string, location: string, bundleType: PluginBundleType): Promise<void> {
    if (bundleType === PluginBundleType.TARGZ) {
      await tar.extract({ file, C: location });
    } else if (bundleType === PluginBundleType.ZIP) {
      const zip = new AdmZip(file);
      zip.extractAllTo(location);
    }
  }

  static getBinary(binaries: PluginBinary[], platform: PluginPlatform, architecture: PluginArchitecture): PluginBinary {
    for (const binary of binaries) {
      if (binary.platform === platform && binary.architecture === architecture) {
        return binary;
      }
    }
    throw new Error(`Unable to find proper binary for ${PluginPlatform[platform]}:${PluginArchitecture[architecture]}. Please contact Architect support for help.`);
  }
}

