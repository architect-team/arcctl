# Database versions

Sometimes arcctl resources include resource types that aren't designed to be "created",
and the database version resource is one of them. This resource type exists to allow users
to more easily see a list of supported "version" values (based on the provided [databaseType](../databaseType/))
that they can use when creating database instances. You'll see a list of available options
whenever you create a new [database](../database/).

```sh
$ arcctl list databaseVersion

$ acctl get databaseVersion <id>
```
