FROM pulumi/pulumi-nodejs

COPY . .

# Install the aws cli
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" \
    && apt-get install zip -y \
    && unzip -u awscliv2.zip \
    && ./aws/install \
    && aws --version

# Install eksctl to install IAM policy and service account
RUN curl -sLO "https://github.com/eksctl-io/eksctl/releases/latest/download/eksctl_Linux_amd64.tar.gz" \
    && tar -xzf eksctl_Linux_amd64.tar.gz -C /tmp && rm eksctl_Linux_amd64.tar.gz \
    && mv /tmp/eksctl /usr/bin \
    && eksctl version

RUN npm install