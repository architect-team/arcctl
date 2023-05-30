import { Datacenter } from './datacenter.ts';
import { buildDatacenter, DatacenterSchema } from './schema.ts';
import _Ajv2019 from 'ajv/dist/2019.ts';
import yaml from 'js-yaml';
import * as path from 'std/path/mod.ts';
// https://github.com/ajv-validator/ajv/issues/2132#issuecomment-1290409907
const Ajv2019 = _Ajv2019 as unknown as typeof _Ajv2019.default;

const DEFAULT_SCHEMA_VERSION = 'v1';
const ajv = new Ajv2019({ strict: false, discriminator: true });
const __dirname = new URL('.', import.meta.url).pathname;

const datacenter_schema_contents = await Deno.readTextFile(path.join(__dirname, './datacenter.schema.json'));
const validateDatacenter = ajv.compile<DatacenterSchema>(JSON.parse(datacenter_schema_contents));

export const parseDatacenter = async (input: Record<string, unknown> | string): Promise<Datacenter> => {
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
