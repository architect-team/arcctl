import Ajv2019 from "ajv/dist/2019.js";
import yaml from "js-yaml";
import * as path from "std/path/mod.ts";
import { InputSchema, ResourceInputs, ResourceType } from "./types.ts";

const ajv = new Ajv2019({ strict: false, discriminator: true });
const __dirname = new URL(".", import.meta.url).pathname;

export const parseResourceInputs = async (
  input: Record<string, unknown> | string,
): Promise<InputSchema> => {
  const input_schema_contents = Deno.readTextFileSync(
    path.join(__dirname, "./input.schema.json"),
  ); // TODO: cache loaded data
  const input_validator = ajv.compile<InputSchema>(
    JSON.parse(input_schema_contents),
  );

  let raw_obj: any;
  if (typeof input === "string") {
    const filename = input;
    const lstat = await Deno.lstat(filename);
    if (!lstat.isFile) {
      throw new Error(`${filename} not found`);
    }

    const raw_contents = await Deno.readTextFile(filename);
    if (filename.endsWith(".json")) {
      raw_obj = JSON.parse(raw_contents);
    } else {
      raw_obj = yaml.load(raw_contents);
    }
  } else {
    raw_obj = input;
  }

  if (!input_validator(raw_obj)) {
    throw input_validator.errors;
  }

  return raw_obj;
};

export const parseSpecificResourceInputs = async <T extends ResourceType>(
  type: T,
  input: Record<string, unknown> | string,
): Promise<ResourceInputs[T]> => {
  let raw_obj: any;
  if (typeof input === "string") {
    const filename = input;
    const lstat = await Deno.lstat(filename);
    if (!lstat.isFile) {
      throw new Error(`${filename} not found`);
    }

    const raw_contents = await Deno.readTextFile(filename);
    if (filename.endsWith(".json")) {
      raw_obj = JSON.parse(raw_contents);
    } else {
      raw_obj = yaml.load(raw_contents);
    }
  } else {
    raw_obj = input;
  }

  const resource_schema_contents = Deno.readTextFileSync(
    path.join(__dirname, type, "./inputs.schema.json"),
  );
  const resource_validator = ajv.compile<ResourceInputs[T]>(
    JSON.parse(resource_schema_contents),
  );

  if (!resource_validator(raw_obj)) {
    throw resource_validator.errors;
  }

  return raw_obj;
};
