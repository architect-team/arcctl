FROM docker

RUN apk add --no-cache git jq curl

WORKDIR /usr/local/bin

ENV TERRAFORM_VERSION 1.7.0-beta2

RUN curl https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_amd64.zip -o terraform_${TERRAFORM_VERSION}_linux_amd64.zip && \
  unzip terraform_${TERRAFORM_VERSION}_linux_amd64.zip && \
  rm terraform_${TERRAFORM_VERSION}_linux_amd64.zip

RUN terraform init

WORKDIR /app

COPY . .

ENTRYPOINT []