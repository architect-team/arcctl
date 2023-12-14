# This dockerfile is used to build OpenTofu modules - the module files are copied in and terraform is installed
# so that the plugin can use terraform commands to plan/apply the module.
FROM alpine:3

# Needed for terraform modules that include a remote source
RUN apk add --no-cache git

RUN wget https://github.com/opentofu/opentofu/releases/download/v1.6.0-beta3/tofu_1.6.0-beta3_amd64.apk
RUN apk add --allow-untrusted tofu_1.6.0-beta3_amd64.apk

RUN wget https://github.com/jqlang/jq/releases/download/jq-1.7.1/jq-linux-amd64 && \
  mv jq-linux-amd64 /usr/local/bin/jq && \
  chmod +x /usr/local/bin/jq

WORKDIR /app

COPY . .

ENTRYPOINT []