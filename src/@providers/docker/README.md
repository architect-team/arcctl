# ArcCtl - Docker Provider

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
- [x] [`database`](../../%40resources/database/)
- [x] [`deployment`](../../%40resources/deployment/)
- [x] [`namespace`](../../%40resources/namespace/)
- [x] [`task`](../../%40resources/task/)
- [x] [`volume`](../../%40resources/volume/)
