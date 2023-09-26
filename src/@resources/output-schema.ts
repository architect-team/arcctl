export default {
  "$schema": "https://json-schema.org/draft/2019-09/schema",
  "$id": "https://architect.io/.schemas/resources/inputs.json",
  "type": "object",
  "required": [
    "type"
  ],
  "definitions": {
    "OutputSchema": {
      "anyOf": [
        {
          "additionalProperties": false,
          "properties": {
            "id": {
              "type": "string"
            }
          },
          "required": [
            "id"
          ],
          "type": "object"
        },
        {
          "additionalProperties": {},
          "properties": {
            "id": {
              "type": "string"
            }
          },
          "required": [
            "id"
          ],
          "type": "object"
        },
        {
          "additionalProperties": false,
          "properties": {
            "account": {
              "description": "Account to be used by tasks that want to interact with this schema",
              "type": "string"
            },
            "certificate": {
              "description": "SSL certificate used to authenticate with the database",
              "type": "string"
            },
            "host": {
              "description": "Host address of the underlying database",
              "type": "string"
            },
            "id": {
              "type": "string"
            },
            "name": {
              "description": "Name of the new database schema",
              "type": "string"
            },
            "password": {
              "description": "Passowrd used to authenticate with the schema",
              "type": "string"
            },
            "port": {
              "description": "Port the underlying database listens on",
              "type": [
                "string",
                "number"
              ]
            },
            "protocol": {
              "description": "Protocol of the underlying database",
              "type": "string"
            },
            "url": {
              "description": "Full connection string for the database",
              "type": "string"
            },
            "username": {
              "description": "Username used to authenticate with the schema",
              "type": "string"
            }
          },
          "required": [
            "account",
            "host",
            "id",
            "name",
            "password",
            "port",
            "protocol",
            "url",
            "username"
          ],
          "type": "object"
        },
        {
          "additionalProperties": false,
          "properties": {
            "certificate": {
              "type": "string"
            },
            "host": {
              "type": "string"
            },
            "id": {
              "type": "string"
            },
            "password": {
              "type": "string"
            },
            "port": {
              "type": "number"
            },
            "protocol": {
              "type": "string"
            },
            "username": {
              "type": "string"
            }
          },
          "required": [
            "host",
            "id",
            "password",
            "port",
            "protocol",
            "username"
          ],
          "type": "object"
        },
        {
          "additionalProperties": false,
          "properties": {
            "databaseType": {
              "type": "string"
            },
            "databaseVersion": {
              "type": "string"
            },
            "id": {
              "type": "string"
            }
          },
          "required": [
            "databaseType",
            "databaseVersion",
            "id"
          ],
          "type": "object"
        },
        {
          "additionalProperties": {},
          "properties": {
            "id": {
              "type": "string"
            }
          },
          "required": [
            "id"
          ],
          "type": "object"
        },
        {
          "additionalProperties": false,
          "properties": {
            "certificate": {
              "type": "string"
            },
            "database": {
              "type": "string"
            },
            "host": {
              "type": "string"
            },
            "id": {
              "type": "string"
            },
            "password": {
              "type": "string"
            },
            "port": {
              "type": "number"
            },
            "protocol": {
              "type": "string"
            },
            "url": {
              "type": "string"
            },
            "username": {
              "type": "string"
            }
          },
          "required": [
            "database",
            "host",
            "id",
            "password",
            "port",
            "protocol",
            "url",
            "username"
          ],
          "type": "object"
        },
        {
          "additionalProperties": false,
          "properties": {
            "databaseType": {
              "type": "string"
            },
            "databaseVersion": {
              "type": "string"
            },
            "id": {
              "type": "string"
            }
          },
          "required": [
            "databaseType",
            "databaseVersion",
            "id"
          ],
          "type": "object"
        },
        {
          "additionalProperties": false,
          "properties": {
            "id": {
              "type": "string"
            },
            "labels": {
              "additionalProperties": {
                "type": "string"
              },
              "description": "A set of labels that were used to annotate the cloud resource",
              "type": "object"
            }
          },
          "required": [
            "id"
          ],
          "type": "object"
        },
        {
          "additionalProperties": false,
          "properties": {
            "data": {
              "items": {
                "type": "string"
              },
              "type": "array"
            },
            "id": {
              "type": "string"
            },
            "managedZone": {
              "type": "string"
            },
            "name": {
              "type": "string"
            },
            "recordType": {
              "type": "string"
            }
          },
          "required": [
            "data",
            "id",
            "managedZone",
            "name",
            "recordType"
          ],
          "type": "object"
        },
        {
          "additionalProperties": false,
          "properties": {
            "id": {
              "type": "string"
            },
            "name": {
              "type": "string"
            },
            "nameservers": {
              "items": {
                "type": "string"
              },
              "type": "array"
            }
          },
          "required": [
            "id",
            "name",
            "nameservers"
          ],
          "type": "object"
        },
        {
          "additionalProperties": {},
          "properties": {
            "id": {
              "type": "string"
            }
          },
          "required": [
            "id"
          ],
          "type": "object"
        },
        {
          "additionalProperties": {},
          "properties": {
            "id": {
              "type": "string"
            }
          },
          "required": [
            "id"
          ],
          "type": "object"
        },
        {
          "additionalProperties": false,
          "properties": {
            "host": {
              "type": "string"
            },
            "id": {
              "type": "string"
            },
            "loadBalancerHostname": {
              "type": "string"
            },
            "password": {
              "type": "string"
            },
            "path": {
              "type": "string"
            },
            "port": {
              "type": [
                "string",
                "number"
              ]
            },
            "url": {
              "type": "string"
            },
            "username": {
              "type": "string"
            }
          },
          "required": [
            "host",
            "id",
            "loadBalancerHostname",
            "path",
            "port",
            "url"
          ],
          "type": "object"
        },
        {
          "additionalProperties": false,
          "properties": {
            "configPath": {
              "type": "string"
            },
            "description": {
              "type": "string"
            },
            "id": {
              "type": "string"
            },
            "kubernetesVersion": {
              "type": "string"
            },
            "name": {
              "type": "string"
            },
            "vpc": {
              "type": "string"
            }
          },
          "required": [
            "configPath",
            "id",
            "kubernetesVersion",
            "name",
            "vpc"
          ],
          "type": "object"
        },
        {
          "additionalProperties": false,
          "properties": {
            "id": {
              "type": "string"
            },
            "name": {
              "type": "string"
            }
          },
          "required": [
            "id",
            "name"
          ],
          "type": "object"
        },
        {
          "additionalProperties": {},
          "properties": {
            "id": {
              "type": "string"
            }
          },
          "required": [
            "id"
          ],
          "type": "object"
        },
        {
          "additionalProperties": {},
          "properties": {
            "id": {
              "type": "string"
            }
          },
          "required": [
            "id"
          ],
          "type": "object"
        },
        {
          "additionalProperties": false,
          "properties": {
            "id": {
              "type": "string"
            },
            "region": {
              "type": "string"
            }
          },
          "required": [
            "id"
          ],
          "type": "object"
        },
        {
          "additionalProperties": false,
          "properties": {
            "id": {
              "type": "string"
            },
            "name": {
              "type": "string"
            }
          },
          "required": [
            "id",
            "name"
          ],
          "type": "object"
        },
        {
          "additionalProperties": false,
          "properties": {
            "data": {
              "type": "string"
            },
            "id": {
              "type": "string"
            }
          },
          "required": [
            "data",
            "id"
          ],
          "type": "object"
        },
        {
          "additionalProperties": false,
          "properties": {
            "account": {
              "description": "The account used to connect to this service",
              "type": "string"
            },
            "dnsZone": {
              "description": "Optional DNS zone to use for listeners",
              "type": "string"
            },
            "external_hostname": {
              "description": "External address to point to",
              "type": "string"
            },
            "host": {
              "description": "Host the service listens on",
              "type": "string"
            },
            "id": {
              "type": "string"
            },
            "labels": {
              "additionalProperties": {
                "type": "string"
              },
              "description": "Resource labels",
              "type": "object"
            },
            "name": {
              "description": "Hostname to listen on",
              "type": "string"
            },
            "namespace": {
              "description": "Resource namespace",
              "type": "string"
            },
            "password": {
              "description": "Basic auth password",
              "type": "string"
            },
            "port": {
              "description": "Port the service listens on",
              "type": "number"
            },
            "protocol": {
              "description": "Protocol the service listens on",
              "type": "string"
            },
            "target_deployment": {
              "description": "A deployment the service should point to",
              "type": "string"
            },
            "target_port": {
              "description": "Target port",
              "type": "number"
            },
            "target_protocol": {
              "default": "http",
              "description": "Protocol",
              "type": "string"
            },
            "target_servers": {
              "description": "The servers the service should load balance between",
              "items": {
                "type": "string"
              },
              "type": "array"
            },
            "url": {
              "description": "Fully resolvable URL of the service",
              "type": "string"
            },
            "username": {
              "description": "Basic auth username",
              "type": "string"
            }
          },
          "required": [
            "account",
            "host",
            "id",
            "name",
            "port",
            "protocol",
            "target_port",
            "url"
          ],
          "type": "object"
        },
        {
          "additionalProperties": false,
          "properties": {
            "id": {
              "type": "string"
            },
            "stderr": {
              "type": "string"
            },
            "stdout": {
              "type": "string"
            }
          },
          "required": [
            "id"
          ],
          "type": "object"
        },
        {
          "additionalProperties": {},
          "properties": {
            "id": {
              "type": "string"
            }
          },
          "required": [
            "id"
          ],
          "type": "object"
        },
        {
          "additionalProperties": false,
          "properties": {
            "description": {
              "type": "string"
            },
            "id": {
              "type": "string"
            },
            "name": {
              "type": "string"
            },
            "region": {
              "type": "string"
            }
          },
          "required": [
            "id",
            "name",
            "region"
          ],
          "type": "object"
        }
      ]
    }
  },
  "$ref": "#/definitions/OutputSchema"
}