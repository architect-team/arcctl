import * as docker from "@pulumi/docker";

const inputs = process.env.INPUTS;
if (!inputs) {
  throw new Error('Missing configuration. Please provide it via the INPUTS environment variable.');
}

type Config = {
  image: string;
  context: string;
  dockerfile?: string;
  target?: string;
  platform?: string;
  args?: Record<string, string>;
}

const config: Config = JSON.parse(inputs);

const build = new docker.Image("image", {
  imageName: config.image,
  skipPush: true,
  build: {
    context: config.context,
    dockerfile: config.dockerfile,
    target: config.target,
    platform: config.platform,
    args: {
      BUILDKIT_INLINE_CACHE: '1',
    },
  },
});

export const image = build.imageName.apply((name) => name.toString());
