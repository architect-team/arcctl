import * as docker from "@pulumi/docker";
import * as pulumi from "@pulumi/pulumi";
import { SVC_ROUTER_SUFFIX } from "../settings.ts";
import { TraefikFormattedService } from "../traefik.ts";

let config = new pulumi.Config();

let name: string = config.require('name');
name = name.replaceAll('/', '--') + SVC_ROUTER_SUFFIX;


const targetProtocol = config.get('target_protocol');
const isNotHttp = targetProtocol && targetProtocol !== 'http';

const serviceEntry: TraefikFormattedService = isNotHttp ? {
  tcp: {
    routers: {

    }
  }
} : {
    http: {
    
  }
};

const deployment = new docker.Container("deployment", {
  name: config.get('name'),
  image: config.require('image'),
  command: config.getObject('command'),
  volumes: config.getObject('volume_mounts'),
  ports: config.getObject('exposed_ports'),
});

