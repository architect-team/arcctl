FROM pulumi/pulumi-nodejs

COPY . .

RUN npm install

ENV PULUMI_CONFIG_PASSPHRASE="passphrase"
ENV PULUMI_K8S_DELETE_UNREACHABLE="true"