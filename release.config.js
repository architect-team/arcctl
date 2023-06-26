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
const npm = '@semantic-release/npm';
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
  npm,
  git,
];

const mainPlugins = [
  commitAnalyzer,
  releaseNotesGenerator,
  changelog,
  npm,
  git,
  github,
];

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

console.log(module.exports);
