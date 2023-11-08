variable "region" {
  type = string
}

variable "name" {
  type = string
}

variable "access_key" {
  type = string
}

variable "secret_key" {
  type = string
}

provider "aws" {
  region     = var.region
  access_key = var.access_key
  secret_key = var.secret_key
}

data "aws_availability_zones" "available" {
  filter {
    name   = "opt-in-status"
    values = ["opt-in-not-required"]
  }
}

module "vpc" {
  source = "terraform-aws-modules/vpc/aws"

  name = "${var.name}-vpc"
  azs  = slice(data.aws_availability_zones.available.names, 0, 3)

  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.4.0/24", "10.0.5.0/24", "10.0.6.0/24"]

  enable_nat_gateway   = true
  single_nat_gateway   = true
  enable_dns_hostnames = true

  tags = {
    architectResourceId = var.name
  }

  public_subnet_tags = {
    architectResourceId      = var.name
    "kubernetes.io/role/elb" = 1
  }

  private_subnet_tags = {
    architectResourceId               = var.name
    "kubernetes.io/role/internal-elb" = 1
  }
}

output "id" {
  value = module.vpc.vpc_id
}
