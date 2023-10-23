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
    volumes = [{
      containerPath = "/var/run/docker.sock",
      hostPath = "/var/run/docker.sock"
    }]
    environment = {
      DOCKER_HOST = "unix:///var/run/docker.sock"
    }
  }
}

environment {
  module "postgres" {
    when = contains(environment.nodes.*.inputs.databaseType, "postgres")
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

  databaseUser {
    outputs = {
      protocol = "postgresql"
      host = "${environment.name}-postgres.127.0.0.1.nip.io"
      port = 5432
      database = node.inputs.database
      username = node.inputs.username
      password = "password"
      url = "postgresql://${node.inputs.username}:password@${environment.name}-postgres.127.0.0.1.nip.io:5432/${node.inputs.database}"
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
      port = 80
      url = "http://${module.service.host}"
    }
  }

  secret {
    module "secret" {
      build = "./secret"
      plugin = "opentofu"
      inputs = {
        filename = "${var.secretsDir}/${environment.name}/${node.component}/${node.name}.json"
        content = node.inputs.data
      }
    }

    outputs = {
      data = node.inputs.data
    }
  }

  ingress {
    outputs = {
      protocol = "${node.inputs.protocol || "http"}"
      host = "${node.inputs.service}.127.0.0.1.nip.io"
      port = 80
      url = "${node.inputs.protocol || "http"}://${node.inputs.service}.127.0.0.1.nip.io${node.inputs.path || "/"}"
      path = "${node.inputs.path || "/"}"
    }
  }
}