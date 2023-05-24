import { Datacenter } from './datacenter.js';
import { buildDatacenter, DatacenterSchema } from './schema.js';
import Ajv2019 from 'ajv/dist/2019.js';
import fs from 'fs/promises';
import yaml from 'js-yaml';
import path from 'path';
import url from 'url';

const DEFAULT_SCHEMA_VERSION = 'v1';
const ajv = new Ajv2019({ strict: false, discriminator: true });
const __dirname = new URL('.', import.meta.url).pathname;

const datacenter_schema_contents = await fs.readFile(
  path.join(__dirname, './datacenter.schema.json'),
  'utf8',
);
const validateDatacenter = ajv.compile<DatacenterSchema>(
  JSON.parse(datacenter_schema_contents),
);

export const parseDatacenter = async (
  input: Record<string, unknown> | string,
): Promise<Datacenter> => {
  let raw_obj: any;
  if (typeof input === 'string') {
    const filename = input;
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

  if (!validateDatacenter(raw_obj)) {
    throw validateDatacenter.errors;
  }

  return buildDatacenter(raw_obj);
};
