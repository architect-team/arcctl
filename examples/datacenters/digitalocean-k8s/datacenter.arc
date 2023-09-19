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
    name = "${datacenter.name}-datacenter"
    digitalocean = {
      token = variable.dotoken
    }
  }
}

module "k8s" {
  source = "./vpc"
  inputs = {
    name = "${datacenter.name}-cluster"
    region = variable.region
    vpcId = module.vpc.id
    digitalocean = {
      token = variable.dotoken
    }
  }
}

environment {
  module "namespace" {
    source = "./vpc"
    inputs = {
      name = environment.name
      kubeconfig = module.k8s.kubeconfig
    }

    outputs = {
      id = module.namespace.id
    }
  }

  deployment {
    module "deployment" {
      source = "./vpc"
      inputs = merge(node.inputs, {
        namespace = module.namespace.id
        kubeconfig = module.k8s.kubeconfig
        labels = {
          "io.architect.datacenter" = datacenter.name
          "io.architect.environment" = environment.name
          "io.architect.component" = node.component
        }
      })
    }
  }

  service {
    module "service" {
      source = "./vpc"
      inputs = merge(node.inputs, {
        namespace = module.namespace.id
        kubeconfig = module.k8s.kubeconfig
        labels = {
          "io.architect.datacenter" = datacenter.name
          "io.architect.environment" = environment.name
          "io.architect.component" = node.component
        }
      })
    }
  }
}