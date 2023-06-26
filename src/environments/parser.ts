import yaml from 'js-yaml';
import Ajv2019 from 'npm:ajv';
import environment_schema_contents from './environment.schema.json' assert {
  type: 'json',
};
import { Environment } from './environment.ts';
import { buildEnvironment, EnvironmentSchema } from './schema.ts';

const DEFAULT_SCHEMA_VERSION = 'v1';
const ajv = new Ajv2019({ strict: false, discriminator: true });

export const parseEnvironment = async (
  input: Record<string, unknown> | string,
): Promise<Environment> => {
  const environment_validator = ajv.compile<EnvironmentSchema>(
    environment_schema_contents,
  );

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
    throw environment_validator.errors;
  }

  return buildEnvironment(raw_obj);
};
