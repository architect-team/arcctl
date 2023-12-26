import * as gcp from '@pulumi/gcp';

const inputs = process.env.INPUTS;
if (!inputs) {
  throw new Error('Missing configuration. Please provide it via the INPUTS environment variable.');
}

type Config = {
  serviceId: string;
  name: string;
};

const config: Config = JSON.parse(inputs);

const https_paths = new gcp.compute.URLMap('service-https-url-map', {
  name: config.name,
  defaultService: config.serviceId,
});

export const id = https_paths.selfLink;
