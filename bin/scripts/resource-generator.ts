#!/usr/bin/env ts-node
import { execa } from 'execa';
import { build, emptyDir } from 'https://deno.land/x/dnt@0.36.0/mod.ts';
import Listr from 'listr';
import Mustache from 'mustache';
import * as path from 'std/path/mod.ts';

const __dirname = new URL('.', import.meta.url).pathname;
const resources_dir = path.join(__dirname, '../../src', '@resources');
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

const listrTasks = new Listr([
  {
    title: 'Create master resource types file',
    task: async () => {
      Deno.writeTextFile(
        path.join(resources_dir, 'types.ts'),
        Mustache.render(
          await Deno.readTextFile(path.join(resources_dir, 'types.ts.stache')),
          { types: all_types },
        ),
      );
    },
  },
  {
    title: 'Build master npm-compatible package',
    task: async () => {
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
    },
  },
  {
    title: 'Create master resources input types schema',
    task: async () => {
      const inputSchemaPath = path.join(resources_dir, 'input.schema.json');
      const inputSchemaString = await Deno.readTextFile(inputSchemaPath);
      const inputSchema = JSON.parse(inputSchemaString);
      const { stdout: newInputSchemaString } = await execa('deno', [
        'run',
        '--allow-read',
        'npm:ts-json-schema-generator',
        '--path',
        path.join(build_dir, 'src', 'types.ts'),
        '--type',
        'InputSchema',
        '--tsconfig',
        '../../tsconfig.json',
        '--no-type-check',
      ]);

      const newInputSchema = JSON.parse(newInputSchemaString);
      inputSchema.$ref = newInputSchema.$ref;
      inputSchema.definitions = newInputSchema.definitions;

      await Deno.writeTextFile(
        inputSchemaPath,
        JSON.stringify(inputSchema, null, 2),
      );
    },
  },
]);

for (const type of all_types) {
  listrTasks.add({
    title: `Create ${type.name} input schema`,
    task: async () => {
      const { stdout: typeSchemaString } = await execa('deno', [
        'run',
        '--allow-read',
        'npm:ts-json-schema-generator',
        '--path',
        path.join(build_dir, 'src', type.name, 'inputs.ts'),
        '--type',
        '*',
        '--tsconfig',
        '../../tsconfig.json',
        '--no-type-check',
      ]);

      const typeSchema = JSON.parse(typeSchemaString);
      await Deno.writeTextFile(
        path.join(resources_dir, type.name, './inputs.schema.json'),
        JSON.stringify(typeSchema, null, 2),
      );
    },
  });
}

listrTasks.add({
  title: 'Cleanup build dir',
  task: () => {
    Deno.removeSync(build_dir, { recursive: true });
  },
});

try {
  listrTasks.run();
} catch (err) {
  console.error(err);
}
