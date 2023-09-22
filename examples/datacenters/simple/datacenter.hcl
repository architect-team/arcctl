variable "dotoken" {
  description = "The digital ocean API token"
  type = "string"
}

module "vpc" {
  source = "./empty"
  inputs = {
    name = "${datacenter.name}-datacenter"
    digitalocean = {
      token = variable.dotoken
    }
  }
}

environment {
  module "namespace" {
    source = "./empty"
    inputs = {
      name = environment.name
    }
  }

  service {
    module "service" {
      source = "./empty"
      inputs = merge(node.inputs, {
        namespace = module.namespace.id
        labels = {
          "io.architect.datacenter" = datacenter.name
          "io.architect.environment" = environment.name
          "io.architect.component" = node.component
        }
      })
    }

    outputs = {
      id = module.service.id
      protocol = module.service.protocol
      host = module.service.host
      port = module.service.port
      url = module.service.url
      account = module.service.account
      name = module.service.name
      target_port = module.service.target_port
      namespace = module.namespace.id
    }
  }

  deployment {
    module "deployment" {
      source = "./empty"
      inputs = merge(node.inputs, {
        namespace = module.namespace.id
        labels = {
          "io.architect.datacenter" = datacenter.name
          "io.architect.environment" = environment.name
          "io.architect.component" = node.component
        }
      })
    }

    outputs = {
      protocol = module.deployment.protocol
      host = module.deployment.host
      port = module.deployment.port
      url = module.deployment.url
      account = module.deployment.account
      name = module.deployment.name
      target_port = module.deployment.target_port
      namespace = module.namespace.id
    }
  }
}