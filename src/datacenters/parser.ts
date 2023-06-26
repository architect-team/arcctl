import Ajv2019 from 'ajv/dist/2019.js';
import yaml from 'js-yaml';
import * as path from 'std/path/mod.ts';
import { Datacenter } from './datacenter.ts';
import { buildDatacenter, DatacenterSchema } from './schema.ts';

const DEFAULT_SCHEMA_VERSION = 'v1';
const ajv = new Ajv2019({ strict: false, discriminator: true });
const __dirname = new URL('.', import.meta.url).pathname;

const datacenter_schema_contents = Deno.readTextFileSync(path.join(__dirname, './datacenter.schema.json'));
const datacenter_validator = ajv.compile<DatacenterSchema>(JSON.parse(datacenter_schema_contents));

export const parseDatacenter = async (input: Record<string, unknown> | string): Promise<Datacenter> => {
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

  if (!datacenter_validator(raw_obj)) {
    throw datacenter_validator.errors;
  }

  return buildDatacenter(raw_obj);
};
