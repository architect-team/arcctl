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

provider "postgresql" {
  host     = var.host
  port     = var.port
  database = var.database
  username = var.user
  password = var.password
}

resource "postgresql_database" "my_db" {
  name = var.name
}

output "name" {
  description = "Name of the database that was created"
  value       = var.name
}