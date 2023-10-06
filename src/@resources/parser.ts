import Ajv2019 from 'https://esm.sh/v124/ajv@8.11.0/dist/2019.js';
import yaml from 'js-yaml';
import * as path from 'std/path/mod.ts';
import { ResourceInputs, ResourceType, ResourceTypeList } from './types.ts';

const ajv = new Ajv2019({ strict: false, discriminator: true });

export const parseSpecificResourceInputs = async <T extends ResourceType>(
  type: T,
  input: Record<string, unknown> | string,
): Promise<ResourceInputs[T]> => {
  let raw_obj: any;
  if (typeof input === 'string') {
    const filename = input;
    const lstat = await Deno.lstat(filename);
    if (!lstat.isFile) {
      throw new Error(`${filename} not found`);
    }

    const raw_contents = await Deno.readTextFile(filename);
    if (filename.endsWith('.json')) {
      raw_obj = JSON.parse(raw_contents);
    } else {
      raw_obj = yaml.load(raw_contents);
    }
  } else {
    raw_obj = input;
  }

  if (!ResourceTypeList.includes(type)) {
    throw new Error(`Invalid resource type: ${type}`);
  }

  const __dirname = new URL('.', import.meta.url).pathname;
  const input_schema_file_contents = Deno.readTextFileSync(path.join(__dirname, type, 'inputs.schema.json'));
  const inputSchema = JSON.parse(input_schema_file_contents);
  const resource_validator = ajv.compile<ResourceInputs[T]>(inputSchema);

  if (!resource_validator(raw_obj)) {
    throw resource_validator.errors;
  }

  return raw_obj;
};
