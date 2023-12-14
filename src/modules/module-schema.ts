export default {
  "$ref": "#/definitions/DatacenterModuleSchema",
  "$schema": "https://json-schema.org/draft/2019-09/schema",
  "definitions": {
    "DatacenterModuleSchema": {
      "additionalProperties": false,
      "properties": {
        "apply": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "items": {
                "type": "string"
              },
              "type": "array"
            }
          ],
          "description": "The command to run to create or update the resources the module controls",
          "examples": [
            "pulumi up --stack module"
          ]
        },
        "destroy": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "items": {
                "type": "string"
              },
              "type": "array"
            }
          ],
          "description": "The command to run to destroy the module",
          "examples": [
            "pulumi destroy --stack module"
          ]
        },
        "dockerfile": {
          "default": "Dockerfile",
          "description": "Dockerfile to use to build the resource",
          "type": "string"
        },
        "export": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "items": {
                "type": "string"
              },
              "type": "array"
            }
          ],
          "description": "Command used to export the module state. The statefile address is in the environment variable, $STATE_FILE.",
          "examples": [
            "pulumi stack export --stack module --file $STATE_FILE"
          ]
        },
        "import": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "items": {
                "type": "string"
              },
              "type": "array"
            }
          ],
          "description": "Command used to import state into the module. The statefile address is in the environment variable, $STATE_FILE.",
          "examples": [
            "pulumi stack import --stack module --file $STATE_FILE"
          ]
        },
        "init": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "items": {
                "type": "string"
              },
              "type": "array"
            }
          ],
          "description": "Command that should be used to setup the module workspace",
          "examples": [
            "pulumi login --local && pulumi stack init --stack module"
          ]
        },
        "outputs": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "items": {
                "type": "string"
              },
              "type": "array"
            }
          ],
          "description": "Command to run to dump the module outputs as json. Contents should be written to $OUTPUT_FILE.",
          "examples": [
            "pulumi stack output --stack module --show-secrets --json > $OUTPUT_FILE"
          ]
        },
        "plan": {
          "anyOf": [
            {
              "type": "string"
            },
            {
              "items": {
                "type": "string"
              },
              "type": "array"
            }
          ],
          "description": "Command used to generate a preview of changes to apply",
          "examples": [
            "pulumi preview --stack module"
          ]
        },
        "version": {
          "const": "v1",
          "type": "string"
        }
      },
      "required": [
        "apply",
        "destroy",
        "outputs",
        "version"
      ],
      "type": "object"
    }
  },
  "$id": "https://architect.io/.schemas/module.json"
}