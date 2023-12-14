import { build, emptyDir } from 'https://deno.land/x/dnt@0.36.0/mod.ts';
import Mustache from 'mustache';
import * as path from 'std/path/mod.ts';
import { exec } from '../src/utils/command.ts';

const __dirname = new URL('.', import.meta.url).pathname;
const resources_dir = path.join(__dirname, '../src', '@resources');
const build_dir = path.join(__dirname, 'build');

const all_types: { name: string; slug: string }[] = [];
for await (const dirEntry of Deno.readDir(resources_dir)) {
  if (dirEntry.isDirectory && dirEntry.name !== '__tests__') {
    all_types.push({
      name: dirEntry.name,
      slug: dirEntry.name.replace(/-([\dA-Za-z])/g, (g) => g[1].toUpperCase()),
    });
  }
}

all_types.sort((a, b) => a.name.localeCompare(b.name));

console.log('Create master resource types file');
await (async () => {
  Deno.writeTextFile(
    path.join(resources_dir, 'types.ts'),
    Mustache.render(await Deno.readTextFile(path.join(resources_dir, 'types.ts.stache')), { types: all_types }),
  );
})();

console.log('Build master npm-compatible package');
await (async () => {
  await emptyDir(build_dir);

  await build({
    typeCheck: false,
    test: false,
    entryPoints: [path.join(resources_dir, 'index.ts')],
    outDir: build_dir,
    compilerOptions: {
      lib: ['ES2022'],
      target: 'ES2020',
    },
    shims: {
      deno: true,
    },
    package: {
      name: 'resources',
      version: '0.0.1',
      description: 'resources transpilation',
    },
  });
})();

for (const type of all_types) {
  console.log(`Create ${type.name} input schema`);
  await (async () => {
    const { stdout: typeSchemaString } = await exec('deno', {
      args: [
        'run',
        '--allow-read',
        'npm:ts-json-schema-generator@1.5.0',
        '--path',
        path.join(build_dir, 'src', type.name, 'inputs.ts'),
        '--type',
        '*',
        '--tsconfig',
        path.join(__dirname, '../tsconfig.json'),
        '--no-type-check',
      ],
    });

    const typeSchema = JSON.parse(typeSchemaString);
    typeSchema.$schema = 'https://json-schema.org/draft/2019-09/schema';
    typeSchema.$id = 'https://architect.io/.schemas/resources/' + type.name + '/inputs.json';

    await Deno.writeTextFile(
      path.join(resources_dir, type.name, './inputs.schema.json'),
      JSON.stringify(typeSchema, null, 2),
    );
  })();
}

for (const type of all_types) {
  console.log(`Create ${type.name} output schema`);
  await (async () => {
    const { stdout: typeSchemaString } = await exec('deno', {
      args: [
        'run',
        '--allow-read',
        'npm:ts-json-schema-generator@1.5.0',
        '--path',
        path.join(build_dir, 'src', type.name, 'outputs.ts'),
        '--type',
        '*',
        '--tsconfig',
        path.join(__dirname, '../tsconfig.json'),
        '--no-type-check',
      ],
    });

    const typeSchema = JSON.parse(typeSchemaString);
    typeSchema.$schema = 'https://json-schema.org/draft/2019-09/schema';
    typeSchema.$id = 'https://architect.io/.schemas/resources/' + type.name + '/outputs.json';

    await Deno.writeTextFile(
      path.join(resources_dir, type.name, './outputs.schema.json'),
      JSON.stringify(typeSchema, null, 2),
    );
  })();
}

console.log('Cleanup');

Deno.removeSync(build_dir, { recursive: true });
