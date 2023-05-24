import aws from './aws/index.ts';
import digitalocean from './digitalocean/index.ts';
import docker from './docker/index.ts';
import kubernetes from './kubernetes/index.ts';

export const SupportedProviders = {
  'aws': aws,
  'digitalocean': digitalocean,
  'docker': docker,
  'kubernetes': kubernetes,
};
