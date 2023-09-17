variable "dotoken" {
  description = "The digital ocean API token"
  type = "string"
}

module "vpc" {
  source = "./vpc"
  inputs = {
    region = "nyc3"
    name = "testpulumi"
    digitalocean = {
      token = variable.dotoken
    }
  }
}

module "vpc2" {
  source = "./vpc"
  inputs = {
    region = "nyc3"
    name = module.vpc.outputs.id
    digitalocean = {
      token = variable.dotoken
    }
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
      source = "./vpc"
      inputs = {
        name = node.inputs.name
        region = "nyc3"
        test = module.vpc3.outputs.id
        digitalocean = {
          token = variable.dotoken
        }
      }
    }
  }
}