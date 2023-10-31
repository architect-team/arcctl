variable "filename" {
  description = "File to store the secret data in"
}

variable "content" {
  description = "Contents to write to the secret"
}

resource "local_file" "foo" {
  content  = var.content
  filename = var.filename
}
