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
  source = "./k8s-cluster"
  inputs = {
<<<<<<< HEAD
    name = "${datacenter.name}-cluster"
    region = variable.region
    vpcId = module.vpc.id
    digitalocean = {
      token = variable.dotoken
    }
=======
    vpcId = module.vpc.id
>>>>>>> 1a422a24a726588122ac56ff489d33dba81ee1cf
  }
}

environment {
  module "namespace" {
    source = "./k8s-namespace"
    inputs = {
<<<<<<< HEAD
      name = environment.name
      kubeconfig = module.k8s.kubeconfig
=======
      region = "nyc3"
      name = module.vpc.id
      digitalocean = {
        token = variable.dotoken
      }
>>>>>>> 1a422a24a726588122ac56ff489d33dba81ee1cf
    }
  }

  deployment {
    module "deployment" {
      source = "./k8s-deployment"
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

    outputs = {
      id = module.deployment.id
    }
  }

  service {
    module "service" {
      source = "./k8s-service"
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

    outputs = {
      id = module.service.id
      host = module.service.host
      port = module.service.port
    }
  }
}