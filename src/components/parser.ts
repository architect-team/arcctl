import { Component } from './component.ts';
import { buildComponent, ComponentSchema } from './schema.ts';
import _Ajv2019 from 'ajv/dist/2019.js';
import yaml from 'js-yaml';
import * as path from 'std/path/mod.ts';
// https://github.com/ajv-validator/ajv/issues/2132#issuecomment-1290409907
const Ajv2019 = _Ajv2019 as unknown as typeof _Ajv2019.default;

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
