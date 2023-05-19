
import fs from 'fs/promises';
import path from 'path';
import url from 'url';
// eslint-disable-next-line node/no-unpublished-import
import Mustache from 'mustache';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const providersDir = path.join(__dirname, '../../src/@providers/');

const allProviders = (await fs.readdir(providersDir, { withFileTypes: true }))
  // eslint-disable-next-line unicorn/no-await-expression-member
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name);

type ProviderTypeFileOptions = {
  providerList: {
    name: string;
    slug: string;
  }[];
};

const providerTypeFileOptions: ProviderTypeFileOptions = {
  providerList: [],
};

for (const type of allProviders) {
  providerTypeFileOptions.providerList.push({
    name: type.replace(/-([\dA-Za-z])/g, (g) => g[1].toUpperCase()),
    slug: type,
  });
}

fs.writeFile(
  path.join(providersDir, 'supported-providers.ts'),
  Mustache.render(
    await fs.readFile(
      path.join(providersDir, 'supported-providers.ts.stache'),
      'utf8',
    ),
    providerTypeFileOptions,
  ),
);
