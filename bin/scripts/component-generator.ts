#!/usr/bin/env ts-node
import { execa } from 'execa';
import fs from 'fs/promises';
import Mustache from 'mustache';
import path from 'path';
import url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const components_dir = path.join(__dirname, '../../src/components');

const all_versions = (await fs.readdir(components_dir, { withFileTypes: true }))
  .filter((dirent) => dirent.isDirectory() && dirent.name !== '__tests__')
  .map((dirent) => dirent.name);

fs.writeFile(
  path.join(components_dir, 'schema.ts'),
  Mustache.render(
    await fs.readFile(path.join(components_dir, 'schema.ts.stache'), 'utf-8'),
    {
      versions: all_versions,
    },
  ),
);

let { stdout: type_schema_string } = await execa(
  path.join(__dirname, '../../node_modules/.bin/ts-json-schema-generator'),
  [
    '--path',
    path.join(components_dir, './schema.ts'),
    '--expose',
    'none',
    '--type',
    'ComponentSchema',
  ],
);

let type_schema = JSON.parse(type_schema_string);
type_schema = {
  oneOf: type_schema.definitions.ComponentSchema.anyOf,
  $schema: 'https://json-schema.org/draft/2019-09/schema',
  $id: 'https://architect.io/.schemas/component.json',
  type: 'object',
  required: ['version'],
  discriminator: {
    propertyName: 'version',
  },
};
await fs.writeFile(
  path.join(components_dir, './component.schema.json'),
  JSON.stringify(type_schema, null, 2),
);
