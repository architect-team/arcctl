# Tasks

Tasks represent one-time jobs that are to be run within a cloud environment. The usage of tasks can
range from running seed or migration scripts to generating reports and more. Tasks are run via containers
so as to more easily run alongside application code and within private networks.

```sh
$ arcctl list task

$ acctl get task <id>

$ arcctl create task

$ arcctl destroy task
```
