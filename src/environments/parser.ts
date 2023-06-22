import Ajv2019 from "ajv/dist/2019.js";
import yaml from "js-yaml";
import * as path from "std/path/mod.ts";
import { Environment } from "./environment.ts";
import { buildEnvironment, EnvironmentSchema } from "./schema.ts";
import environment_schema_contents from "./environment.schema.json" assert {
  type: "json",
};

const DEFAULT_SCHEMA_VERSION = "v1";
const ajv = new Ajv2019({ strict: false, discriminator: true });
const __dirname = new URL(".", import.meta.url).pathname;

export const parseEnvironment = async (
  input: Record<string, unknown> | string,
): Promise<Environment> => {
  const environment_validator = ajv.compile<EnvironmentSchema>(
    environment_schema_contents,
  );

  let raw_obj: any;
  if (typeof input === "string") {
    const raw_contents = await Deno.readTextFile(input);
    if (input.endsWith(".json")) {
      raw_obj = JSON.parse(raw_contents);
    } else {
      raw_obj = yaml.load(raw_contents);
    }
  } else {
    raw_obj = input;
  }

  if (!("version" in raw_obj)) {
    raw_obj.version = DEFAULT_SCHEMA_VERSION;
  }

  if (!environment_validator(raw_obj)) {
    throw environment_validator.errors;
  }

  return buildEnvironment(raw_obj);
};
