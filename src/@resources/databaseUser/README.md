# Database user

Database users represent individual sets of credentials that can be used to access a [database](../database/)
on a specified [schema](../databaseSchema/). Note that credentials are considered sensitive and are unlikely
to be returned in "list" commands, so be sure to copy them down when you first create the user.

```sh
$ arcctl list databaseUser

$ acctl get databaseUser <id>

$ arcctl create databaseUser

$ arcctl destroy databaseUser
```
