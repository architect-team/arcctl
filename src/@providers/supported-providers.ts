import aws from './aws/provider.js';
import digitalocean from './digitalocean/provider.js';
import docker from './docker/provider.js';
import kubernetes from './kubernetes/provider.js';
import local from './local/provider.js';
import postgres from './postgres/provider.js';

export const SupportedProviders = {
  'aws': aws,
  'digitalocean': digitalocean,
  'docker': docker,
  'kubernetes': kubernetes,
  'local': local,
  'postgres': postgres,
};
