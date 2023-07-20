# Databases

Databases are effectively namespaces within a database cluster. Each database has its own set of
tables so as to remain isolated from other database namespaces despite residing on the same instance or cluster.
This helps operators consolidate the effort needed to manage database instances without causing developers creating tables to collide with one another.

```sh
$ arcctl list database

$ acctl get database <id>

$ arcctl create database

$ arcctl destroy database
```
