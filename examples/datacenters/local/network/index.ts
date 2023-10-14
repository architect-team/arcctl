import * as docker from "@pulumi/docker";
import * as pulumi from "@pulumi/pulumi";

let config = new pulumi.Config();

type Config = {
  name?: string;
  image: string;
  command?: string[];
  labels?: Record<string, string>;
  services?: Record<string, {
    hostname: string;
    port: number;
    protocol: string;
  }>;
  ports?: {
    internal: number;
    external?: number;
  }[];
};

const network = new docker.Network('network', {
  name: config.get('name'),
});

export const name = network.name.apply(name => name.toString());
