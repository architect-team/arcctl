# Integration tests

## Test configuration file

In order to run the integration tests, you need a test configuration file. The test configuration file is a JSON file that's a list of providers and their credentials. Each providers' credentials should be specified in a provider-specific way. An example of a test configuration file is below. Note that the credentials specified are different for each provider. One or more providers may be specified.

```json
[
  {
    "provider": "digitalocean",
    "credentials": {
      "token": "<digitalocean-api-token>"
    }
  },
  {
    "provider": "aws",
    "credentials": {
      "accessKeyId": "<aws-access-key>",
      "secretAccessKey": "<aws-secret-access-key>"
    }
  }
]
```

### Viewing the applied terraform

The terraform files that were used for the test will be removed automatically. If you'd prefer to keep them around, include the key/value `keep_test_folders: true` in an array object of the test configuration file.

### Running specific tests

In order to run only specific tests, include the key/value pair `"name_regex": "<regex>"` in an array object of the test configuration file.

## Running the tests

Run the tests with the command below. Note that since these tests create and delete real resources, they can take a while and should not be interrupted.

```sh
npm run test:service <test-config-file>.json
```
