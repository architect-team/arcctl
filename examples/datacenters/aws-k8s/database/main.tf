variable "name" {
  type = string
}

variable "host" {
  type = string
}

variable "port" {
  type = number
}

variable "username" {
  type = string
}

variable "password" {
  type = string
}


terraform {
  required_providers {
    postgresql = {
      source  = "cyrilgdn/postgresql"
      version = "1.21.0"
    }
  }
}

provider "postgresql" {
  host     = var.host
  port     = var.port
  username = var.username
  password = var.password
}

resource "postgresql_database" "db" {
  name = replace(var.name, "/", "-")
}

output "name" {
  value = replace(var.name, "/", "-")
}
