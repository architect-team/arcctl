import { build, emptyDir } from 'dnt';
import Mustache from 'npm:mustache';
import * as path from 'std/path/mod.ts';
import { exec } from '../src/utils/command.ts';

const __dirname = new URL('.', import.meta.url).pathname;
const datacenters_dir = path.join(__dirname, '../src/datacenters');
const build_dir = path.join(__dirname, 'build');

await emptyDir(build_dir);

const all_versions = [];
for await (const dirEntry of Deno.readDir(datacenters_dir)) {
  if (dirEntry.isDirectory && dirEntry.name !== '__tests__') {
    all_versions.push(dirEntry.name);
  }
}
all_versions.sort((a, b) => a.localeCompare(b));

// Create the updated schema.ts file for all available schemas.
Deno.writeTextFile(
  path.join(datacenters_dir, 'schema.ts'),
  Mustache.render(await Deno.readTextFile(path.join(datacenters_dir, 'schema.ts.stache')), {
    versions: all_versions,
  }),
);

// Builds the schema into an npm package. This will convert files to .js and .d.ts with
// Deno shims so that "ts-json-schema-generator" can be run on it and infer types properly.
await build({
  typeCheck: false,
  test: false,
  entryPoints: [path.join(datacenters_dir, 'schema.ts')],
  outDir: build_dir,
  compilerOptions: {
    lib: ['ES2022'],
    target: 'ES2020',
  },
  shims: {
    deno: true,
  },
  package: {
    name: 'datacenter-schema',
    version: '0.0.1',
    description: 'datacenter schema transpilation',
  },
});

console.log('Finishing building temp package, generating JSON schema...');

for (const version of all_versions) {
  const { stdout: type_schema_string } = await exec('deno', {
    args: [
      'run',
      '--allow-read',
      'npm:ts-json-schema-generator',
      '--path',
      path.join(build_dir, 'src/datacenters', version, 'index.ts'),
      '--expose',
      'none',
      '--type',
      'Datacenter' + version.toUpperCase(),
      '--tsconfig',
      path.join(__dirname, '../tsconfig.json'),
      '--no-type-check',
    ],
    stdout: 'piped',
  });
  const type_schema = JSON.parse(type_schema_string);
  type_schema.$schema = 'https://json-schema.org/draft/2019-09/schema';
  await Deno.writeTextFile(path.join(datacenters_dir, version, './schema.json'), JSON.stringify(type_schema, null, 2));
}

const { stdout: type_schema_string, stderr: err } = await exec('deno', {
  args: [
    'run',
    '--allow-read',
    'npm:ts-json-schema-generator@1.5.0',
    '--path',
    path.join(build_dir, 'src', 'datacenters', 'schema.ts'),
    '--expose',
    'none',
    '--type',
    'DatacenterSchema',
    '--tsconfig',
    path.join(__dirname, '../tsconfig.json'),
    '--no-type-check',
  ],
});

if (err.length > 0) {
  console.error('Failed to generate datacenter schema!')
  console.error(err);
  Deno.exit(1);
}

let type_schema = JSON.parse(type_schema_string);
if (type_schema.definitions.DatacenterSchema.anyOf) {
  type_schema = {
    oneOf: type_schema.definitions.DatacenterSchema.anyOf,
    $schema: 'https://json-schema.org/draft/2019-09/schema',
    $id: 'https://architect.io/.schemas/datacenter.json',
    type: 'object',
    required: ['version'],
    discriminator: {
      propertyName: 'version',
    },
  };
} else {
  type_schema.$id = 'https://architect.io/.schemas/datacenter.json';
  type_schema.$schema = 'https://json-schema.org/draft/2019-09/schema';
}

await Deno.writeTextFile(path.join(datacenters_dir, './datacenter.schema.json'), JSON.stringify(type_schema, null, 2));
await Deno.writeTextFile(path.join(datacenters_dir, './datacenter-schema.ts'), `export default ${JSON.stringify(type_schema, null, 2)}`);

console.log(`Done! Updated schema is located at ${path.join(datacenters_dir, './datacenter.schema.json')}`);

Deno.removeSync(build_dir, { recursive: true });
