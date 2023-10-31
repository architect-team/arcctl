variable "domain" {
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

data "digitalocean_domain" "domain" {
  name = var.domain
}

# Add an A record to the domain for www.example.com.
resource "digitalocean_record" "www" {
  domain = digitalocean_domain.domain.id
  type   = var.type
  name   = var.subdomain
  value  = var.value
}
