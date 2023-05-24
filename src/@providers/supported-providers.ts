import aws from './aws/provider.ts';
import digitalocean from './digitalocean/provider.ts';
import kubernetes from './kubernetes/provider.ts';

export const SupportedProviders = {
  aws,
  digitalocean,
  kubernetes,
};
