export default {
  "arcctlAccount": {
    "$ref": "#/definitions/ArcctlAccountInputs",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
      "ArcctlAccountInputs": {
        "additionalProperties": false,
        "properties": {
          "credentials": {
            "description": "Credentials used to access the cloud provider",
            "type": "object"
          },
          "name": {
            "description": "Name of the new account",
            "type": "string"
          },
          "provider": {
            "description": "Cloud provider the account connects to",
            "type": "string"
          }
        },
        "required": [
          "name",
          "provider",
          "credentials"
        ],
        "type": "object"
      }
    }
  },
  "cronjob": {
    "$ref": "#/definitions/CronjobInputs",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
      "CronjobInputs": {
        "additionalProperties": false,
        "properties": {
          "command": {
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
            ]
          },
          "cpu": {
            "type": "number"
          },
          "entrypoint": {
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
            ]
          },
          "environment": {
            "additionalProperties": {
              "type": "string"
            },
            "type": "object"
          },
          "image": {
            "type": "string"
          },
          "labels": {
            "additionalProperties": {
              "type": "string"
            },
            "type": "object"
          },
          "memory": {
            "type": "string"
          },
          "namespace": {
            "type": "string"
          },
          "platform": {
            "type": "string"
          },
          "schedule": {
            "type": "string"
          },
          "sidecars": {
            "items": {
              "additionalProperties": false,
              "properties": {
                "command": {
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
                  ]
                },
                "cpu": {
                  "type": "number"
                },
                "entrypoint": {
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
                  ]
                },
                "environment": {
                  "additionalProperties": {
                    "type": "string"
                  },
                  "type": "object"
                },
                "image": {
                  "type": "string"
                },
                "memory": {
                  "type": "string"
                },
                "platform": {
                  "type": "string"
                },
                "volume_mounts": {
                  "items": {
                    "additionalProperties": false,
                    "properties": {
                      "mount_path": {
                        "type": "string"
                      },
                      "readonly": {
                        "type": "boolean"
                      },
                      "volume": {
                        "type": "string"
                      }
                    },
                    "required": [
                      "volume",
                      "mount_path"
                    ],
                    "type": "object"
                  },
                  "type": "array"
                }
              },
              "required": [
                "image"
              ],
              "type": "object"
            },
            "type": "array"
          },
          "volume_mounts": {
            "items": {
              "additionalProperties": false,
              "properties": {
                "mount_path": {
                  "type": "string"
                },
                "readonly": {
                  "type": "boolean"
                },
                "volume": {
                  "type": "string"
                }
              },
              "required": [
                "volume",
                "mount_path"
              ],
              "type": "object"
            },
            "type": "array"
          }
        },
        "required": [
          "image",
          "schedule"
        ],
        "type": "object"
      }
    }
  },
  "database": {
    "$ref": "#/definitions/DatabaseApplyInputs",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
      "DatabaseApplyInputs": {
        "additionalProperties": false,
        "properties": {
          "databaseCluster": {
            "description": "Unique ID of the database cluster backing this schema",
            "type": "string"
          },
          "databaseType": {
            "description": "Type of database required by the schema",
            "type": "string"
          },
          "databaseVersion": {
            "description": "Version of the database type the schema creation process expects",
            "type": "string"
          },
          "name": {
            "description": "Name to give to the new schema",
            "type": "string"
          }
        },
        "required": [
          "name",
          "databaseCluster",
          "databaseType",
          "databaseVersion"
        ],
        "type": "object"
      }
    }
  },
  "databaseCluster": {
    "$ref": "#/definitions/DatabaseClusterApplyInputs",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
      "DatabaseClusterApplyInputs": {
        "additionalProperties": false,
        "properties": {
          "databaseSize": {
            "description": "Size of the database instance to create",
            "type": "string"
          },
          "databaseType": {
            "description": "The type of database engine to use",
            "type": "string"
          },
          "databaseVersion": {
            "description": "Refers to the unique ID of a `databaseVersion` response",
            "type": "string"
          },
          "description": {
            "description": "Human-readable description of the database",
            "type": "string"
          },
          "name": {
            "description": "Unique name for the database",
            "type": "string"
          },
          "region": {
            "description": "Unique ID of the region to run the database in",
            "type": "string"
          },
          "vpc": {
            "description": "Unique ID of the VPC to run the database in",
            "type": "string"
          }
        },
        "required": [
          "name",
          "databaseSize",
          "databaseType",
          "databaseVersion",
          "vpc",
          "region"
        ],
        "type": "object"
      }
    }
  },
  "databaseSize": {
    "$ref": "#/definitions/DatabaseSizeInputs",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
      "DatabaseSizeInputs": {
        "additionalProperties": {},
        "type": "object"
      }
    }
  },
  "databaseType": {
    "$ref": "#/definitions/DatabaseTypeInputs",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
      "DatabaseTypeInputs": {
        "additionalProperties": {},
        "type": "object"
      }
    }
  },
  "databaseUser": {
    "$ref": "#/definitions/DatabaseUserApplyInputs",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
      "DatabaseUserApplyInputs": {
        "additionalProperties": false,
        "properties": {
          "database": {
            "description": "The database the user should have access to",
            "type": "string"
          },
          "username": {
            "description": "Username of the user to create",
            "type": "string"
          }
        },
        "required": [
          "username",
          "database"
        ],
        "type": "object"
      }
    }
  },
  "databaseVersion": {
    "$ref": "#/definitions/DatabaseVersionInputs",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
      "DatabaseVersionInputs": {
        "additionalProperties": false,
        "properties": {
          "databaseType": {
            "type": "string"
          }
        },
        "required": [
          "databaseType"
        ],
        "type": "object"
      }
    }
  },
  "deployment": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
      "DeploymentInputs": {
        "additionalProperties": false,
        "properties": {
          "autoscaling": {
            "additionalProperties": false,
            "description": "Autoscaling rules for the deployment",
            "properties": {
              "max_replicas": {
                "description": "Maximum number of replicas of the deployment to run",
                "type": "number"
              },
              "min_replicas": {
                "description": "Minimum number of replicas of the deployment to run",
                "minimum": 0,
                "type": "number"
              }
            },
            "required": [
              "min_replicas",
              "max_replicas"
            ],
            "type": "object"
          },
          "command": {
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
            "description": "Command to execute in the container"
          },
          "cpu": {
            "description": "Number of CPUs to allocate to the container",
            "minimum": 0.1,
            "type": "number"
          },
          "entrypoint": {
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
            "description": "Entrypoint of the container"
          },
          "environment": {
            "additionalProperties": {
              "anyOf": [
                {
                  "type": "string"
                },
                {
                  "type": "number"
                },
                {
                  "type": "boolean"
                },
                {
                  "type": "null"
                },
                {
                  "not": {}
                }
              ]
            },
            "description": "Environment variables to pass to the container",
            "type": "object"
          },
          "exposed_ports": {
            "description": "Port that the deployment should expose on all nodes",
            "items": {
              "additionalProperties": false,
              "properties": {
                "port": {
                  "type": "number"
                },
                "target_port": {
                  "type": "number"
                }
              },
              "required": [
                "target_port"
              ],
              "type": "object"
            },
            "type": "array"
          },
          "image": {
            "description": "Image the container runs from",
            "type": "string"
          },
          "labels": {
            "additionalProperties": {
              "type": "string"
            },
            "description": "Labels for the deployment",
            "type": "object"
          },
          "memory": {
            "description": "Amount of memory to allocate to the container",
            "type": "string"
          },
          "name": {
            "description": "Deployment name",
            "type": "string"
          },
          "namespace": {
            "description": "Namespace the deployment should be in",
            "type": "string"
          },
          "platform": {
            "description": "Target platform the deployment will run on",
            "type": "string"
          },
          "probes": {
            "additionalProperties": false,
            "properties": {
              "liveness": {
                "$ref": "#/definitions/ProbeSchema"
              }
            },
            "type": "object"
          },
          "replicas": {
            "default": 1,
            "description": "Number of replicas of the deployment to run",
            "type": "number"
          },
          "services": {
            "description": "Services this deployment should register itself with",
            "items": {
              "additionalProperties": false,
              "properties": {
                "account": {
                  "description": "The account the deployment can use to register itself with the service.",
                  "type": "string"
                },
                "id": {
                  "description": "Unique ID of the service the deployment should attach itself to",
                  "type": "string"
                },
                "port": {
                  "description": "The port the service deployment is listening on",
                  "type": "string"
                }
              },
              "required": [
                "id",
                "account",
                "port"
              ],
              "type": "object"
            },
            "type": "array"
          },
          "sidecars": {
            "description": "A set of additional containers to run as part of each replica",
            "items": {
              "additionalProperties": false,
              "properties": {
                "command": {
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
                  "description": "Command to execute in the container"
                },
                "cpu": {
                  "description": "Number of CPUs to allocate to the container",
                  "minimum": 0.1,
                  "type": "number"
                },
                "entrypoint": {
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
                  "description": "Entrypoint of the container"
                },
                "environment": {
                  "additionalProperties": {
                    "anyOf": [
                      {
                        "type": "string"
                      },
                      {
                        "type": "number"
                      },
                      {
                        "type": "boolean"
                      },
                      {
                        "type": "null"
                      },
                      {
                        "not": {}
                      }
                    ]
                  },
                  "description": "Environment variables to pass to the container",
                  "type": "object"
                },
                "image": {
                  "description": "Image the container runs from",
                  "type": "string"
                },
                "memory": {
                  "description": "Amount of memory to allocate to the container",
                  "type": "string"
                },
                "probes": {
                  "additionalProperties": false,
                  "properties": {
                    "liveness": {
                      "$ref": "#/definitions/ProbeSchema"
                    }
                  },
                  "type": "object"
                },
                "volume_mounts": {
                  "description": "A set of volumes to mount to the container",
                  "items": {
                    "additionalProperties": false,
                    "properties": {
                      "image": {
                        "type": "string"
                      },
                      "mount_path": {
                        "type": "string"
                      },
                      "readonly": {
                        "type": "boolean"
                      },
                      "volume": {
                        "type": "string"
                      }
                    },
                    "required": [
                      "volume",
                      "mount_path",
                      "readonly"
                    ],
                    "type": "object"
                  },
                  "type": "array"
                }
              },
              "required": [
                "image",
                "volume_mounts"
              ],
              "type": "object"
            },
            "type": "array"
          },
          "volume_mounts": {
            "description": "A set of volumes to mount to the container",
            "items": {
              "additionalProperties": false,
              "properties": {
                "image": {
                  "type": "string"
                },
                "mount_path": {
                  "type": "string"
                },
                "readonly": {
                  "type": "boolean"
                },
                "volume": {
                  "type": "string"
                }
              },
              "required": [
                "volume",
                "mount_path",
                "readonly"
              ],
              "type": "object"
            },
            "type": "array"
          }
        },
        "required": [
          "image",
          "name",
          "volume_mounts"
        ],
        "type": "object"
      },
      "ProbeSchema": {
        "anyOf": [
          {
            "additionalProperties": false,
            "properties": {
              "command": {
                "description": "Command to run inside the container to determine if its healthy",
                "items": {
                  "type": "string"
                },
                "type": "array"
              },
              "failure_threshold": {
                "default": 3,
                "description": "Number of times the probe will tolerate failure before giving up. Giving up in the case of liveness probe means restarting the container.",
                "minimum": 1,
                "type": "number"
              },
              "initial_delay": {
                "default": 0,
                "description": "Number of seconds after the container starts before the probe is initiated.",
                "minimum": 0,
                "type": "number"
              },
              "interval": {
                "default": 10,
                "description": "How often (in seconds) to perform the probe.",
                "minimum": 1,
                "type": "number"
              },
              "success_threshold": {
                "default": 1,
                "description": "Minimum consecutive successes for the probe to be considered successful after having failed.",
                "minimum": 1,
                "type": "number"
              },
              "timeout": {
                "default": 1,
                "description": "Number of seconds after which the probe times out",
                "minimum": 1,
                "type": "number"
              },
              "type": {
                "const": "exec",
                "type": "string"
              }
            },
            "required": [
              "command",
              "type"
            ],
            "type": "object"
          },
          {
            "additionalProperties": false,
            "properties": {
              "failure_threshold": {
                "default": 3,
                "description": "Number of times the probe will tolerate failure before giving up. Giving up in the case of liveness probe means restarting the container.",
                "minimum": 1,
                "type": "number"
              },
              "headers": {
                "description": "Custom headers to set in the request.",
                "items": {
                  "additionalProperties": false,
                  "properties": {
                    "name": {
                      "type": "string"
                    },
                    "value": {
                      "type": "string"
                    }
                  },
                  "required": [
                    "name",
                    "value"
                  ],
                  "type": "object"
                },
                "type": "array"
              },
              "initial_delay": {
                "default": 0,
                "description": "Number of seconds after the container starts before the probe is initiated.",
                "minimum": 0,
                "type": "number"
              },
              "interval": {
                "default": 10,
                "description": "How often (in seconds) to perform the probe.",
                "minimum": 1,
                "type": "number"
              },
              "path": {
                "default": "/",
                "description": "Path to access on the http server",
                "type": "string"
              },
              "port": {
                "description": "Port to access on the container",
                "type": "number"
              },
              "scheme": {
                "default": "http",
                "description": "Scheme to use for connecting to the host (http or https).",
                "type": "string"
              },
              "success_threshold": {
                "default": 1,
                "description": "Minimum consecutive successes for the probe to be considered successful after having failed.",
                "minimum": 1,
                "type": "number"
              },
              "timeout": {
                "default": 1,
                "description": "Number of seconds after which the probe times out",
                "minimum": 1,
                "type": "number"
              },
              "type": {
                "const": "http",
                "type": "string"
              }
            },
            "required": [
              "type"
            ],
            "type": "object"
          }
        ]
      }
    }
  },
  "dnsRecord": {
    "$ref": "#/definitions/DnsRecordInputs",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
      "DnsRecordInputs": {
        "additionalProperties": false,
        "properties": {
          "content": {
            "type": "string"
          },
          "dnsZone": {
            "type": "string"
          },
          "recordType": {
            "type": "string"
          },
          "subdomain": {
            "type": "string"
          },
          "ttl": {
            "type": "number"
          }
        },
        "required": [
          "dnsZone",
          "subdomain",
          "recordType",
          "content"
        ],
        "type": "object"
      }
    }
  },
  "dnsZone": {
    "$ref": "#/definitions/DnsZoneInputs",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
      "DnsZoneInputs": {
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
  "dockerBuild": {
    "$ref": "#/definitions/DockerBuildInputs",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
      "DockerBuildInputs": {
        "additionalProperties": false,
        "properties": {
          "args": {
            "additionalProperties": {
              "type": "string"
            },
            "default": {},
            "description": "Arguments to pass to the build command",
            "type": "object"
          },
          "component_source": {
            "description": "Source of the component that contains the build context",
            "type": "string"
          },
          "context": {
            "description": "Docker build context relative to the component root",
            "type": "string"
          },
          "dockerfile": {
            "default": "Dockerfile",
            "description": "Path to the dockerfile relative to the context",
            "type": "string"
          },
          "registry": {
            "default": "registry.architect.io",
            "description": "Registry the artifact will be pushed to",
            "type": "string"
          },
          "repository": {
            "description": "The repository to push the artifact to",
            "type": "string"
          },
          "tag": {
            "default": "latest",
            "description": "Tag to assign to the image",
            "type": "string"
          },
          "target": {
            "description": "Name of a intermediate build stage to target",
            "type": "string"
          }
        },
        "required": [
          "component_source",
          "context",
          "repository"
        ],
        "type": "object"
      }
    }
  },
  "helmChart": {
    "$ref": "#/definitions/HelmChartInputs",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
      "HelmChartInputs": {
        "additionalProperties": false,
        "properties": {
          "chart": {
            "description": "Chart to be installed",
            "type": "string"
          },
          "name": {
            "description": "Name of the helm release",
            "type": "string"
          },
          "namespace": {
            "default": "default",
            "description": "The namespace to install the release in",
            "type": "string"
          },
          "repository": {
            "description": "The URL of the repository where the chart lives",
            "type": "string"
          },
          "values": {
            "description": "Values to pass to the helm chart release",
            "type": "object"
          },
          "version": {
            "description": "The exact chart version to install. Otherwise will use the latest.",
            "type": "string"
          }
        },
        "required": [
          "name",
          "repository",
          "chart"
        ],
        "type": "object"
      }
    }
  },
  "ingressRule": {
    "$ref": "#/definitions/IngressRuleInputs",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
      "IngressRuleInputs": {
        "additionalProperties": false,
        "properties": {
          "dnsZone": {
            "description": "The DNS zone (aka base URL) that the ingress rule listens on",
            "type": "string"
          },
          "headers": {
            "additionalProperties": {
              "type": "string"
            },
            "description": "Headers to include in responses",
            "type": "object"
          },
          "internal": {
            "default": false,
            "description": "Whether or not this should be fulfilled by an internal load balancer (e.g. no public IP)",
            "type": "boolean"
          },
          "name": {
            "description": "Name to give to the ingress rule resource",
            "type": "string"
          },
          "namespace": {
            "description": "Namespace to put the ingress rule in",
            "type": "string"
          },
          "password": {
            "description": "Basic auth password",
            "type": "string"
          },
          "path": {
            "default": "/",
            "description": "The path the ingress rule listens on",
            "type": "string"
          },
          "port": {
            "description": "Port that the ingress rule listens for traffic on",
            "type": [
              "string",
              "number"
            ]
          },
          "protocol": {
            "default": "http",
            "description": "The protocol the ingress rule listens for traffic on",
            "type": "string"
          },
          "registry": {
            "description": "Unique ID of the service registry this rule will be stored in",
            "type": "string"
          },
          "service": {
            "description": "Service the ingress forwards traffic to",
            "type": "string"
          },
          "subdomain": {
            "description": "The subdomain the ingress rule listens on",
            "type": "string"
          },
          "username": {
            "description": "Basic auth username",
            "type": "string"
          }
        },
        "required": [
          "name",
          "registry",
          "port",
          "service"
        ],
        "type": "object"
      }
    }
  },
  "kubernetesCluster": {
    "$ref": "#/definitions/ClusterInputs",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
      "ClusterInputs": {
        "additionalProperties": false,
        "properties": {
          "description": {
            "description": "Description of the cluster",
            "type": "string"
          },
          "kubernetesVersion": {
            "description": "Version of the kubernetes control plane to use",
            "type": "string"
          },
          "name": {
            "description": "Name of the cluster",
            "type": "string"
          },
          "nodePools": {
            "description": "Node pools",
            "items": {
              "additionalProperties": false,
              "properties": {
                "count": {
                  "description": "Number of nodes the pool should have",
                  "minimum": 1,
                  "type": "number"
                },
                "name": {
                  "description": "Name of the node pool",
                  "type": "string"
                },
                "nodeSize": {
                  "description": "Size of each node in the pool",
                  "type": "string"
                }
              },
              "required": [
                "name",
                "count",
                "nodeSize"
              ],
              "type": "object"
            },
            "minimum": 1,
            "type": "array"
          },
          "region": {
            "description": "Region the cluster should live in",
            "type": "string"
          },
          "vpc": {
            "description": "VPC the cluster should live in",
            "type": "string"
          }
        },
        "required": [
          "name",
          "region",
          "vpc",
          "kubernetesVersion",
          "nodePools"
        ],
        "type": "object"
      }
    }
  },
  "kubernetesVersion": {
    "$ref": "#/definitions/KubernetesVersionInputs",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
      "KubernetesVersionInputs": {
        "additionalProperties": {},
        "type": "object"
      }
    }
  },
  "module": {
    "$ref": "#/definitions/ModuleInputs",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
      "ModuleInputs": {
        "additionalProperties": {},
        "type": "object"
      }
    }
  },
  "namespace": {
    "$ref": "#/definitions/NamespaceInputs",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
      "NamespaceInputs": {
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
  "node": {
    "$ref": "#/definitions/NodeInputs",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
      "NodeInputs": {
        "additionalProperties": {},
        "type": "object"
      }
    }
  },
  "nodeSize": {
    "$ref": "#/definitions/NodeSizeInputs",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
      "NodeSizeInputs": {
        "additionalProperties": {},
        "type": "object"
      }
    }
  },
  "region": {
    "$ref": "#/definitions/RegionInputs",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
      "RegionInputs": {
        "additionalProperties": {},
        "type": "object"
      }
    }
  },
  "secret": {
    "$ref": "#/definitions/SecretInputs",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
      "SecretInputs": {
        "additionalProperties": false,
        "properties": {
          "data": {
            "description": "Data to populate the secret with",
            "type": "string"
          },
          "merge": {
            "default": false,
            "description": "Whether or not to merge the input data from multiple sources into an array of values",
            "type": "boolean"
          },
          "name": {
            "description": "Name for the secret",
            "type": "string"
          },
          "namespace": {
            "description": "Namespace the secret should be place in",
            "type": "string"
          },
          "required": {
            "default": false,
            "description": "Whether or not the secret is required",
            "type": "boolean"
          },
          "sensitive": {
            "default": false,
            "description": "Whether or not the data is to be considered sensitive and stripped from logs",
            "type": "boolean"
          }
        },
        "required": [
          "name",
          "data"
        ],
        "type": "object"
      }
    }
  },
  "service": {
    "$ref": "#/definitions/ServiceInputs",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
      "ServiceInputs": {
        "additionalProperties": false,
        "properties": {
          "dnsZone": {
            "description": "Optional DNS zone to use for listeners",
            "type": "string"
          },
          "external_hostname": {
            "description": "External address to point to",
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
          "username": {
            "description": "Basic auth username",
            "type": "string"
          }
        },
        "required": [
          "name",
          "target_port"
        ],
        "type": "object"
      }
    }
  },
  "task": {
    "$ref": "#/definitions/TaskInputs",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
      "TaskInputs": {
        "additionalProperties": false,
        "properties": {
          "command": {
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
            ]
          },
          "cpu": {
            "type": "number"
          },
          "entrypoint": {
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
            ]
          },
          "environment": {
            "additionalProperties": {
              "type": "string"
            },
            "type": "object"
          },
          "image": {
            "type": "string"
          },
          "labels": {
            "additionalProperties": {
              "type": "string"
            },
            "type": "object"
          },
          "memory": {
            "type": "string"
          },
          "namespace": {
            "type": "string"
          },
          "sidecars": {
            "items": {
              "additionalProperties": false,
              "properties": {
                "command": {
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
                  ]
                },
                "cpu": {
                  "type": "number"
                },
                "entrypoint": {
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
                  ]
                },
                "environment": {
                  "additionalProperties": {
                    "type": "string"
                  },
                  "type": "object"
                },
                "image": {
                  "type": "string"
                },
                "memory": {
                  "type": "string"
                },
                "volume_mounts": {
                  "items": {
                    "additionalProperties": false,
                    "properties": {
                      "mount_path": {
                        "type": "string"
                      },
                      "readonly": {
                        "type": "boolean"
                      },
                      "volume": {
                        "type": "string"
                      }
                    },
                    "required": [
                      "volume",
                      "mount_path"
                    ],
                    "type": "object"
                  },
                  "type": "array"
                }
              },
              "required": [
                "image"
              ],
              "type": "object"
            },
            "type": "array"
          },
          "volume_mounts": {
            "items": {
              "additionalProperties": false,
              "properties": {
                "mount_path": {
                  "type": "string"
                },
                "readonly": {
                  "type": "boolean"
                },
                "volume": {
                  "type": "string"
                }
              },
              "required": [
                "volume",
                "mount_path"
              ],
              "type": "object"
            },
            "type": "array"
          }
        },
        "required": [
          "image"
        ],
        "type": "object"
      }
    }
  },
  "volume": {
    "$ref": "#/definitions/VolumeInputs",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
      "VolumeInputs": {
        "additionalProperties": false,
        "properties": {
          "hostPath": {
            "description": "Path on the host machine to mount the volume to",
            "type": "string"
          },
          "name": {
            "description": "Name to give to the volume resource",
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
  "vpc": {
    "$ref": "#/definitions/VpcInputs",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
      "VpcInputs": {
        "additionalProperties": false,
        "properties": {
          "description": {
            "description": "Description for the VPC",
            "type": "string"
          },
          "name": {
            "description": "Name of the VPC",
            "type": "string"
          },
          "region": {
            "description": "Region the VPC exists in",
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