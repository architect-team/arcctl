variable "vpc_id" {
  type        = string
  description = "VPC ID that this cluster is in"
}


variable "region" {
  type        = string
  description = "Region for this cluster"
}

variable "name" {
  type        = string
  description = "Name for this cluster"
}

variable "do_token" {
  type        = string
  description = "digitalocean template"
}
