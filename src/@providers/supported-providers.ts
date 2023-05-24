import aws from './aws/provider.js';
import digitalocean from './digitalocean/provider.js';
import docker from './docker/provider.js';
import kubernetes from './kubernetes/provider.js';
import local from './local/provider.js';

export const SupportedProviders = {
  'aws': aws,
  'digitalocean': digitalocean,
  'docker': docker,
  'kubernetes': kubernetes,
  'local': local,
};
