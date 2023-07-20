# ArcCtl - Postgres provider

PostgreSQL is a powerful, open source object-relational database system with over 35
years of active development that has earned it a strong reputation for reliability,
feature robustness, and performance.

[View the postgres documentation](https://www.postgresql.org/)

The postgres provider brokers access to a postgres instance or cluster. You can register
an account pointed to any postgres database that your current machine can resolve.

## Authentication

In order to register a postgres account, you'll need the the host, port, username, password, and
default database. You'll be prompted for all the fields when you run the `arcctl add account` command

```sh
$ arcctl add account <account-name> --provider postgres
```

## Supported resources

- [x] [`database`](../../%40resources/database/)
- [x] [`databaseUser`](../../%40resources/databaseUser/)
