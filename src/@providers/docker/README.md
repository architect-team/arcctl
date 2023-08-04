# ArcCtl - Docker Provider

Docker is an open platform for developing, shipping, and running applications. Docker enables you to separate your applications from your infrastructure so you can deliver software quickly. With Docker, you can manage your infrastructure in the same ways you manage your applications. By taking advantage of Docker’s methodologies for shipping, testing, and deploying code quickly, you can significantly reduce the delay between writing code and running it in production.

[View Docker documentation](https://docs.docker.com/)

The Docker provider brokers interaction with the Docker API/Daemon to create and manage
the lifecycle of container-based applications. This provider is perfect for powering
[datacenters](../../datacenters/) targeting local development environments and rapid
developer feedback.

## Authentication

To connect to your local docker environment, just run `arcctl add account --provider docker`
and provide empty values for all the inputs. If you want to connect to a remote docker
host, you'll have to provide the address and in some cases the SSL certificate details.

## Supported resources

- [x] [`dockerBuild`](../../%40resources/dockerBuild/)
- [x] [`deployment`](../../%40resources/deployment/)
- [x] [`namespace`](../../%40resources/namespace/)
- [x] [`task`](../../%40resources/task/)
- [x] [`volume`](../../%40resources/volume/)
