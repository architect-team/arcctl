FROM docker

RUN apk add --update nodejs npm curl git ca-certificates

RUN wget https://get.pulumi.com/releases/sdk/pulumi-v3.78.1-linux-x64.tar.gz && \
  mkdir -p /tmp/pulumi && \
  tar zxf pulumi-v3.78.1-linux-x64.tar.gz -C /tmp/pulumi && \
  mkdir -p /app/.pulumi/bin && \
  cp /tmp/pulumi/pulumi/* /app/.pulumi/bin/
ENV PATH=$PATH:/app/.pulumi/bin/

COPY . .

RUN npm install

CMD ["pulumi"]