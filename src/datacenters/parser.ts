import { Datacenter } from './datacenter.ts';
import { buildDatacenter, DatacenterSchema } from './schema.ts';
import Ajv2019 from 'https://esm.sh/ajv@8.6.1';
import yaml from 'npm:js-yaml';
import * as path from 'https://deno.land/std@0.188.0/path/mod.ts';

const DEFAULT_SCHEMA_VERSION = 'v1';
const ajv = new Ajv2019({ strict: false, discriminator: true });
const __dirname = new URL('.', import.meta.url).pathname;

const datacenter_schema_contents = await Deno.readTextFile(
  path.join(__dirname, './datacenter.schema.json'),
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

  if (!validateDatacenter(raw_obj)) {
    throw validateDatacenter.errors;
  }

  return buildDatacenter(raw_obj);
};
