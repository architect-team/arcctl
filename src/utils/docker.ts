import { exec } from './command.ts';

export const getImageLabels = async (tag_or_digest: string): Promise<Record<string, string>> => {
  const { code, stdout, stderr } = await exec('docker', {
    args: ['inspect', '-f', 'json', tag_or_digest],
  });

  if (code !== 0) {
    throw new Error(stderr);
  }

  const results = JSON.parse(stdout);
  if (results.length === 0) {
    throw new Error(`No image found for ${tag_or_digest}`);
  }

  return results[0].Config.Labels || {};
};

/**
 * Gets a sha256 hash of the exported filesystem contents from the specified image
 */
export const getHash = async (tag_or_digest: string): Promise<string> => {
  const { code, stdout, stderr } = await exec('sh', {
    args: [
      '-c',
      `docker create ${tag_or_digest} | { read cid; docker export $cid | tar Oxv 2>&1 | shasum -a 256; docker rm $cid > /dev/null; }`,
    ],
  });

  if (code !== 0) {
    throw new Error(stderr);
  }

  return stdout;
};
