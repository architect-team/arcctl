FROM pulumi/pulumi-nodejs

# allow service account and related resources to be deleted without needing a valid kubeconfig
ENV PULUMI_K8S_DELETE_UNREACHABLE=true

COPY . .
RUN npm ci
