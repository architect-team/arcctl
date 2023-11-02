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
      version = "1.21.1-beta.1"
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
  name = var.name
}

output "name" {
  value = var.name
}
