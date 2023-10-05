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
  source = "./vpc"
  plugin = "opentofu"
  inputs = {
    region = variable.region
    name = "${datacenter.name}-datacenter"
    do_token = variable.do_token
  }
}

module "k8s" {
  source = "./pulumi-k8s-cluster"
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


// module "k8s" {
//   source = "./tofu-k8s-cluster"
//   plugin = "opentofu"
//   inputs = {
//     name = "${datacenter.name}-cluster"
//     region = variable.region
//     vpc_id = module.vpc.id
//     do_token = variable.do_token
//   }
// }
