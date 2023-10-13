variable "region" {
  type        = "string"
  description = "Region to deploy resources into"
}

variable "domain" {
  type        = "string"
  description = "Base domain that should be used for DNS zones and records"
}

module "vpc" {
  build = "./vpc"
  inputs = {
    region  = variable.region
    name    = "${datacenter.name}-datacenter"
  }
}

module "eksCluster" {
  build = "./eks"
  inputs = {
    region  = variable.region
    vpcId   = module.vpc.id
    name    = "${datacenter.name}-cluster"

    nodePools = [{
      name          = "${datacenter.name}-pool-1"
      count         = 3
      size          = "t3.medium"
      capacityType  = "ON_DEMAND"
    }]
  }
}

environment {
  module "namespace" {
    build = "./namespace"
    inputs = {
      name = environment.name
      provider = module.eksCluster.provider
    }
  }

  module "dnsZone" {
    build = "./dnsZone"
    inputs = {
      name = "${environment.name}.${variable.domain}"
    }
  }

  deployment {
    module "deployment" {
      build = "./deployment"
      inputs = node.inputs
    }

    outputs {
      id = module.deployment.id
    }
  }

  service {
    module "service" {
      build = "./service"
      inputs = node.inputs
    }

    outputs {
      id = module.service.id
    }
  }

  ingress {
    module "ingress" {
      build = "./ingressRule"
      inputs = merge(node.inputs, {
        dnsZone = module.dnsZone.id
      })
    }
  }

  secret {
    module "secret" {
      build = "./secrets"
      inputs = node.inputs
    }

    outputs = {
      id = module.secret.id
      value = module.secret.value
    }
  }

  database {
    when = node.inputs.databaseType == "postgres" || node.inputs.databaseType == "mysql"

    module "database" {
      build = "./database"
      inputs = merge(node.inputs, {
        name = node.id
      })
    }

    outputs {
      id = module.database.id
      host = module.database.host
      username = module.database.username
      password = module.database.password
      database = module.database.database
    }
  }
}