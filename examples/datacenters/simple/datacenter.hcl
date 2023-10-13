module "gateway" {
  build = "./empty"
  inputs = {
    name = "test-gateway"
    ingressRule = module.ingress.id
  }
}

module "vpc" {
  build = "./empty"
  inputs = {
    name = "ryan"
  }
}

module "databaseCluster" {
  build = "./empty"
  inputs = {
    name = "gcp-test-11"
    description = "gcp-test"
    databaseSize = "db-f1-micro"
    databaseVersion = "POSTGRES_15"
    databaseType = "postgres"
    password = "architect"
    vpc = "default"
  }
}

module "ingress" {
  build = "./empty"
  inputs = {
    name = "test-ingress-rule"
    serviceId = module.service.id
  }
}

module "service" {
  build = "./empty"
  inputs = {
    name = "test-service"
    namespace = "test-service"
    target_port = 3000
    target_deployment = module.deployment.id
    target_protocol = "http"
    username = "architect"
    password = "dsklandjs98dsc"
    vpc = module.vpc.id
    zone = "us-central1-a"
  }
  outputs {
    id = module.service.id
  }
}

module "deployment" {
  build = "./empty"
  inputs = {
    name = "test-deployment"
    image = "ryancahill444/hello-world"
    port = 3000
    protocol = "http"
    vpc = module.vpc.id
    zone = "us-central1-a"
    instanceType = "e2-micro"
  }
}

module "database" {
  build = "./empty"
  inputs = {
    databaseCluster = module.databaseCluster.id
    name = "gcp-test-11"
  }
}

module "databaseUser" {
  build = "./empty"
  inputs = {
    database = module.database.id
    username = "gcp-test-11"
  }
}