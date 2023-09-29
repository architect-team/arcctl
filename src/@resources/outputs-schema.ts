export default {
  "arcctlAccount": {
    "$ref": "#/definitions/ArcctlAccountOutputs",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
      "ArcctlAccountOutputs": {
        "additionalProperties": false,
        "type": "object"
      }
    }
  },
  "cronjob": {
    "$ref": "#/definitions/CronjobOutputs",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
      "CronjobOutputs": {
        "additionalProperties": {},
        "type": "object"
      }
    }
  },
  "database": {
    "$ref": "#/definitions/DatabaseApplyOutputs",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
      "DatabaseApplyOutputs": {
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
          "protocol",
          "host",
          "port",
          "name",
          "url",
          "account",
          "username",
          "password"
        ],
        "type": "object"
      }
    }
  },
  "databaseCluster": {
    "$ref": "#/definitions/DatabaseClusterApplyOutputs",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
      "DatabaseClusterApplyOutputs": {
        "additionalProperties": false,
        "properties": {
          "certificate": {
            "type": "string"
          },
          "host": {
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
          "protocol",
          "host",
          "port",
          "username",
          "password"
        ],
        "type": "object"
      }
    }
  },
  "databaseSize": {
    "$ref": "#/definitions/DatabaseSizeApplyOutputs",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
      "DatabaseSizeApplyOutputs": {
        "additionalProperties": false,
        "properties": {
          "databaseType": {
            "type": "string"
          },
          "databaseVersion": {
            "type": "string"
          }
        },
        "required": [
          "databaseType",
          "databaseVersion"
        ],
        "type": "object"
      }
    }
  },
  "databaseType": {
    "$ref": "#/definitions/DatabaseTypeOutputs",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
      "DatabaseTypeOutputs": {
        "additionalProperties": {},
        "type": "object"
      }
    }
  },
  "databaseUser": {
    "$ref": "#/definitions/DatabaseUserApplyOutputs",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
      "DatabaseUserApplyOutputs": {
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
          "protocol",
          "host",
          "port",
          "database",
          "username",
          "password",
          "url"
        ],
        "type": "object"
      }
    }
  },
  "databaseVersion": {
    "$ref": "#/definitions/DatabaseVersionOutputs",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
      "DatabaseVersionOutputs": {
        "additionalProperties": false,
        "properties": {
          "databaseType": {
            "type": "string"
          },
          "databaseVersion": {
            "type": "string"
          }
        },
        "required": [
          "databaseType",
          "databaseVersion"
        ],
        "type": "object"
      }
    }
  },
  "deployment": {
    "$ref": "#/definitions/DeploymentOutputs",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
      "DeploymentOutputs": {
        "additionalProperties": false,
        "properties": {
          "labels": {
            "additionalProperties": {
              "type": "string"
            },
            "description": "A set of labels that were used to annotate the cloud resource",
            "type": "object"
          }
        },
        "type": "object"
      }
    }
  },
  "dnsRecord": {
    "$ref": "#/definitions/DnsRecordApplyOutputs",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
      "DnsRecordApplyOutputs": {
        "additionalProperties": false,
        "properties": {
          "data": {
            "items": {
              "type": "string"
            },
            "type": "array"
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
          "name",
          "data",
          "recordType",
          "managedZone"
        ],
        "type": "object"
      }
    }
  },
  "dnsZone": {
    "$ref": "#/definitions/DnsZoneOutputs",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
      "DnsZoneOutputs": {
        "additionalProperties": false,
        "properties": {
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
          "name",
          "nameservers"
        ],
        "type": "object"
      }
    }
  },
  "dockerBuild": {
    "$ref": "#/definitions/DockerBuildOutputs",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
      "DockerBuildOutputs": {
        "additionalProperties": {},
        "type": "object"
      }
    }
  },
  "helmChart": {
    "$ref": "#/definitions/HelmChartOutputs",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
      "HelmChartOutputs": {
        "additionalProperties": {},
        "type": "object"
      }
    }
  },
  "ingressRule": {
    "$ref": "#/definitions/IngressRuleOutputs",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
      "IngressRuleOutputs": {
        "additionalProperties": false,
        "properties": {
          "host": {
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
          "port",
          "url",
          "path",
          "loadBalancerHostname"
        ],
        "type": "object"
      }
    }
  },
  "kubernetesCluster": {
    "$ref": "#/definitions/ClusterApplyOutputs",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
      "ClusterApplyOutputs": {
        "additionalProperties": false,
        "properties": {
          "configPath": {
            "type": "string"
          },
          "description": {
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
          "name",
          "vpc",
          "kubernetesVersion",
          "configPath"
        ],
        "type": "object"
      }
    }
  },
  "kubernetesVersion": {
    "$ref": "#/definitions/KubernetesVersionOutputs",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
      "KubernetesVersionOutputs": {
        "additionalProperties": false,
        "properties": {
          "name": {
            "type": "string"
          }
        },
        "required": [
          "name"
        ],
        "type": "object"
      }
    }
  },
  "module": {
    "$ref": "#/definitions/ModuleOutputs",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
      "ModuleOutputs": {
        "additionalProperties": false,
        "properties": {
          "name": {
            "type": "string"
          }
        },
        "required": [
          "name"
        ],
        "type": "object"
      }
    }
  },
  "namespace": {
    "$ref": "#/definitions/NamespaceOutputs",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
      "NamespaceOutputs": {
        "additionalProperties": {},
        "type": "object"
      }
    }
  },
  "node": {
    "$ref": "#/definitions/NodeOutputs",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
      "NodeOutputs": {
        "additionalProperties": {},
        "type": "object"
      }
    }
  },
  "nodeSize": {
    "$ref": "#/definitions/NodeSizeOutputs",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
      "NodeSizeOutputs": {
        "additionalProperties": false,
        "properties": {
          "region": {
            "type": "string"
          }
        },
        "type": "object"
      }
    }
  },
  "region": {
    "$ref": "#/definitions/RegionOutputs",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
      "RegionOutputs": {
        "additionalProperties": false,
        "properties": {
          "name": {
            "type": "string"
          }
        },
        "required": [
          "name"
        ],
        "type": "object"
      }
    }
  },
  "secret": {
    "$ref": "#/definitions/SecretOutputs",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
      "SecretOutputs": {
        "additionalProperties": false,
        "properties": {
          "data": {
            "type": "string"
          }
        },
        "required": [
          "data"
        ],
        "type": "object"
      }
    }
  },
  "service": {
    "$ref": "#/definitions/ServiceOutputs",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
      "ServiceOutputs": {
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
          "name",
          "port",
          "protocol",
          "target_port",
          "url"
        ],
        "type": "object"
      }
    }
  },
  "task": {
    "$ref": "#/definitions/CronjobApplyOutputs",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
      "CronjobApplyOutputs": {
        "additionalProperties": false,
        "properties": {
          "stderr": {
            "type": "string"
          },
          "stdout": {
            "type": "string"
          }
        },
        "type": "object"
      }
    }
  },
  "volume": {
    "$ref": "#/definitions/VolumeApplyOutputs",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
      "VolumeApplyOutputs": {
        "additionalProperties": {},
        "type": "object"
      }
    }
  },
  "vpc": {
    "$ref": "#/definitions/VpcApplyOutputs",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
      "VpcApplyOutputs": {
        "additionalProperties": false,
        "properties": {
          "description": {
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
          "name",
          "region"
        ],
        "type": "object"
      }
    }
  }
}