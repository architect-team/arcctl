variable "dotoken" {
  description = "The digital ocean API token"
  type = "string"
}

variable "region" {
  description = "The region to create resources in"
  type = "string"
  default = "nyc1"
}

module "vpc" {
  source = "./vpc"
  inputs = {
    region = variable.region
    name = "testpulumi"
    digitalocean = {
      token = variable.dotoken
    }
  }
}

module "k8s" {
  source = "./kcluster"
  inputs = {
    vpcId = module.vpc.id
  }
}

environment {

  module "vpc3" {
    source = "./vpc"
    inputs = {
      region = "nyc3"
      name = module.vpc2.outputs.id
      digitalocean = {
        token = variable.dotoken
      }
    }
  }

  deployment {
    module "deployment" {
      source = "./deployment"
      inputs = {
        name = node.inputs.name
        region = "nyc3"
        test = module.vpc3.outputs.id
      }
    }
  }
}