import axios from 'axios';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as os from 'os';
import path from 'path';
import { finished } from 'stream';
import { promisify } from 'util';
import { v4 } from 'uuid';
import { PluginArchitecture, PluginBundleType, PluginPlatform } from '../../src/plugins/plugin-types.js';
import TerraformPlugin from '../../src/plugins/terraform-plugin.js';

const tmpDirectory = os.tmpdir();

const plugin = new TerraformPlugin();
const versions = plugin.versions;

const downloadFile = (url: string) => {
  const location = path.join(tmpDirectory, '/' + v4());
  const writer = fs.createWriteStream(location);
  return axios({
    method: 'get',
    url: url,
    responseType: 'stream',
  }).then(async response => {
    response.data.pipe(writer);
    await promisify(finished)(writer);
    const fileBuffer = await fs.promises.readFile(location);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
  });
};

for (const [_, items] of Object.entries(versions)) {
  for (const item of items) {
    const hash = await downloadFile(item.url);
    console.log(hash);
    item.sha256 = hash;
    item.platform = 'PluginPlatform.' + PluginPlatform[item.platform];
    item.architecture = 'PluginArchitecture.' + PluginArchitecture[item.architecture];
    item.bundleType = 'PluginBundleType.' + PluginBundleType[item.bundleType];
  }
}

console.log(versions);
