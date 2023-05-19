import { Component } from './component.js';
import { buildComponent, ComponentSchema } from './schema.js';
import Ajv2019 from 'ajv/dist/2019.js';
import fs from 'fs/promises';
import yaml from 'js-yaml';
import path from 'path';
import url from 'url';

const DEFAULT_SCHEMA_VERSION = 'v1';
const ajv = new Ajv2019({ strict: false, discriminator: true });
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const component_schema_contents = await fs.readFile(
  path.join(__dirname, './component.schema.json'),
  'utf8',
);
const validateComponent = ajv.compile<ComponentSchema>(
  JSON.parse(component_schema_contents),
);

export const parseComponent = async (
  input: Record<string, unknown> | string,
): Promise<Component> => {
  let raw_obj: any;
  if (typeof input === 'string') {
    let filename = input;
    const lstat = await fs.lstat(filename);
    if (lstat.isDirectory()) {
      filename = path.join(filename, 'architect.yml');
    }
    const raw_contents = await fs.readFile(filename, 'utf8');
    if (filename.endsWith('.json')) {
      raw_obj = JSON.parse(raw_contents);
    } else {
      raw_obj = yaml.load(raw_contents);
    }
  } else {
    raw_obj = input;
  }

  if (!('version' in raw_obj)) {
    raw_obj.version = DEFAULT_SCHEMA_VERSION;
  }

  if (!validateComponent(raw_obj)) {
    throw validateComponent.errors;
  }

  return buildComponent(raw_obj);
};
