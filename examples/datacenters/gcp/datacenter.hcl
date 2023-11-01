variable "gcp_credentials_file" {  # "file:/home/ryan/Downloads/permanent-environment-testing-6f237ea8779d.json"
  description = "GCP credentials file"
  type = "string"
}

variable "gcp_project" {
  description = "GCP project in which to create resources"
  type = "string"
}

variable "gcp_region" {
description = "GCP region in which to create resources"
  type = "string"
}

module "network" {
  build = "./vpc"
  source = "./vpc"
  plugin = "pulumi"
  inputs = {
    name = datacenter.name

    "gcp:region" = var.gcp_region
    "gcp:project" = var.gcp_project
    "gcp:credentials" = "file:${var.gcp_credentials_file}"
  }
}

module "kubernetesCluster" {
  build = "./kubernetesCluster"
  source = "./kubernetesCluster"
  plugin = "pulumi"
  inputs = {
    name = datacenter.name

    "gcp:region" = var.gcp_region
    "gcp:project" = var.gcp_project
    "gcp:credentials" = "file:${var.gcp_credentials_file}"

    "kubernetes:nodePools": "[{\"count\":2,\"name\":\"test-pool\",\"nodeSize\":\"e2-medium\"}]"
    "kubernetes:vpc" = module.network.name
  }
}

environment {
  module "namespace" {
    build = "./kubernetesNamespace"
    source = "./kubernetesNamespace"
    plugin = "pulumi"
    inputs = {
      name = environment.name
      kubeconfig = module.kubernetesCluster.kubeconfig
    }
  }

  module "deployment" {
    build = "./kubernetesDeployment"
    source = "./kubernetesDeployment"
    plugin = "pulumi"
    inputs = {
      name = environment.name
      namespace = module.namespace.name
      image = "ryancahill444/hello-world"
      port = 3000
      replicas = 1

      kubeconfig = module.kubernetesCluster.kubeconfig
    }
  }
}
