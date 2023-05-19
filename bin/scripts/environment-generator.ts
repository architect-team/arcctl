#!/usr/bin/env ts-node

import url from 'url';
import path from 'path';
import fs from 'fs/promises';
import { execa } from 'execa';
import Mustache from 'mustache';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const environments_dir = path.join(__dirname, '../../src/environments');

const all_versions = (
  await fs.readdir(environments_dir, { withFileTypes: true })
)
  .filter((dirent) => dirent.isDirectory() && dirent.name !== '__tests__')
  .map((dirent) => dirent.name);

fs.writeFile(
  path.join(environments_dir, 'schema.ts'),
  Mustache.render(
    await fs.readFile(path.join(environments_dir, 'schema.ts.stache'), 'utf-8'),
    {
      versions: all_versions,
    }
  )
);

let { stdout: type_schema_string } = await execa(
  path.join(__dirname, '../../node_modules/.bin/ts-json-schema-generator'),
  [
    '--path',
    path.join(environments_dir, './schema.ts'),
    '--expose',
    'none',
    '--type',
    'EnvironmentSchema',
    '--tsconfig',
    path.join(__dirname, '../../tsconfig.json'),
  ]
);

let type_schema = JSON.parse(type_schema_string);
if (type_schema.definitions.EnvironmentSchema.anyOf) {
  type_schema = {
    oneOf: type_schema.definitions.EnvironmentSchema.anyOf,
    $schema: 'https://json-schema.org/draft/2019-09/schema',
    $id: 'https://architect.io/.schemas/environment.json',
    type: 'object',
    required: ['version'],
    discriminator: {
      propertyName: 'version',
    },
  };
} else {
  type_schema.$schema = 'https://json-schema.org/draft/2019-09/schema';
  type_schema.$id = 'https://architect.io/.schemas/environment.json';
}

await fs.writeFile(
  path.join(environments_dir, './environment.schema.json'),
  JSON.stringify(type_schema, null, 2)
);
