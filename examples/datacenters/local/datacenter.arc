variable "secretsDir" {
  description = "Directory to store secrets in"
  type = "string"
}

module "traefikRegistry" {
  build = "./volume"
  inputs = {
    name = "${datacenter.name}-traefik-registry"
  }
}

module "traefik" {
  build = "./deployment"
  inputs = {
    name = "${datacenter.name}-gateway"
    image = "traefik:v2.10"
    volume_mounts = [{
      mount_path = "/etc/traefik"
      volume = module.traefikRegistry.volume
    }]
    command = [
      "--providers.file.directory=/etc/traefik",
      "--providers.file.watch=true",
      "--api.insecure=true",
      "--api.dashboard=true"
    ]
    exposed_ports = [{
      port = 80
      target_port = 80
    }, {
      port = 8080
      target_port = 8080
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
      exposed_ports = [{
        target_port = 5432
      }]
      environment = {
        POSTGRES_USER = "postgres"
        POSTGRES_PASSWORD = "password"
      }
    }
  }

  module "mysql" {
    when = contains(environment.databases.*.databaseType, "mysql")
    build = "./deployment"
    inputs = {
      name = "${environment.name}-mysql"
      image = "mysql"
      exposed_ports = [{
        target_port = 3306
      }]
      environment = {
        MYSQL_ROOT_PASSWORD = "password"
      }
    }
  }

  database {
    when = node.inputs.databaseType == "postgres"

    module "database" {
      build = "./postgres-db"
      inputs = {
        name = "${node.component}_${node.name}"
        host = module.postgres.host
        port = module.postgres.ports[0]
        username = "user"
        password = "password"
      }
    }

    outputs = {
      protocol = "postgresql"
      host = module.postgres.host
      port = module.postgres.ports[0]
      username = module.database.username
      password = module.database.password
      name = module.database.name
      url = "postgresql://${module.database.username}:${module.database.password}@${module.database.host}:${module.database.port}/${module.database.name}"
    }
  }

  database {
    when = node.inputs.databaseType == "mysql"

    module "database" {
      build = "./mysql-db"
      inputs = {
        name = "${node.component}_${node.name}"
        host = module.mysql.host
        port = module.mysql.ports[0]
        username = "root"
        password = "password"
      }
    }

    outputs = {
      protocol = "mysql"
      host = module.postgres.host
      port = module.postgres.ports[0]
      username = module.database.username
      password = module.database.password
      name = module.database.name
      url = "mysql://${module.database.username}:${module.database.password}@${module.database.host}:${module.database.port}/${module.database.name}"
    }
  }

  deployment {
    module "deployment" {
      build = "./deployment"
      inputs = merge(node.inputs, {})
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