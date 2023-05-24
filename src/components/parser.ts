import { Component } from './component.ts';
import { buildComponent, ComponentSchema } from './schema.ts';
import Ajv2019 from 'https://esm.sh/ajv@8.6.1';
import yaml from 'npm:js-yaml';
import * as path from 'https://deno.land/std@0.188.0/path/mod.ts';

const DEFAULT_SCHEMA_VERSION = 'v1';
const ajv = new Ajv2019({ strict: false, discriminator: true });
const __dirname = new URL('.', import.meta.url).pathname;

const component_schema_contents = Deno.readTextFileSync(
  path.join(__dirname, './component.schema.json'),
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
    const lstat = await Deno.lstat(filename);
    if (lstat.isDirectory) {
      filename = path.join(filename, 'architect.yml');
    }
    const raw_contents = await Deno.readTextFile(filename);
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
