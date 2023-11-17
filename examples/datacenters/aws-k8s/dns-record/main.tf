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

variable "alb_name" {
  type        = string
  description = "Name of the ALB"
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

data "aws_route53_zone" "zone" {
  name = "${var.dns_zone}."
}

data "aws_lb" "alb" {
  name = replace(var.alb_name, "/", "-")
}

resource "aws_route53_record" "www" {
  zone_id = data.aws_route53_zone.zone.zone_id
  type    = var.type
  name    = var.subdomain

  alias {
    name                   = data.aws_lb.alb.dns_name
    zone_id                = data.aws_lb.alb.zone_id
    evaluate_target_health = true
  }
}
