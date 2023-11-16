import { build, emptyDir } from 'dnt';
import Mustache from 'npm:mustache';
import * as path from 'std/path/mod.ts';
import { exec } from '../src/utils/command.ts';

const __dirname = new URL('.', import.meta.url).pathname;
const components_dir = path.join(__dirname, '../src/components');
const build_dir = path.join(__dirname, 'build');

await emptyDir(build_dir);

const all_versions = [];
for await (const dirEntry of Deno.readDir(components_dir)) {
  if (dirEntry.isDirectory && dirEntry.name !== '__tests__') {
    all_versions.push(dirEntry.name);
  }
}
all_versions.sort((a, b) => a.localeCompare(b));

// Create the updated schema.ts file for all available schemas.
Deno.writeTextFile(
  path.join(components_dir, 'schema.ts'),
  Mustache.render(await Deno.readTextFile(path.join(components_dir, 'schema.ts.stache')), {
    versions: all_versions,
  }),
);

// Builds the schema into an npm package. This will convert files to .js and .d.ts with
// Deno shims so that "ts-json-schema-generator" can be run on it and infer types properly.
await build({
  typeCheck: false,
  test: false,
  entryPoints: [path.join(components_dir, 'schema.ts')],
  outDir: build_dir,
  compilerOptions: {
    lib: ['ES2022'],
    target: 'ES2020',
  },
  shims: {
    deno: true,
  },
  package: {
    name: 'component-schema',
    version: '0.0.1',
    description: 'component schema transpilation',
  },
});

// const cmd = new Deno.Command(binaryPath, { args, ...opts?.commandOptions, stdout: 'piped', stderr: 'piped' });
console.log('Finishing building temp package, generating JSON schemas...');

for (const version of all_versions) {
  const { stdout: type_schema_string } = await exec('deno', {
    args: [
      'run',
      '--allow-read',
      'npm:ts-json-schema-generator',
      '--path',
      path.join(build_dir, 'src/components', version, 'index.ts'),
      '--expose',
      'none',
      '--type',
      'Component' + version.toUpperCase(),
      '--tsconfig',
      path.join(__dirname, '../tsconfig.json'),
      '--no-type-check',
    ],
    stdout: 'piped',
  });
  const type_schema = JSON.parse(type_schema_string);
  await Deno.writeTextFile(path.join(components_dir, version, './schema.json'), JSON.stringify(type_schema, null, 2));
}

const { stdout: type_schema_string } = await exec('deno', {
  args: [
    'run',
    '--allow-read',
    'npm:ts-json-schema-generator',
    '--path',
    path.join(build_dir, 'src/components/schema.ts'),
    '--expose',
    'none',
    '--type',
    'ComponentSchema',
    '--tsconfig',
    path.join(__dirname, '../tsconfig.json'),
    '--no-type-check',
  ],
  stdout: 'piped',
});

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

await Deno.writeTextFile(path.join(components_dir, './component.schema.json'), JSON.stringify(type_schema, null, 2));
await Deno.writeTextFile(
  path.join(components_dir, './component-schema.ts'),
  `export default ${JSON.stringify(type_schema, null, 2)}`,
);
console.log(`Done! Updated schema is located at ${path.join(components_dir, './component.schema.json')}`);

Deno.removeSync(build_dir, { recursive: true });
