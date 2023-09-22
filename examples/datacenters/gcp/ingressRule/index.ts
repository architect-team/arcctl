import * as pulumi from "@pulumi/pulumi";
import * as gcp from '@pulumi/gcp';

const config = new pulumi.Config('ingressRule');

const serviceId = config.require('serviceId');
const https_paths = new gcp.compute.URLMap('service-https-url-map', {
  name: config.require('name'),
  defaultService: serviceId,
});

export const id = https_paths.selfLink;
