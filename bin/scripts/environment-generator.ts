import { execa } from 'npm:execa';
import Mustache from 'npm:mustache';
import * as path from 'std/path/mod.ts';
import { build, emptyDir } from 'https://deno.land/x/dnt@0.36.0/mod.ts';

const __dirname = new URL('.', import.meta.url).pathname;
const environments_dir = path.join(__dirname, '../../src/environments');
const build_dir = path.join(__dirname, 'build');

await emptyDir(build_dir);

const all_versions = [];
for await (const dirEntry of Deno.readDir(environments_dir)) {
  if (dirEntry.isDirectory && dirEntry.name !== '__tests__') {
    all_versions.push(dirEntry.name);
  }
}
all_versions.sort((a, b) => a.localeCompare(b));

// Create the updated schema.ts file for all available schemas.
Deno.writeTextFile(
  path.join(environments_dir, 'schema.ts'),
  Mustache.render(
    await Deno.readTextFile(path.join(environments_dir, 'schema.ts.stache')),
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
  entryPoints: [path.join(environments_dir, 'schema.ts')],
  outDir: build_dir,
  compilerOptions: {
    lib: ['ES2022'],
    target: 'ES2020',
  },
  shims: {
    deno: true,
  },
  package: {
    name: 'environment-schema',
    version: '0.0.1',
    description: 'environment schema transpilation',
  },
});

console.log('Finishing building temp package, generating JSON schema...');
const { stdout: type_schema_string } = await execa('deno', [
  'run',
  '--allow-read',
  'npm:ts-json-schema-generator',
  '--path',
  path.join(build_dir, 'src', 'environments', 'schema.ts'),
  '--expose',
  'none',
  '--type',
  'EnvironmentSchema',
  '--tsconfig',
  '../../tsconfig.json',
  '--no-type-check',
]);

let type_schema = JSON.parse(type_schema_string);
if (type_schema.definitions.EnvironmentSchema.anyOf) {
  type_schema = {
    oneOf: type_schema.definitions.EnvironmentSchema.anyOf,
    $schema: 'https://json-schema.org/draft/2019-09/schema',
    $id: 'https://architect.io/.schemas/environment.json',
    type: 'object',
    required: ['version'],
    discriminator: {
      propertyName: 'version',
    },
  };
} else {
  type_schema.$schema = 'https://json-schema.org/draft/2019-09/schema';
  type_schema.$id = 'https://architect.io/.schemas/environment.json';
}

await Deno.writeTextFile(
  path.join(environments_dir, './environment.schema.json'),
  JSON.stringify(type_schema, null, 2),
);
console.log(
  `Done! Updated schema is located at ${path.join(
    environments_dir,
    './environment.schema.json',
  )}`,
);

Deno.removeSync(build_dir, { recursive: true });
