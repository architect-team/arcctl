import * as hclParser from 'hcl2-parser';
import Ajv2019 from 'https://esm.sh/v124/ajv@8.11.0/dist/2019.js';
import yaml from 'js-yaml';
import * as DatacenterSchemaContents from './datacenter-schema.ts';
import { Datacenter } from './datacenter.ts';
import { buildDatacenter, DatacenterSchema } from './schema.ts';

const DEFAULT_SCHEMA_VERSION = 'v1';
const ajv = new Ajv2019({ strict: false, discriminator: true });

export const parseDatacenter = async (
  input: Record<string, unknown> | string,
): Promise<Datacenter> => {
  const datacenter_validator = ajv.compile<DatacenterSchema>(DatacenterSchemaContents.default);

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
      raw_obj.input_type = 'json';
    } else if (input.endsWith('.arc')) {
      raw_obj = hclParser.default.parseToObject(raw_contents)[0];
      raw_obj.input_type = 'hcl';
    } else {
      raw_obj = yaml.load(raw_contents);
      raw_obj.input_type = 'json';
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
