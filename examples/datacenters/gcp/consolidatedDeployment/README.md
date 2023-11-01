# configuration

```sh
pulumi config set gcp:project permanent-environment-testing --stack dev
pulumi config set gcp:credentials /home/ryan/Downloads/permanent-environment-testing-6f237ea8779d.json --stack dev
pulumi config set gcp:region us-central1 --stack dev
pulumi config set name test-deployment --stack dev
pulumi config set image ryancahill444/hello-world --stack dev
pulumi config set services '[{"port":3000,"protocol":"http","id":"test-id"}]' --stack dev
pulumi config set labels '{"vpc":"ryan","zone":"us-central1-a"}' --stack dev
```
