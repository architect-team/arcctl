import Ajv2019 from 'ajv/dist/2019.js';
import yaml from 'js-yaml';
import * as EnvironmentSchemaContents from './environment-schema.ts';
import { Environment } from './environment.ts';
import { buildEnvironment, EnvironmentSchema } from './schema.ts';

const DEFAULT_SCHEMA_VERSION = 'v1';
const ajv = new Ajv2019({ strict: false, discriminator: true });
const __dirname = new URL('.', import.meta.url).pathname;

const environment_validator = ajv.compile<EnvironmentSchema>(EnvironmentSchemaContents.default);

export const parseEnvironment = async (input: Record<string, unknown> | string): Promise<Environment> => {
  let raw_obj: any;
  if (typeof input === 'string') {
    let raw_contents: string;
    if (input.startsWith('http://') || input.startsWith('https://')) {
      const resp = await fetch(input);
      raw_contents = await resp.text();
    } else {
      raw_contents = await Deno.readTextFile(input);
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

  if (!environment_validator(raw_obj)) {
    throw new Error(environment_validator.errors?.toString());
  }

  return buildEnvironment(raw_obj);
};
