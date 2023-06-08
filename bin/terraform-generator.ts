import * as crypto from 'https://deno.land/std@0.177.0/node/crypto.ts';
import {
  PluginArchitecture,
  PluginBundleType,
  PluginPlatform,
} from '../src/plugins/plugin-types.ts';
import TerraformPlugin from '../src/plugins/terraform-plugin.ts';

const tmpDirectory = Deno.makeTempDirSync({ prefix: crypto.randomUUID() });

const plugin = new TerraformPlugin();
const versions = plugin.versions;

const downloadFile = (url: string) => {
  return fetch(url).then(async (response) => {
    // Write the file
    const file = await Deno.create(tmpDirectory);
    await response.body?.pipeTo(file.writable);

    // Create and return the hash
    const fileBuffer = await Deno.readFile(tmpDirectory);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.setEncoding('utf-8').digest('hex') as string;
  });
};

for (const [_, items] of Object.entries(versions)) {
  for (const item of items) {
    const hash = await downloadFile(item.url);
    console.log(hash);
    item.sha256 = hash;
    item.platform = 'PluginPlatform.' + PluginPlatform[item.platform];
    item.architecture =
      'PluginArchitecture.' + PluginArchitecture[item.architecture];
    item.bundleType = 'PluginBundleType.' + PluginBundleType[item.bundleType];
  }
}

console.log(versions);
