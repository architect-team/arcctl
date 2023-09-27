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

console.log('Create master resources input types schema');
await (async () => {
  const inputSchemaPath = path.join(resources_dir, 'input.schema.json');
  const inputSchemaTsPath = path.join(resources_dir, 'input-schema.ts');
  const inputSchemaString = await Deno.readTextFile(inputSchemaPath);
  const inputSchema = JSON.parse(inputSchemaString);
  const { stdout: newInputSchemaString } = await exec('deno', {
    args: [
      'run',
      '--allow-read',
      'npm:ts-json-schema-generator',
      '--path',
      path.join(build_dir, 'src/types.ts'),
      '--type',
      'InputSchema',
      '--tsconfig',
      path.join(__dirname, '../tsconfig.json'),
      '--no-type-check',
    ],
  });

  const newInputSchema = JSON.parse(newInputSchemaString);
  inputSchema.$ref = newInputSchema.$ref;
  inputSchema.definitions = newInputSchema.definitions;

  await Deno.writeTextFile(inputSchemaPath, JSON.stringify(inputSchema, null, 2));
  await Deno.writeTextFile(inputSchemaTsPath, `export default ${JSON.stringify(inputSchema, null, 2)}`);
})();

console.log('Create master resources output types schema');
await (async () => {
  const outputSchemaPath = path.join(resources_dir, 'output.schema.json');
  const outputSchemaTsPath = path.join(resources_dir, 'output-schema.ts');
  const outputSchemaString = await Deno.readTextFile(outputSchemaPath);
  const outputSchema = JSON.parse(outputSchemaString);
  const { stdout: newOutputSchemaString } = await exec('deno', {
    args: [
      'run',
      '--allow-read',
      'npm:ts-json-schema-generator',
      '--path',
      path.join(build_dir, 'src/types.ts'),
      '--type',
      'OutputSchema',
      '--tsconfig',
      path.join(__dirname, '../tsconfig.json'),
      '--no-type-check',
    ],
  });

  const newOutputSchema = JSON.parse(newOutputSchemaString);
  outputSchema.$ref = newOutputSchema.$ref;
  outputSchema.definitions = newOutputSchema.definitions;

  await Deno.writeTextFile(outputSchemaPath, JSON.stringify(outputSchema, null, 2));
  await Deno.writeTextFile(outputSchemaTsPath, `export default ${JSON.stringify(outputSchema, null, 2)}`);
})();

const inputSchemas: Record<string, unknown> = {};
for (const type of all_types) {
  console.log(`Create ${type.name} input schema`);
  await (async () => {
    const { stdout: typeSchemaString } = await exec('deno', {
    args: [
      'run',
      '--allow-read',
      'npm:ts-json-schema-generator',
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
    inputSchemas[type.name] = typeSchema;
  await Deno.writeTextFile(
    path.join(resources_dir, type.name, './inputs.schema.json'),
    JSON.stringify(typeSchema, null, 2),
  );
  })();
}

console.log('Create master resources input types schema');
await (async () => {
  const inputSchemaPath = path.join(resources_dir, 'input.schema.json');
  const inputSchemaTsPath = path.join(resources_dir, 'input-schema.ts');
  const inputSchemaString = await Deno.readTextFile(inputSchemaPath);
  const inputSchema = JSON.parse(inputSchemaString);
  const { stdout: newInputSchemaString } = await exec('deno', {
    args: [
      'run',
      '--allow-read',
      'npm:ts-json-schema-generator',
      '--path',
      path.join(build_dir, 'src/types.ts'),
      '--type',
      'InputSchema',
      '--tsconfig',
      path.join(__dirname, '../tsconfig.json'),
      '--no-type-check',
    ],
  });

  const newInputSchema = JSON.parse(newInputSchemaString);
  inputSchema.$ref = newInputSchema.$ref;
  inputSchema.definitions = newInputSchema.definitions;

  await Deno.writeTextFile(inputSchemaPath, JSON.stringify(inputSchema, null, 2));
  await Deno.writeTextFile(inputSchemaTsPath, `export default ${JSON.stringify(inputSchema, null, 2)}`);
})();

const outputSchemas: Record<string, unknown> = {};
for (const type of all_types) {
  console.log(`Create ${type.name} output schema`);
  await (async () => {
    const { stdout: typeSchemaString } = await exec('deno', {
    args: [
      'run',
      '--allow-read',
      'npm:ts-json-schema-generator',
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
    outputSchemas[type.name] = typeSchema;
  await Deno.writeTextFile(
    path.join(resources_dir, type.name, './outputs.schema.json'),
    JSON.stringify(typeSchema, null, 2),
  );
  })();
}

await Deno.writeTextFile(
    path.join(resources_dir, './inputs-schema.ts'),
    `export default ${JSON.stringify(inputSchemas, null, 2)}`,
);

await Deno.writeTextFile(
    path.join(resources_dir, './outputs-schema.ts'),
    `export default ${JSON.stringify(outputSchemas, null, 2)}`,
  );

console.log('Cleanup');

Deno.removeSync(build_dir, { recursive: true });
