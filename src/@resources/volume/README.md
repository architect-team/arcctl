# Volumes

Volumes represent external filesystems that can be mounted to cloud environments and applications.
By maintaining the filesystem separately, cloud applications can share data across replicas and
persist basic data that will survive even if the application terminates.

```sh
$ arcctl list volume

$ acctl get volume <id>

$ arcctl create volume

$ arcctl destroy volume
```
