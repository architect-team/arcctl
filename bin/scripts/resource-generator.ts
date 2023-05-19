#!/usr/bin/env ts-node
import { execa } from 'execa';
import fs from 'fs/promises';
import Listr from 'listr';
import Mustache from 'mustache';
import path from 'path';
import url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const resourcesDir = path.join(__dirname, '../../src', '@resources');

const allTypes = (await fs.readdir(resourcesDir, { withFileTypes: true }))
  // eslint-disable-next-line unicorn/no-await-expression-member
  .filter((dirent) => dirent.isDirectory() && dirent.name !== '__tests__')
  .map((dirent) => ({
    name: dirent.name,
    slug: dirent.name.replace(/-([\dA-Za-z])/g, (g) => g[1].toUpperCase()),
  }));

const listrTasks = new Listr([
  {
    title: 'Create master resource types file',
    task: async () =>
      new Promise<void>(async (resolve) => {
        fs.writeFile(
          path.join(resourcesDir, 'types.ts'),
          Mustache.render(
            await fs.readFile(
              path.join(resourcesDir, 'types.ts.stache'),
              'utf8',
            ),
            { types: allTypes },
          ),
        );
        resolve();
      }),
  },
  {
    title: 'Create master resources input types schema',
    task: () =>
      new Promise<void>(async (resolve, reject) => {
        const inputSchemaPath = path.join(resourcesDir, 'input.schema.json');
        const inputSchemaString = await fs.readFile(inputSchemaPath, 'utf8');
        const inputSchema = JSON.parse(inputSchemaString);
        const { stdout: newInputSchemaString } = await execa(
          path.join(
            __dirname,
            '../../node_modules/.bin/ts-json-schema-generator',
          ),
          [
            '--path',
            path.join(resourcesDir, 'types.ts'),
            '--type',
            'InputSchema',
          ],
        );

        const newInputSchema = JSON.parse(newInputSchemaString);
        inputSchema.$ref = newInputSchema.$ref;
        inputSchema.definitions = newInputSchema.definitions;

        await fs.writeFile(
          inputSchemaPath,
          JSON.stringify(inputSchema, null, 2),
        );
        resolve();
      }),
  },
]);

for (const type of allTypes) {
  listrTasks.add({
    title: `Create ${type.name} input schema`,
    task: () =>
      new Promise<void>(async (resolve, reject) => {
        const { stdout: typeSchemaString } = await execa(
          path.join(
            __dirname,
            '../../node_modules/.bin/ts-json-schema-generator',
          ),
          [
            '--path',
            path.join(resourcesDir, type.name, './inputs.ts'),
            '--type',
            '*',
          ],
        );

        const typeSchema = JSON.parse(typeSchemaString);
        await fs.writeFile(
          path.join(resourcesDir, type.name, './inputs.schema.json'),
          JSON.stringify(typeSchema, null, 2),
        );
        resolve();
      }),
  });
}

try {
  listrTasks.run();
} catch (err) {
  console.error(err);
}
