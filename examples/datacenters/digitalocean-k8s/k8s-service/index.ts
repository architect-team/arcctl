import * as kubernetes from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();

const provider = new kubernetes.Provider("provider", {
  kubeconfig: config.require("kubeconfig"),
});
const name = config.require('name').replace(/\//g, '-');

const flatten = (obj: any, prefix: string = ''): any => {
  const result: any = {};
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (typeof value === 'object') {
      Object.assign(result, flatten(value, `${prefix}${key}.`));
    } else {
      result[`${prefix}${key}`.replace(/\//g, '-')] = value.replace(/\//g, '-');
    }
  }
  return result;
}

export const labels = flatten(config.getObject('labels') || {} as any);
labels['app'] = name.replace(/\//g, '-');

pulumi.log.info(JSON.stringify(labels));

const service = new kubernetes.core.v1.Service('service', {
  metadata: {
    name: name,
    namespace: config.require('namespace'),
    labels: labels as any,
    annotations: {
      "pulumi.com/skipAwait": "true"
    },
  },
  spec: {
    selector: {
      app: config.require('target_deployment').replace(/\//g, '-'),
    },
    ports: [{
      port: config.requireNumber('target_port'),
    }]
  }
}, {
  provider,
});

export const id = service.id;
export const url = name;
export const host = name;
export const port = config.requireNumber('target_port');
