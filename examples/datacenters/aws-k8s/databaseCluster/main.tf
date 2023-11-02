variable "access_key" {
  type = string
}

variable "secret_key" {
  type = string
}

variable "region" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "name" {
  type = string
}

variable "databaseType" {
  type = string
}

variable "databaseVersion" {
  type = number
}

variable "databaseSize" {
  type = string
}

provider "aws" {
  region     = var.region
  access_key = var.access_key
  secret_key = var.secret_key
}

locals {
  databaseName = replace(var.name, "/", "-")
}

data "aws_subnets" "vpc_subnets" {
  filter {
    name   = "vpc-id"
    values = [var.vpc_id]
  }
}

resource "aws_security_group" "db_security_group" {
  name        = "database-${local.databaseName}"
  description = "Allow database access"
  vpc_id      = var.vpc_id
  ingress {
    protocol    = "tcp"
    from_port   = 5432
    to_port     = 5432
    cidr_blocks = ["0.0.0.0/0"]
  }
}


resource "aws_db_subnet_group" "db_subnet_group" {
  subnet_ids = data.aws_subnets.vpc_subnets.ids
  name       = "db-subnet-group-${local.databaseName}"
}

module "db" {
  source = "terraform-aws-modules/rds/aws"

  identifier             = local.databaseName
  publicly_accessible    = true
  engine                 = var.databaseType
  engine_version         = var.databaseVersion
  vpc_security_group_ids = [aws_security_group.db_security_group.id]
  instance_class         = var.databaseSize

  allocated_storage    = 50
  storage_encrypted    = false
  username             = "arcctl"
  db_subnet_group_name = aws_db_subnet_group.db_subnet_group.name
  family               = "${var.databaseType}${var.databaseVersion}"
}

data "aws_secretsmanager_secret" "db_secrets" {
  arn = module.db.db_instance_master_user_secret_arn
}

data "aws_secretsmanager_secret_version" "db_secret_version" {
  secret_id = data.aws_secretsmanager_secret.db_secrets.id
}

output "id" {
  value = module.db.db_instance_identifier
}

output "username" {
  value = module.db.db_instance_username
}

output "password" {
  # TODO: The key is probably wrong here
  value     = jsondecode(data.aws_secretsmanager_secret_version.db_secret_version.secret_string)["DATABASE_PASSWORD"]
  sensitive = true
}

output "host" {
  value = module.db.db_instance_address
}

output "port" {
  value = module.db.db_instance_port
}

output "database" {
  # TODO:
  value = "database-name"
}

# output "certificate" {
# }
