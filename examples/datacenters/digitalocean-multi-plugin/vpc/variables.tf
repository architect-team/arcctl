variable "region" {
  type        = string
  description = "Region for this infrastructure"
  default     = "nyc3"
}

variable "name" {
  type        = string
  description = "Name for this infrastructure"
  default     = "opennottofu-test"
}

variable "do_token" {
  type        = string
  description = "digitalocean template"
}
