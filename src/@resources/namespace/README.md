# Namespaces

Namespaces represent distinct sections for configuration or resources within other resource types.
Things like kubernetes clusters have a native notion of namespaces, but namespaces can also be things
like sub-folders on your local filesystem where files and secrets are stored. The concept of a
namespace is pretty abstract and can be used differently by different providers.

```sh
$ arcctl list namespace

$ acctl get namespace <id>

$ arcctl create namespace

$ arcctl destroy namespace
```
