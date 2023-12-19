terraform {
  required_providers {
    postgresql = {
      source  = "cyrilgdn/postgresql"
      version = ">= 1.21.0"
    }
  }
}

variable "name" {
  description = "Name of the new database"
}

variable "host" {}

variable "port" {
  default = 5432
}

variable "database" {
  default     = "postgres"
  description = "Name of an existing database to connect to (required in PG)"
}

variable "username" {
  default = "postgres"
}

variable "password" {}

locals {
  name = replace(var.name, "/", "_")
}

provider "postgresql" {
  host     = var.host
  port     = var.port
  database = var.database
  username = var.username
  password = var.password
  sslmode  = "disable"
}

resource "postgresql_database" "my_db" {
  name = local.name
}

output "name" {
  description = "Name of the database that was created"
  value       = local.name
}
