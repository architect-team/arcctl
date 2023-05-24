#!/usr/bin/env ts-node
import fs from 'fs/promises';
import Mustache from 'mustache';
import path from 'path';
import url from 'url';

const __dirname = new URL('.', import.meta.url).pathname;
const providersDir = path.join(__dirname, '../../src/@providers/');

const allProviders = (await fs.readdir(providersDir, { withFileTypes: true }))
  // eslint-disable-next-line unicorn/no-await-expression-member
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name);

type ProviderTypeFileOptions = {
  provider_list: {
    name: string;
    slug: string;
  }[];
};

const providerTypeFileOptions: ProviderTypeFileOptions = {
  provider_list: [],
};

for (const type of allProviders) {
  providerTypeFileOptions.provider_list.push({
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
