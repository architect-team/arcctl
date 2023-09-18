variable "region" {
  type        = "string"
  description = "Region to deploy resources into"
}

variable "domain" {
  type        = "string"
  description = "Base domain that should be used for DNS zones and records"
}

module "vpc" {
  source = "./vpc"
  inputs = {
    region  = variable.region
    name    = "${datacenter.name}-datacenter"
  }
}

module "eksCluster" {
  source = "./eks"
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
    source = "./namespace"
    inputs = {
      name = environment.name
      provider = module.eksCluster.provider
    }
  }

  module "dnsZone" {
    source = "./dnsZone"
    inputs = {
      name = "${environment.name}.${variable.domain}"
    }
  }

  deployment {
    module "deployment" {
      source = "./deployment"
      inputs = node.inputs
    }

    outputs {
      id = module.deployment.outputs.id
    }
  }

  service {
    module "service" {
      source = "./service"
      inputs = node.inputs
    }

    outputs {
      id = module.service.outputs.id
    }
  }

  ingressRule {
    module "ingress" {
      source = "./ingressRule"
      inputs = merge(node.inputs, {
        dnsZone = module.dnsZone.id
      })
    }
  }

  secret {
    module "secret" {
      source = "./secrets"
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
      source = "./database"
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