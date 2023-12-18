FROM docker

RUN apk add --update nodejs npm curl git ca-certificates

RUN wget https://get.pulumi.com/releases/sdk/pulumi-v3.97.0-linux-x64.tar.gz && \
  mkdir -p /tmp/pulumi && \
  tar zxf pulumi-v3.97.0-linux-x64.tar.gz -C /tmp/pulumi && \
  mkdir -p /app/.pulumi/bin && \
  cp /tmp/pulumi/pulumi/* /app/.pulumi/bin/

RUN wget https://github.com/jqlang/jq/releases/download/jq-1.7.1/jq-linux-amd64 && \
  mv jq-linux-amd64 /usr/local/bin/jq && \
  chmod +x /usr/local/bin/jq

ENV PATH=$PATH:/app/.pulumi/bin/

WORKDIR /app

COPY . .

RUN npm install

ENV PULUMI_CONFIG_PASSPHRASE="passphrase"

ENTRYPOINT []
CMD ["pulumi"]