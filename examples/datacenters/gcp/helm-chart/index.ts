import * as kubernetes from "@pulumi/kubernetes";

const inputs = process.env.INPUTS;
if (!inputs) {
  throw new Error('Missing configuration. Please provide it via the INPUTS environment variable.');
}

type Config = {
  id?: string;
  repo?: string;
  kubeconfig: string;
  chart: string;
  namespace?: string;
  version?: string;
  values?: Array<any>;
};

const config: Config = JSON.parse(inputs);

const provider = new kubernetes.Provider("provider", {
  kubeconfig: config.kubeconfig,
});

const fetchOpts: kubernetes.helm.v3.FetchOpts = {};
if (config.repo) {
  fetchOpts['repo'] = config.repo;
}

new kubernetes.helm.v3.Chart('chart', {
  chart: config.chart,
  namespace: config.namespace,
  version: config.version,
  fetchOpts,
  values: config.values,
}, { provider });

export const id = config.id;