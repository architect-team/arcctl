# ArcCtl - Traefik provider

Traefik is an open-source Edge Router that makes publishing your services
a fun and easy experience. It receives requests on behalf of your system
and finds out which components are responsible for handling them.

[Go to the Traefik documentation](https://doc.traefik.io/)

The Traefik provider brokers access to your Traefik service registry
so that you can create and manage Traefik services and routers.

## Authentication

Currently there is only one support method for for communicating with
Traefik. ArcCtl runs [tasks](../../%40resources/task/) that mount a
specified volume to write router and service rules using the Traefik
[file provider](https://doc.traefik.io/traefik/providers/file/). Just
provider a volume ID and an account capable of running tasks that mount
said volume and you'll be able to read and write routers and services.

## Supported resources

- [x] [`service`](../../%40resources/service/)
- [x] [`ingressRule`](../../%40resources/ingressRule/)
- [x] [`namespace`](../../%40resources/namespace/)
