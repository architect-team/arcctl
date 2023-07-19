import { build, emptyDir } from "dnt";
import { walk } from "std/fs/walk.ts";
import * as path from "std/path/mod.ts";

const __dirname = new URL(".", import.meta.url).pathname;
const build_dir = path.join(__dirname, "../build");

await emptyDir(build_dir);

await build({
  typeCheck: false,
  test: false,
  entryPoints: [path.join(build_dir, "..", "src", "index.ts")],
  outDir: build_dir,
  compilerOptions: {
    lib: ["ES2022", "DOM"],
    target: "ES2020",
  },
  shims: {
    crypto: true,
    deno: true,
    timers: true,
    undici: true,
  },
  package: {
    name: "@architect-io/arcctl",
    description:
      "arcctl standardizes the interfaces for common cloud resources like VPCs, managed kubernetes clusters, and more, making it easier for developers to create and manage on-demand cloud infrastructure",
    license: "Apache-2.0",
    engines: { node: ">=12.0.0" },
    homepage: "https://github.com/architect-team/arcctl",
    repository: "architect-team/arcctl",
    bugs: "https://github.com/architect-team/arcctl/issues",
    scripts: {
      "semantic-release":
        "./node_modules/semantic-release/bin/semantic-release.js",
    },
    main: "esm/index.js",
    version: "0.0.58-rc",
  },
  importMap: path.join(build_dir, "..", "import_map.json"),
  scriptModule: false,
});

// Copy files from the root dir into npm package.
await Deno.copyFile("LICENSE.md", path.join(build_dir, "LICENSE.md"));
await Deno.copyFile("README.md", path.join(build_dir, "README.md"));
await Deno.copyFile(
  "release.config.js",
  path.join(build_dir, "release.config.js"),
);

// Copy all *.schema.json files into the npm package
for await (const dirEntry of walk(path.join(__dirname, "..", "src"))) {
  if (dirEntry.isFile && dirEntry.name.endsWith(".schema.json")) {
    // Get rid of everything up to  the src/ folder
    const src_relative_path = dirEntry.path.replace(
      new RegExp(`.*${path.SEP}src${path.SEP}`),
      "",
    ).split(path.SEP);
    await Deno.copyFile(
      dirEntry.path,
      path.join(build_dir, "esm", ...src_relative_path),
    );
  }
}
