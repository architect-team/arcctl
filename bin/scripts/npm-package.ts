import * as path from 'std/path/mod.ts';
import { build, emptyDir } from 'dnt';

const __dirname = new URL('.', import.meta.url).pathname;
const build_dir = path.join(__dirname, '..', '..', 'build');

await emptyDir(build_dir);

// Builds the schema into an npm package. This will convert files to .js and .d.ts with
// Deno shims so that "ts-json-schema-generator" can be run on it and infer types properly.
await build({
  typeCheck: false,
  test: false,
  entryPoints: [path.join(build_dir, '..', 'src', 'index.ts')],
  outDir: build_dir,
  compilerOptions: {
    lib: ['ES2022'],
    target: 'ES2020',
  },
  shims: {
    deno: true,
  },
  // TODO: Should use the info from existing package.json
  package: {
    name: 'arcctl',
    version: '0.0.1-rc',
    description: 'arcctl',
  },
});
