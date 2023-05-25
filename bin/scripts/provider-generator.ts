import Mustache from 'mustache';
import * as path from 'std/path/mod.ts';

const __dirname = new URL('.', import.meta.url).pathname;
const providers_dir = path.join(__dirname, '../../src/@providers/');

const all_providers = [];
for await (const dirEntry of Deno.readDir(providers_dir)) {
  if (dirEntry.isDirectory) {
    all_providers.push(dirEntry.name);
  }
}

all_providers.sort((a, b) => a.localeCompare(b));

type ProviderTypeFileOptions = {
  provider_list: {
    name: string;
    slug: string;
  }[];
};

const provider_type_file_options: ProviderTypeFileOptions = {
  provider_list: [],
};

for (const type of all_providers) {
  provider_type_file_options.provider_list.push({
    name: type.replace(/-([\dA-Za-z])/g, (g) => g[1].toUpperCase()),
    slug: type,
  });
}

Deno.writeTextFileSync(
  path.join(providers_dir, 'supported-providers.ts'),
  Mustache.render(
    await Deno.readTextFile(
      path.join(providers_dir, 'supported-providers.ts.stache'),
    ),
    provider_type_file_options,
  ),
);
