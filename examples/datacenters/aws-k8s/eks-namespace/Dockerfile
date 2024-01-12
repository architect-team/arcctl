FROM pulumi/pulumi-nodejs

COPY . .

# Install the aws cli
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" \
    && apt-get install unzip -y \
    && unzip -u awscliv2.zip \
    && ./aws/install

RUN npm install