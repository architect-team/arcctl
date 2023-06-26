# ArcCtl - Local Provider

The local provider brokers access to your current host machine's file system.
It is primarily used to store "secrets" in non-production-grade environments.

## Authentication

The only field required for the local provider is the path to a directory that
will act as the secret store for the account. This is where all files the account
creates and manages will reside.

## Supported resources

- [x] [`secret`](../../%40resources/secret/)
- [x] [`namespace`](../../%40resources/namespace/)
