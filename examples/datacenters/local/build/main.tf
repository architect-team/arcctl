terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0.2"
    }
  }
}

variable "image" {
  type     = string
  nullable = false
}

variable "context" {
  type     = string
  nullable = false
}

variable "dockerfile" {
  type = string
}

variable "target" {
  type = string
}

variable "platform" {
  type    = string
  default = null
}

variable "args" {
  type = map(string)
}

provider "docker" {}

resource "docker_image" "image" {
  name         = var.image
  force_remove = true
  build {
    context    = var.context
    dockerfile = var.dockerfile
    target     = var.target
    platform   = var.platform
    build_arg  = var.args
  }
}

output "image" {
  value = docker_image.image.image_id
}
