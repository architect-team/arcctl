import hclParser from 'hcl2-json-parser';
import Ajv2019 from 'https://esm.sh/v124/ajv@8.12.0';
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
    } else if (input.endsWith('.arc') || input.endsWith('hcl')) {
      try {
        raw_obj = await hclParser.parseToObject(raw_contents);
      } catch (e) {
        throw Error(`Failed to parse ${input}:\n${e}`);
      }
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
