import { Environment } from './environment.ts';
import { buildEnvironment, EnvironmentSchema } from './schema.ts';
import Ajv2019 from 'https://esm.sh/ajv@8.6.1';
import yaml from 'npm:js-yaml';
import * as path from 'https://deno.land/std@0.188.0/path/mod.ts';

const DEFAULT_SCHEMA_VERSION = 'v1';
const ajv = new Ajv2019({ strict: false, discriminator: true });
const __dirname = new URL('.', import.meta.url).pathname;

const environment_schema_contents = await Deno.readTextFile(
  path.join(__dirname, './environment.schema.json'),
);
const validateEnvironment = ajv.compile<EnvironmentSchema>(
  JSON.parse(environment_schema_contents),
);

export const parseEnvironment = async (
  input: Record<string, unknown> | string,
): Promise<Environment> => {
  let raw_obj: any;
  if (typeof input === 'string') {
    const raw_contents = await Deno.readTextFile(input);
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

  if (!validateEnvironment(raw_obj)) {
    throw validateEnvironment.errors;
  }

  return buildEnvironment(raw_obj);
};
