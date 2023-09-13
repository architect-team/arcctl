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

environment {
  database {
    when = node.inputs.databaseType == "postgres" && node.inputs.databaseVersion == "15"

    module "database" {
      source = "./database"
      inputs = merge(node.inputs, {
        name = "${environment.name}-pg"
      })
    }

    module "databaseUser" {
      source = "./databaseUser"
      inputs = merge(node.inputs, {
        host = module.database.outputs.host
        username = module.database.outputs.username
        password = module.database.outputs.password
        database = module.database.outputs.database
      })
    }

    outputs {
      id = module.database.outputs.id
      host = module.database.outputs.host
      username = module.database.outputs.username
      password = module.database.outputs.password
      database = module.database.outputs.database
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
      inputs = merge(node.inputs, {
        dnsZone = "${environment.name}.172.17.0.1.nip.io"
        namespace = environment.name
      })
    }

    outputs {
      id = module.service.outputs.id
    }
  }

  ingressRule {
    module "ingress" {
      source = "./ingressRule"
      inputs = merge(node.inputs, {
        registry = module.gateway.outputs.registry
        dnsZone = "${ environment.name }.127.0.0.1.nip.io"
        namespace = environment.name
      })
    }
  }

  secret {
    module "secret" {
      source = "./secrets"
      inputs = node.inputs
    }
  }
}