import * as hclParser from 'hcl2-parser';
import Ajv2019 from 'https://esm.sh/v124/ajv@8.11.0/dist/2019.js';
import yaml from 'js-yaml';
import { ResourceTypeList } from '../@resources/types.ts';
import * as DatacenterSchemaContents from './datacenter-schema.ts';
import { Datacenter } from './datacenter.ts';
import { buildDatacenter, DatacenterSchema } from './schema.ts';

const DEFAULT_SCHEMA_VERSION = 'v1';
const ajv = new Ajv2019({ strict: false, discriminator: true });

const convertAccounts = (obj: any, resultObj: any): any => {
  if (obj.account) {
    resultObj.accounts = {};
    for (const [name, value] of Object.entries(obj.account)) {
      resultObj.accounts[name] = (value as any)[0];
    }
  }
  return resultObj;
};

const convertVariables = (obj: any, resultObj: any): any => {
  if (obj.variable) {
    resultObj.variables = {};
    for (const [name, value] of Object.entries(obj.variable)) {
      resultObj.variables[name] = (value as any)[0];
    }
  }
};

const convertResources = (obj: any, resultObj: any): any => {
  const resources: any = {};
  for (const resourceType of ResourceTypeList) {
    if (obj[resourceType]) {
      for (const [name, value] of Object.entries(obj[resourceType])) {
        resources[name] = {
          type: resourceType,
          ...(value as any)[0],
        };
      }
    }
  }
  if (Object.keys(resources).length > 0) {
    resultObj.resources = resources;
  }
  return resultObj;
};

const convertHooks = (obj: any, resultObj: any): any => {
  if (obj.hook) {
    resultObj.hooks = [];
    for (const [_, value] of Object.entries(obj.hook)) {
      resultObj.hooks.push((value as any)[0]);
    }
    if (obj.defaults) {
      resultObj.hooks.push(obj.defaults[0]);
    }
  }
};

const convertHclToJSON = (hcl: string): any => {
  const contents = hclParser.default.parseToObject(hcl)[0];
  const jsonResultObj: any = {};
  convertVariables(contents, jsonResultObj);
  convertAccounts(contents, jsonResultObj);
  convertResources(contents, jsonResultObj);
  if (contents.environment) {
    const env_results = {};
    const env = contents.environment[0];
    convertAccounts(env, env_results);
    convertResources(env, env_results);
    convertHooks(env, env_results);
    jsonResultObj.environment = env_results;
  }
  return JSON.parse(
    JSON.stringify(jsonResultObj).replace(
      /\${(.+?)}/g,
      (_, p1) => {
        const parts = p1.split('.');
        const replacementIndexCheck = parts[0] === 'environment' ? 1 : 0;
        if (ResourceTypeList.includes(parts[replacementIndexCheck])) {
          parts[replacementIndexCheck] = 'resources';
        }
        if (parts[replacementIndexCheck] === 'account') {
          parts[replacementIndexCheck] = 'accounts';
        }
        if (parts[0] === 'variable') {
          parts[0] = 'variables';
        }
        return `\${{ ${parts.join('.')} }}`;
      },
    ),
  );
};

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
    } else if (input.endsWith('.arc')) {
      raw_obj = convertHclToJSON(raw_contents);
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
