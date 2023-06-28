import aws from './aws/provider.ts';
import digitalocean from './digitalocean/provider.ts';
import docker from './docker/provider.ts';
import gcp from './gcp/provider.ts';
import kubernetes from './kubernetes/provider.ts';
import local from './local/provider.ts';
import postgres from './postgres/provider.ts';
import traefik from './traefik/provider.ts';

export const SupportedProviders = {
  'aws': aws,
  'digitalocean': digitalocean,
  'docker': docker,
  'gcp': gcp,
  'kubernetes': kubernetes,
  'local': local,
  'postgres': postgres,
  'traefik': traefik,
};
