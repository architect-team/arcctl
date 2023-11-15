variable "database" {
  type = string
}

variable "name" {
  type = string
}

variable "protocol" {
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
      version = "1.21.0"
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
}


resource "postgresql_role" "user" {
  name     = var.name
  password = random_password.password.result
  login    = true
}

# Allow users to modify the public schema
resource "postgresql_grant" "public_schema_access" {
  database    = var.database
  role        = "public"
  schema      = "public"
  object_type = "schema"
  privileges  = ["USAGE", "CREATE"]
}

output "username" {
  value = postgresql_role.user.name
}

output "password" {
  value     = postgresql_role.user.password
  sensitive = true
}

output "url_encoded_password" {
  value     = urlencode(postgresql_role.user.password)
  sensitive = true
}
