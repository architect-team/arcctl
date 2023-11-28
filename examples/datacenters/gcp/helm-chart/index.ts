import * as kubernetes from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();
const repo = config.get('repo');

const provider = new kubernetes.Provider("provider", {
  kubeconfig: config.require("kubeconfig"),
});

const fetchOpts: kubernetes.helm.v3.FetchOpts = {};
if (repo) {
  fetchOpts['repo'] = repo;
}

new kubernetes.helm.v3.Chart('chart', {
  chart: config.require('chart'),
  namespace: config.get('namespace') || 'default',
  version: config.get('version'),
  fetchOpts,
  values: config.getObject('values'),
}, { provider });