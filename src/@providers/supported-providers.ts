import aws from './aws/provider.ts';
import digitalocean from './digitalocean/provider.ts';
import docker from './docker/provider.ts';
import dockerhub from './dockerhub/provider.ts';
import gcp from './gcp/provider.ts';
import kubernetes from './kubernetes/provider.ts';
import local from './local/provider.ts';
import oras from './oras/provider.ts';
import postgres from './postgres/provider.ts';
import traefik from './traefik/provider.ts';

export const SupportedProviders = {
  'aws': aws,
  'digitalocean': digitalocean,
  'docker': docker,
  'dockerhub': dockerhub,
  'gcp': gcp,
  'kubernetes': kubernetes,
  'local': local,
  'oras': oras,
  'postgres': postgres,
  'traefik': traefik,
};
