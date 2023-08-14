variable "account" {
  type = "arcctlAccount"
  description = "The docker account to use for this datacenter"
  provider = "docker"
}

variable "secretAccount" {
  type = "arcctlAccount"
  description = "The account used to store secrets"
}

volume "service-registry" {
  name = "traefik-volume"
  account = variable.account
}

deployment "gateway" {
  name = "my-gateway"
  account = variable.account
  exposed_ports = [
    {
      port = 80
      target_port = 80
    },
    {
      port = 8080
      target_port = 8080
    }
  ]
  image = "traefik:v2.10"
  command = [
    "--providers.file.directory=/etc/traefik",
    "--providers.file.watch=true",
    "--api.insecure=true",
    "--api.dashboard=true"
  ]
  volume_mounts = [
    {
      mount_path = "/etc/traefik"
      readonly = true
      volume = volume.service-registry.id
    }
  ]
}

account "gateway" {
  name = "local-gateway"
  provider = "traefik"
  credentials = {
    type = "volume"
    volume = volume.service-registry.id
    account = variable.account
  }
}

environment {

  defaults {
    account = variable.account
    namespace = environment.name
  }

  databaseCluster "pg" {
    account = variable.account
    name = "${environment.name}-pg"
    databaseType = "postgres"
    databaseVersion = "13"
    databaseSize = "n/a"
    vpc = "n/a"
    region = "n/a"
  }

  account "pg" {
    name = "${environment.name}-postgres-db"
    provider = "postgres"
    credentials = {
      host = environment.databaseCluster.pg.host
      port = environment.databaseCluster.pg.port
      username = environment.databaseCluster.pg.username
      password = environment.databaseCluster.pg.password
      databaseCluster = "architect"
    }
  }

  hook "service" {
    when = {
      type = "service"
    }
    account = account.gateway.id
    dnsZone = "${environment.name}.172.17.0.1.nip.io"
    namespace = environment.name
  }

  hook "ingressRule" {
    when = {
      type = "ingressRule"
    }
    account = account.gateway.id
    registry = volume.service-registry.id
    dnsZone = "${environment.name}.127.0.0.1.nip.io"
    namespace = environment.name
  }

  hook "database" {
    when = {
      type = "database"
    }
    account = environment.account.pg.id
  }

  hook "kratos-deployment" {
    when = {
      type = "deployment"
      image = "oryd/kratos-selfservice-ui-node:v0.13.0"
    }
    platform = "linux/amd64"
  }

  hook "secrets" {
    when = {
      type = "secret"
    }
    account = variable.secretAccount
  }
}