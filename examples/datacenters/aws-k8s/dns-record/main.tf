variable "access_key" {
  type = string
}

variable "secret_key" {
  type = string
}

variable "region" {
  type = string
}

variable "dns_zone" {
  type        = string
  description = "Domain to create a record in"
}

variable "type" {
  type        = string
  description = "Type of the record"
}

variable "subdomain" {
  type        = string
  description = "Subdomain to create a record in"
}

variable "value" {
  type        = string
  description = "Value of the record"
}

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.23.1"
    }
  }
}


provider "aws" {
  region     = var.region
  access_key = var.access_key
  secret_key = var.secret_key
}

resource "aws_route53_record" "www" {
  zone_id = var.dns_zone
  type    = var.type
  name    = var.subdomain
  ttl     = 24 * 60 * 60
  records = [var.value]
}
