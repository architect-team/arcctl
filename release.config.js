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
      'package-lock.json',
      'deno.json',
      'deno.lock',
    ],
  },
];
const exec = [
  '@semantic-release/exec',
  {
    publishCmd: 'npm run pack',
  },
];
const npm = '@semantic-release/npm';
const github = [
  '@semantic-release/github',
  {
    assets: [
      {
        path: 'dist/*.tar.gz',
        label: 'arcctl ${nextRelease.version}',
      },
    ],
  },
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

// eslint-disable-next-line unicorn/prefer-module
module.exports = {
  branches: [
    'main',
    {
      name: 'arcctl-*',
      prerelease: true,
    },
  ],
  plugins: branch === 'main' ? mainPlugins : defaultPlugins,
};

// eslint-disable-next-line unicorn/prefer-module
console.log(module.exports);
