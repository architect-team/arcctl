import aws from './aws/provider.js';
import digitalocean from './digitalocean/provider.js';
import kubernetes from './kubernetes/provider.js';

export const SupportedProviders = {
  aws,
  digitalocean,
  kubernetes,
};
