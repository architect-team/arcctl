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
      'yarn.lock',
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
        label: 'Architect-CLI ${nextRelease.version}',
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
const backmerge = [
  '@saithodev/semantic-release-backmerge',
  {
    branches: ['rc'],
    // Makes sure that only pushed changes are backmerged
    clearWorkspace: true,
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

module.exports = {
  branches: [
    'main',
    {
      name: 'rc',
      prerelease: true,
    },
    {
      name: 'arcctl-*',
      prerelease: true,
    },
  ],
  plugins: branch === 'main' ? mainPlugins : defaultPlugins,
};

console.log(module.exports);
