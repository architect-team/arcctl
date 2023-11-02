variable "database" {
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
    random = {
      source  = "hashicorp/random"
      version = "3.0.1"
    }
    postgresql = {
      source  = "cyrilgdn/postgresql"
      version = "1.21.1-beta.1"
    }
  }
}

provider "random" {
}

resource "random_password" "password" {
  length           = 16
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

provider "postgresql" {
  host      = var.host
  port      = var.port
  username  = var.username
  password  = var.password
  database  = var.database
  superuser = false
  sslmode   = "disable"
}


resource "postgresql_role" "user" {
  name     = var.username
  password = random_password.password.result
  login    = true
}

output "username" {
  value = postgresql_role.user.name
}

output "password" {
  value = postgresql_role.user.password
}
