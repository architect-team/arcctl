# Database types

Sometimes arcctl resources include resource types that aren't designed to be "created",
and the database type resource is one of them. This resource type exists to allow users
to more easily see a list of supported "type" values that they can use when creating
database instances. You'll see a list of available options whenever you create a
new [database](../database/).

```sh
$ arcctl list databaseType

$ acctl get databaseType <id>
```
