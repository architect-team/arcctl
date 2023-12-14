import Ajv2019 from 'https://esm.sh/v124/ajv@8.12.0/dist/2019.js';
import yaml from 'js-yaml';
import * as path from 'std/path/mod.ts';
import * as ModuleSchemaContents from './module-schema.ts';
import { DatacenterModule } from './module.ts';
import { buildModule, DatacenterModuleSchema } from './schema.ts';

const DEFAULT_SCHEMA_VERSION = 'v1';
const ajv = new Ajv2019({ strict: false, discriminator: true });

export const parseModule = async (
  input: Record<string, unknown> | string,
): Promise<DatacenterModule> => {
  const module_validator = ajv.compile<DatacenterModuleSchema>(ModuleSchemaContents.default);

  let raw_obj: any;
  if (typeof input === 'string') {
    let raw_contents: string;
    if (input.startsWith('http://') || input.startsWith('https://')) {
      const resp = await fetch(input);
      raw_contents = await resp.text();
    } else {
      let filename = input;
      const lstat = await Deno.lstat(filename);
      if (lstat.isDirectory) {
        filename = path.join(filename, 'module.yml');
      }

      raw_contents = await Deno.readTextFile(filename);
    }

    if (input.endsWith('.json')) {
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

  if (!module_validator(raw_obj)) {
    console.log(module_validator.errors);
    throw new Error(module_validator.errors?.toString());
  }

  return buildModule(raw_obj);
};
