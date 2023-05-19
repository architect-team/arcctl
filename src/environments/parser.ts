import { Environment } from './environment.js';
import { buildEnvironment, EnvironmentSchema } from './schema.js';
import Ajv2019 from 'ajv/dist/2019.js';
import fs from 'fs/promises';
import yaml from 'js-yaml';
import path from 'path';
import url from 'url';

const DEFAULT_SCHEMA_VERSION = 'v1';
const ajv = new Ajv2019({ strict: false, discriminator: true });
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const environment_schema_contents = await fs.readFile(
  path.join(__dirname, './environment.schema.json'),
  'utf-8',
);
const validateEnvironment = ajv.compile<EnvironmentSchema>(
  JSON.parse(environment_schema_contents),
);

export const parseEnvironment = async (
  input: Record<string, unknown> | string,
): Promise<Environment> => {
  let raw_obj: any;
  if (typeof input === 'string') {
    const raw_contents = await fs.readFile(input, 'utf8');
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
