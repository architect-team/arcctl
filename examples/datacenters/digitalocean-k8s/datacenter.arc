variable "dotoken" {
  description = "The digital ocean API token"
  type = "string"
}

variable "region" {
  description = "The region to create resources in"
  type = "string"
  default = "nyc1"
}

module "vpc" {
  build = "./vpc"
  inputs = {
    region = variable.region
    name = "${datacenter.name}-datacenter"
    digitalocean = {
      token = variable.dotoken
    }
  }
}

module "k8s" {
  build = "./k8s-cluster"
  inputs = {
    name = "${datacenter.name}-cluster"
    region = variable.region
    vpcId = module.vpc.id
    digitalocean = {
      token = variable.dotoken
    }
  }
}

module "databaseCluster" {
  build = "./databaseCluster"
  inputs = {
    name = "${datacenter.name}-database"
    databaseType = "pg"
    databaseVersion = 14
    region = variable.region
    vpcId = module.vpc.id
    digitalocean = {
      token = variable.dotoken
    }
  }
}

environment {
  module "namespace" {
    build = "./k8s-namespace"
    inputs = {
      name = environment.name
      kubeconfig = module.k8s.kubeconfig
    }
  }

  secret {
    module "secret" {
      build = "./secrets"
      inputs = merge(node.inputs, {
        name = node.name
        namespace = module.namespace.id
        kubeconfig = module.k8s.kubeconfig
      })
    }

    outputs = {
      data = module.secret.data
    }
  }

  database {
    module "database" {
      build = "./database"
      inputs = merge(node.inputs, {
        region = variable.region
        digitalocean = {
          token = variable.dotoken
        }
      })
    }

    outputs = {
      host = module.database.host
      port = module.database.port
      protocol = module.database.protocol
      username = module.database.username
      password = module.database.password
      url = module.database.url
      // NOTE: This is currently just set to "test", need to do something real here
      database = module.database.database
    }
  }

  ingress {
    module "ingressRule" {
      build = "./ingressRule"
      inputs = merge(node.inputs, {})
    }

    outputs = {
      protocol = "http"
      host = module.ingressRule.host
      port = module.ingressRule.port
      username = module.ingressRule.username
      password = module.ingressRule.password
      url = module.ingressRule.url
      path = module.ingressRule.path
    }
  }

  databaseUser {
    module "databaseUser" {
      build = "./databaseUser"
      inputs = merge(node.inputs, {
        region = variable.region
        digitalocean = {
          token = variable.dotoken
        }
      })
    }

    outputs = {
      host = module.databaseUser.host
      port = module.databaseUser.port
      protocol = module.databaseUser.protocol
      username = module.databaseUser.username
      password = module.databaseUser.password
      url = module.databaseUser.url
      database = "test"
    }
  }

  deployment {
    module "deployment" {
      build = "./k8s-deployment"
      inputs = merge(node.inputs, {
        name = node.name
        namespace = module.namespace.id
        kubeconfig = module.k8s.kubeconfig
      })
    }
  }

  service {
    module "service" {
      build = "./k8s-service"
      inputs = merge(node.inputs, {
        namespace = module.namespace.id
        kubeconfig = module.k8s.kubeconfig
        labels = {
          // TODO: Currently doesn't work with the way we flatten objects in the Plugin
          // "io.architect.datacenter" = datacenter.name
          // "io.architect.environment" = environment.name
          // "io.architect.component" = node.component
        }
      })
    }

    outputs = {
      protocol = module.service.protocol
      host = module.service.host
      port = module.service.port
      url = module.service.url
    }
  }
}