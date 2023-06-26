const { GIT_BRANCH: branch } = process.env;

const commitAnalyzer = '@semantic-release/commit-analyzer';
const releaseNotesGenerator = '@semantic-release/release-notes-generator';
const git = [
  '@semantic-release/git',
  {
    assets: [
      'CHANGELOG.md',
      'README.md',
      'package.json',
      'deno.json',
      'deno.lock',
    ],
  },
];
const exec = [
  '@semantic-release/exec',
  {
    prepareCmd: `deno task generate:npm`,
  },
];
const npm = [
  '@semantic-release/npm',
  {
    'pkgRoot': './build'
  }
];
const github = [
  '@semantic-release/github',
];
const changelog = [
  '@semantic-release/changelog',
  {
    changelogFile: 'CHANGELOG.md',
  },
];

const defaultPlugins = [
  commitAnalyzer,
  releaseNotesGenerator,
  exec,
  npm,
  git,
];

const mainPlugins = [
  commitAnalyzer,
  releaseNotesGenerator,
  changelog,
  exec,
  npm,
  git,
  github,
];

module.exports = {
  dryRun: true, // TODO: remove
  branches: [
    'main',
    {
      name: 'arcctl-*',
      prerelease: true,
    },
  ],
  plugins: branch === 'main' ? mainPlugins : defaultPlugins,
};

console.log(module.exports);
