# Database sizes

Sometimes arcctl resources include resource types that aren't designed to be "created",
and the database size resource is one of them. This resource type exists to allow users
to more easily see a list of supported "size" values that they can use when creating
database instances. You'll see a list of available options whenever you create a
new [database](../database/).

```sh
$ arcctl list databaseSize

$ acctl get databaseSize <id>
```
