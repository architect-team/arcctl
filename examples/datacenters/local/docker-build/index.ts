import * as docker from "@pulumi/docker";
import { ContainerLabel, ContainerPort } from "@pulumi/docker/types/input";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();

const build = new docker.Image("image", {
  imageName: config.require("image"),
  skipPush: true,
  build: {
    context: config.require("context"),
    dockerfile: config.get("dockerfile"),
    target: config.get("target"),
    platform: config.get("platform"),
    args: config.getObject("args"),
  },
});

export const image = build.imageName.apply((name) => name.toString());
