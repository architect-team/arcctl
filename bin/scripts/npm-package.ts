import { build, emptyDir } from 'dnt';
import * as path from 'std/path/mod.ts';

const __dirname = new URL('.', import.meta.url).pathname;
const build_dir = path.join(__dirname, '..', '..', 'build');

await emptyDir(build_dir);

const package_json = JSON.parse(await Deno.readTextFile(path.join(build_dir, '..', 'package.json')));

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
    name: '@architect-io/arcctl',
    version: '0.0.9-rc',
    dependencies: package_json.dependencies
  },
  importMap: path.join(build_dir, '..', 'deno.json'),
  postBuild() {
    Deno.copyFileSync("src/components/component.schema.json", "build/esm/components/component.schema.json");
    Deno.copyFileSync("src/environments/environment.schema.json", "build/esm/environments/environment.schema.json");
    Deno.copyFileSync("src/datacenters/datacenter.schema.json", "build/esm/datacenters/datacenter.schema.json");
  },
});
