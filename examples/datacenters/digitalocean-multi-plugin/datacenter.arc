variable "do_token" {
  description = "The digital ocean API token"
  type = "string"
}

variable "region" {
  description = "The region to create resources in"
  type = "string"
  default = "nyc3"
}

module "vpc" {
  build = "./vpc"
  plugin = "opentofu"
  inputs = {
    region = variable.region
    name = "${datacenter.name}-datacenter"
    do_token = variable.do_token
  }
}

module "k8s" {
  build = "./pulumi-k8s-cluster"
  plugin = "pulumi"
  inputs = {
    name = "${datacenter.name}-cluster"
    region = variable.region
    vpcId = module.vpc.id
    digitalocean = {
      token = variable.do_token
    }
  }
}
