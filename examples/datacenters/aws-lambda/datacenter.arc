variable "region" {
  type        = "string"
  description = "Region to deploy resources into"
}

variable "publicDomain" {
  type        = "string"
  description = "Base domain that should be used for external DNS (e.g. ingresses)"
}

variable "privateDomain" {
  type = "string"
  description = "Base domain that should be used for internal DNS (e.g. services)"
}

module "vpc" {
  source = "./vpc"
  inputs = {
    region  = variable.region
    name    = "${datacenter.name}-datacenter"
  }
}

environment {
  module "publicDnsZone" {
    source = "./dnsZone"
    inputs = {
      name = "${environment.name}.${variable.publicDomain}"
    }
  }

  module "privateDnsZone" {
    source = "./dnsZone"
    inputs = {
      name = "${environment.name}.${variable.privateDomain}"
    }
  }

  deployment {
    module "deployment" {
      source = "./deployment"
      inputs = node.inputs
    }

    outputs {
      id = module.deployment.id
    }
  }

  service {
    module "service" {
      source = "./service"
      inputs = node.inputs
    }

    outputs {
      id = module.service.id
    }
  }

  ingress {
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