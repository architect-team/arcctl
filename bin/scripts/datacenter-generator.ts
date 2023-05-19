#!/usr/bin/env ts-node
import { execa } from 'execa';
import fs from 'fs/promises';
import Mustache from 'mustache';
import path from 'path';
import url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const datacenters_dir = path.join(__dirname, '../../src/datacenters');

const all_versions = (
  await fs.readdir(datacenters_dir, { withFileTypes: true })
)
  .filter((dirent) => dirent.isDirectory() && dirent.name !== '__tests__')
  .map((dirent) => dirent.name);

fs.writeFile(
  path.join(datacenters_dir, 'schema.ts'),
  Mustache.render(
    await fs.readFile(path.join(datacenters_dir, 'schema.ts.stache'), 'utf-8'),
    {
      versions: all_versions,
    },
  ),
);

let { stdout: type_schema_string } = await execa(
  path.join(__dirname, '../../node_modules/.bin/ts-json-schema-generator'),
  [
    '--path',
    path.join(datacenters_dir, './schema.ts'),
    '--type',
    'DatacenterSchema',
    '--tsconfig',
    path.join(__dirname, '../../tsconfig.json'),
  ],
);

let type_schema = JSON.parse(type_schema_string);
if (type_schema.definitions.DatacenterSchema.anyOf) {
  type_schema = {
    oneOf: type_schema.definitions.DatacenterSchema.anyOf,
    $schema: 'https://json-schema.org/draft/2019-09/schema',
    $id: 'https://architect.io/.schemas/datacenter.json',
    type: 'object',
    required: ['version'],
    discriminator: {
      propertyName: 'version',
    },
  };
} else {
  type_schema.$schema = 'https://json-schema.org/draft/2019-09/schema';
  type_schema.$id = 'https://architect.io/.schemas/datacenter.json';
}

await fs.writeFile(
  path.join(datacenters_dir, './datacenter.schema.json'),
  JSON.stringify(type_schema, null, 2),
);
