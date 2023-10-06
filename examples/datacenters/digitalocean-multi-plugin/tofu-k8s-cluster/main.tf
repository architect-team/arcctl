terraform {
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
  }
}

provider "digitalocean" {
  token = var.do_token
}

resource "digitalocean_kubernetes_cluster" "cluster" {
  name     = var.name
  region   = var.region
  vpc_uuid = var.vpc_id
  version  = "1.27.6-do.0"

  node_pool {
    name       = "${var.name}-pool-1"
    size       = "s-1vcpu-2gb"
    node_count = 1
  }
}
