import * as kubernetes from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();

const provider = new kubernetes.Provider("provider", {
  kubeconfig: config.require("kubeconfig"),
});

new kubernetes.apiextensions.CustomResource(
  "resource",
  config.requireObject<kubernetes.apiextensions.CustomResourceArgs>('manifest'),
  { provider }
);