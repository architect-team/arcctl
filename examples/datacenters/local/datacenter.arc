variable "secretsDir" {
  description = "Directory to store secrets in"
  type = "string"
}

module "traefik" {
  build = "./deployment"
  inputs = {
    name = "${datacenter.name}-gateway"
    image = "traefik:v2.10"
    command = [
      "--providers.docker=true",
      "--api.insecure=true",
      "--api.dashboard=true"
    ]
    ports = [{
      internal = 80
      external = 80
    }, {
      internal = 8080
      external = 8080
    }]
  }
}

environment {
  module "postgres" {
    when = contains(environment.databases.*.databaseType, "postgres")
    build = "./deployment"
    inputs = {
      name = "${environment.name}-postgres"
      image = "postgres"
      services = [{
        hostname = "${environment.name}-postgres",
        port = 5432,
        protocol = "postgresql"
      }]
      environment = {
        POSTGRES_PASSWORD = "password"
      }
    }
  }

  database {
    when = node.inputs.databaseType == "postgres"

    module "database" {
      build = "./postgres-db"
      plugin = "opentofu"
      inputs = {
        name = "${environment.name}_${node.component}_${node.name}"
        host = "${environment.name}-postgres.127.0.0.1.nip.io"
        port = 5432
        username = "postgres"
        password = "password"
        database = "postgres"
      }
    }

    outputs = {
      protocol = "postgresql"
      host = "${environment.name}-postgres.127.0.0.1.nip.io"
      port = 5432
      username = "postgres"
      password = "password"
      name = module.database.name
      url = "postgresql://postgres:password@${environment.name}-postgres.127.0.0.1.nip.io:5432/${module.database.name}"
    }
  }

  deployment {
    module "deployment" {
      build = "./deployment"
      inputs = node.inputs
    }
  }

  service {
    module "service" {
      build = "./service"
      inputs = node.inputs
    }

    outputs = {
      protocol = "http"
      host = module.service.host
      port = module.service.port
      url = "http://${module.service.host}:${module.service.port}"
    }
  }

  ingress {
    module "ingressRule" {
      build = "./ingressRule"
      inputs = node.inputs
    }

    outputs = {
      protocol = module.ingressRule.protocol
      host = module.ingressRule.host
      port = module.ingressRule.port
      path = module.ingressRule.path
      url = "${module.ingressRule.protocol}://${module.ingressRule.host}:${module.ingressRule.port}${module.ingressRule.path}"
    }
  }

  secret {
    module "secret" {
      build = "./secret"
      inputs = node.inputs
    }

    outputs = {
      data = module.secret.data
    }
  }
}