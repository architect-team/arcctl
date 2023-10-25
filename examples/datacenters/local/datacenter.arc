variable "secretsDir" {
  description = "Directory to store secrets in"
  type = "string"
}

module "traefik" {
  build = "./deployment"

  volume {
    host_path = "/var/run/docker.sock"
    mount_path = "/var/run/docker.sock"
  }

  environment = {
    DOCKER_HOST = "unix:///var/run/docker.sock"
  }

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

    volume {
      host_path = "/var/run/docker.sock"
      mount_path = "/var/run/docker.sock"
    }

    environment = {
      DOCKER_HOST = "unix:///var/run/docker.sock"
    }

    inputs = {
      name = "${environment.name}-postgres"
      image = "postgres"
      ports = [{
        internal = 5432
        external = 5432
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

      volume {
        host_path = "/var/run/docker.sock"
        mount_path = "/var/run/docker.sock"
      }

      environment = {
        DOCKER_HOST = "unix:///var/run/docker.sock"
      }

      inputs = {
        name = "${environment.name}_${node.component}_${node.name}"
        host = "host.docker.internal"
        port = 5432
        username = "postgres"
        password = "password"
        database = "postgres"
      }
    }

    outputs = {
      protocol = "postgresql"
      host = "host.docker.internal"
      port = 5432
      username = "postgres"
      password = "password"
      database = module.database.name
      url = "postgresql://postgres:password@host.docker.internal:5432/${module.database.name}"
    }
  }

  databaseUser {
    outputs = {
      protocol = node.inputs.protocol
      host = node.inputs.host
      port = node.inputs.port
      database = node.inputs.database
      username = node.inputs.username
      password = node.inputs.password
      url = "${node.inputs.protocol}://${node.inputs.username}:${node.inputs.password}@${node.inputs.host}:${node.inputs.port}/${node.inputs.database}"
    }
  }

  deployment {
    module "deployment" {
      build = "./deployment"
      inputs = node.inputs
      
      environment = {
        DOCKER_HOST = "unix:///var/run/docker.sock"
      }

      volume {
        host_path = "/var/run/docker.sock"
        mount_path = "/var/run/docker.sock"
      }
    }
  }

  service {
    outputs = {
      protocol = "${node.inputs.protocol || "http"}"
      host = "${replace(node.inputs.name, "/", "--")}.internal.127.0.0.1.nip.io"
      port = 80
      url = "${node.inputs.protocol || "http"}://${replace(node.inputs.name, "/", "--")}.internal.127.0.0.1.nip.io:${node.inputs.port}"
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
      host = "${node.inputs.subdomain}.127.0.0.1.nip.io"
      port = 80
      url = "${node.inputs.protocol || "http"}://${node.inputs.subdomain}.127.0.0.1.nip.io${node.inputs.path || "/"}"
      path = "${node.inputs.path || "/"}"
    }
  }
}