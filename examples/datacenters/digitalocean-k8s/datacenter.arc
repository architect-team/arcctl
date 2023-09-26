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
    name = "${datacenter.name}-cluster"
    region = variable.region
    vpcId = module.vpc.id
    digitalocean = {
      token = variable.dotoken
    }
  }
}

module "databaseCluster" {
  source = "./databaseCluster"
  inputs = {
    name = "${datacenter.name}-database"
    databaseType = "pg"
    databaseVersion = 14
    region = variable.region
    digitalocean = {
      token = variable.dotoken
    }
  }
}

environment {
  module "namespace" {
    source = "./k8s-namespace"
    inputs = {
      name = environment.name
      kubeconfig = module.k8s.kubeconfig
    }
  }

  database {
    module "database" {
      source = "./database"
      inputs = merge(node.inputs, {
        region = variable.region
      })
    }

    outputs = {
      host = module.database.host
      port = module.database.port
      name = module.database.name
      protocol = module.database.protocol
      account = module.database.account
      username = module.database.username
      password = module.database.password
      url = module.database.url
    }
  }

  databaseUser {
    module "databaseUser" {
      source = "./databaseUser"
      inputs = merge(node.inputs, {
        region = variable.region
      })
    }

    outputs = {
      host = module.databaseUser.host
      port = module.databaseUser.port
      name = module.databaseUser.name
      protocol = module.databaseUser.protocol
      account = module.databaseUser.account
      username = module.databaseUser.username
      password = module.databaseUser.password
      url = module.databaseUser.url
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
      name = module.service.target_port
      protocol = module.service.protocol
      host = module.service.host
      port = module.service.port
      url = module.service.url
      target_port = module.service.target_port
      account = module.service.account
    }
  }
}