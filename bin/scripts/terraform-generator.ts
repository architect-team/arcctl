import {
  PluginArchitecture,
  PluginBundleType,
  PluginPlatform,
} from '../../src/plugins/plugin-types.ts';
import TerraformPlugin from '../../src/plugins/terraform-plugin.ts';
import * as crypto from 'https://deno.land/std@0.177.0/node/crypto.ts';
import tmpDir from 'https://deno.land/x/tmp_dir@v0.1.0/mod.ts';
import * as path from 'https://deno.land/std@0.188.0/path/mod.ts';

const tmpDirectory = tmpDir() || '/tmp';

const plugin = new TerraformPlugin();
const versions = plugin.versions;

const downloadFile = (url: string) => {
  const location = path.join(tmpDirectory, '/' + crypto.randomUUID());
  return fetch(url).then(async (response) => {
    // Write the file
    const file = await Deno.create(location);
    await response.body?.pipeTo(file.writable);

    // Create and return the hash
    const fileBuffer = await Deno.readFile(location);
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
