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
  build = "./vpc"
  inputs = {
    region  = variable.region
    name    = "${datacenter.name}-datacenter"
  }
}

environment {
  module "publicDnsZone" {
    build = "./dnsZone"
    inputs = {
      name = "${environment.name}.${variable.publicDomain}"
    }
  }

  module "privateDnsZone" {
    build = "./dnsZone"
    inputs = {
      name = "${environment.name}.${variable.privateDomain}"
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