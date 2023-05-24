import { execa } from 'npm:execa';
import Mustache from 'npm:mustache';
import * as path from "https://deno.land/std@0.188.0/path/mod.ts";
import { build, emptyDir } from "https://deno.land/x/dnt@0.36.0/mod.ts";

const __dirname = new URL('.', import.meta.url).pathname;
const components_dir = path.join(__dirname, '../../src/components');
const component_build_dir = path.join(__dirname, 'component-build');

await emptyDir(component_build_dir);

const all_versions = [];
for await (const dirEntry of Deno.readDir(components_dir)) {
  if (dirEntry.isDirectory && dirEntry.name !== '__tests__') {
    all_versions.push(dirEntry.name);
  }
}

// Create the updated schema.ts file for all available schemas.
Deno.writeTextFile(
  path.join(components_dir, 'schema.ts'),
  Mustache.render(
    await Deno.readTextFile(path.join(components_dir, 'schema.ts.stache')),
    {
      versions: all_versions,
    },
  ),
);

// Builds the schema into an npm package. This will convert files to .js and .d.ts with
// Deno shims so that "ts-json-schema-generator" can be run on it and infer types properly.
await build({
    typeCheck: false,
    test: false,
    entryPoints: [
      path.join(components_dir, "schema.ts"),
    ],
    outDir: component_build_dir,
    compilerOptions: {
      lib: ["ES2022"],
      target: "ES2020",
    },
    shims: {
      deno: true,
    },
    package: {
      name: "component-schema",
      version: '0.0.1',
      description: "component schema transpilation",
    },
  });


const { stdout: type_schema_string } = await execa(
  'deno',
  [
    'run',
    '--allow-read',
    'npm:ts-json-schema-generator',
    '--path',
    path.join(component_build_dir, 'src', 'components', 'schema.ts'),
    '--expose',
    'none',
    '--type',
    'ComponentSchema',
    '--tsconfig',
    '../../tsconfig.json'
  ],
);

let type_schema = JSON.parse(type_schema_string);
type_schema = {
  oneOf: type_schema.definitions.ComponentSchema.anyOf,
  $schema: 'https://json-schema.org/draft/2019-09/schema',
  $id: 'https://architect.io/.schemas/component.json',
  type: 'object',
  required: ['version'],
  discriminator: {
    propertyName: 'version',
  },
};

await Deno.writeTextFile(
  path.join(components_dir, './component.schema.json'),
  JSON.stringify(type_schema, null, 2),
);

// Clean up the built js/d.ts files
Deno.removeSync(component_build_dir, { recursive: true });