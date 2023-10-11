export default {
  "$ref": "#/definitions/DatacenterSchema",
  "$schema": "http://json-schema.org/draft-07/schema#",
  "definitions": {
    "DatacenterSchema": {
      "additionalProperties": false,
      "properties": {
        "environment": {
          "description": "Rules dictating what resources should be created in each environment hosted by the datacenter",
          "items": {
            "additionalProperties": false,
            "properties": {
              "cronjob": {
                "items": {
                  "additionalProperties": false,
                  "properties": {
                    "module": {
                      "additionalProperties": {
                        "items": {
                          "additionalProperties": false,
                          "properties": {
                            "inputs": {
                              "additionalProperties": {},
                              "description": "Input values for the module",
                              "type": "object"
                            },
                            "source": {
                              "description": "The image source of the module",
                              "type": "string"
                            }
                          },
                          "required": [
                            "source",
                            "inputs"
                          ],
                          "type": "object"
                        },
                        "type": "array"
                      },
                      "description": "Modules that will be created once per matching application resource",
                      "type": "object"
                    },
                    "outputs": {
                      "additionalProperties": {},
                      "description": "A map of output values to be passed to upstream application resources",
                      "type": "object"
                    },
                    "when": {
                      "description": "A condition that restricts when the hook should be active. Must resolve to a boolean.",
                      "type": "string"
                    }
                  },
                  "type": "object"
                },
                "type": "array"
              },
              "database": {
                "items": {
                  "additionalProperties": false,
                  "properties": {
                    "module": {
                      "additionalProperties": {
                        "items": {
                          "additionalProperties": false,
                          "properties": {
                            "inputs": {
                              "additionalProperties": {},
                              "description": "Input values for the module",
                              "type": "object"
                            },
                            "source": {
                              "description": "The image source of the module",
                              "type": "string"
                            }
                          },
                          "required": [
                            "source",
                            "inputs"
                          ],
                          "type": "object"
                        },
                        "type": "array"
                      },
                      "description": "Modules that will be created once per matching application resource",
                      "type": "object"
                    },
                    "outputs": {
                      "additionalProperties": false,
                      "description": "A map of output values to be passed to upstream application resources",
                      "properties": {
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
                        "username",
                        "password"
                      ],
                      "type": "object"
                    },
                    "when": {
                      "description": "A condition that restricts when the hook should be active. Must resolve to a boolean.",
                      "type": "string"
                    }
                  },
                  "type": "object"
                },
                "type": "array"
              },
              "databaseUser": {
                "items": {
                  "additionalProperties": false,
                  "properties": {
                    "module": {
                      "additionalProperties": {
                        "items": {
                          "additionalProperties": false,
                          "properties": {
                            "inputs": {
                              "additionalProperties": {},
                              "description": "Input values for the module",
                              "type": "object"
                            },
                            "source": {
                              "description": "The image source of the module",
                              "type": "string"
                            }
                          },
                          "required": [
                            "source",
                            "inputs"
                          ],
                          "type": "object"
                        },
                        "type": "array"
                      },
                      "description": "Modules that will be created once per matching application resource",
                      "type": "object"
                    },
                    "outputs": {
                      "additionalProperties": false,
                      "description": "A map of output values to be passed to upstream application resources",
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
                    },
                    "when": {
                      "description": "A condition that restricts when the hook should be active. Must resolve to a boolean.",
                      "type": "string"
                    }
                  },
                  "type": "object"
                },
                "type": "array"
              },
              "deployment": {
                "items": {
                  "additionalProperties": false,
                  "properties": {
                    "module": {
                      "additionalProperties": {
                        "items": {
                          "additionalProperties": false,
                          "properties": {
                            "inputs": {
                              "additionalProperties": {},
                              "description": "Input values for the module",
                              "type": "object"
                            },
                            "source": {
                              "description": "The image source of the module",
                              "type": "string"
                            }
                          },
                          "required": [
                            "source",
                            "inputs"
                          ],
                          "type": "object"
                        },
                        "type": "array"
                      },
                      "description": "Modules that will be created once per matching application resource",
                      "type": "object"
                    },
                    "outputs": {
                      "additionalProperties": false,
                      "description": "A map of output values to be passed to upstream application resources",
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
                    },
                    "when": {
                      "description": "A condition that restricts when the hook should be active. Must resolve to a boolean.",
                      "type": "string"
                    }
                  },
                  "type": "object"
                },
                "type": "array"
              },
              "dockerBuild": {
                "items": {
                  "additionalProperties": false,
                  "properties": {
                    "module": {
                      "additionalProperties": {
                        "items": {
                          "additionalProperties": false,
                          "properties": {
                            "inputs": {
                              "additionalProperties": {},
                              "description": "Input values for the module",
                              "type": "object"
                            },
                            "source": {
                              "description": "The image source of the module",
                              "type": "string"
                            }
                          },
                          "required": [
                            "source",
                            "inputs"
                          ],
                          "type": "object"
                        },
                        "type": "array"
                      },
                      "description": "Modules that will be created once per matching application resource",
                      "type": "object"
                    },
                    "outputs": {
                      "additionalProperties": {},
                      "description": "A map of output values to be passed to upstream application resources",
                      "type": "object"
                    },
                    "when": {
                      "description": "A condition that restricts when the hook should be active. Must resolve to a boolean.",
                      "type": "string"
                    }
                  },
                  "type": "object"
                },
                "type": "array"
              },
              "ingress": {
                "items": {
                  "additionalProperties": false,
                  "properties": {
                    "module": {
                      "additionalProperties": {
                        "items": {
                          "additionalProperties": false,
                          "properties": {
                            "inputs": {
                              "additionalProperties": {},
                              "description": "Input values for the module",
                              "type": "object"
                            },
                            "source": {
                              "description": "The image source of the module",
                              "type": "string"
                            }
                          },
                          "required": [
                            "source",
                            "inputs"
                          ],
                          "type": "object"
                        },
                        "type": "array"
                      },
                      "description": "Modules that will be created once per matching application resource",
                      "type": "object"
                    },
                    "outputs": {
                      "additionalProperties": false,
                      "description": "A map of output values to be passed to upstream application resources",
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
                    },
                    "when": {
                      "description": "A condition that restricts when the hook should be active. Must resolve to a boolean.",
                      "type": "string"
                    }
                  },
                  "type": "object"
                },
                "type": "array"
              },
              "module": {
                "additionalProperties": {
                  "items": {
                    "additionalProperties": false,
                    "properties": {
                      "inputs": {
                        "additionalProperties": {},
                        "description": "Input values for the module",
                        "type": "object"
                      },
                      "source": {
                        "description": "The image source of the module",
                        "type": "string"
                      }
                    },
                    "required": [
                      "source",
                      "inputs"
                    ],
                    "type": "object"
                  },
                  "type": "array"
                },
                "description": "Modules that will be created once per environment",
                "type": "object"
              },
              "secret": {
                "items": {
                  "additionalProperties": false,
                  "properties": {
                    "module": {
                      "additionalProperties": {
                        "items": {
                          "additionalProperties": false,
                          "properties": {
                            "inputs": {
                              "additionalProperties": {},
                              "description": "Input values for the module",
                              "type": "object"
                            },
                            "source": {
                              "description": "The image source of the module",
                              "type": "string"
                            }
                          },
                          "required": [
                            "source",
                            "inputs"
                          ],
                          "type": "object"
                        },
                        "type": "array"
                      },
                      "description": "Modules that will be created once per matching application resource",
                      "type": "object"
                    },
                    "outputs": {
                      "additionalProperties": false,
                      "description": "A map of output values to be passed to upstream application resources",
                      "properties": {
                        "data": {
                          "type": "string"
                        }
                      },
                      "required": [
                        "data"
                      ],
                      "type": "object"
                    },
                    "when": {
                      "description": "A condition that restricts when the hook should be active. Must resolve to a boolean.",
                      "type": "string"
                    }
                  },
                  "type": "object"
                },
                "type": "array"
              },
              "service": {
                "items": {
                  "additionalProperties": false,
                  "properties": {
                    "module": {
                      "additionalProperties": {
                        "items": {
                          "additionalProperties": false,
                          "properties": {
                            "inputs": {
                              "additionalProperties": {},
                              "description": "Input values for the module",
                              "type": "object"
                            },
                            "source": {
                              "description": "The image source of the module",
                              "type": "string"
                            }
                          },
                          "required": [
                            "source",
                            "inputs"
                          ],
                          "type": "object"
                        },
                        "type": "array"
                      },
                      "description": "Modules that will be created once per matching application resource",
                      "type": "object"
                    },
                    "outputs": {
                      "additionalProperties": false,
                      "description": "A map of output values to be passed to upstream application resources",
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
                    },
                    "when": {
                      "description": "A condition that restricts when the hook should be active. Must resolve to a boolean.",
                      "type": "string"
                    }
                  },
                  "type": "object"
                },
                "type": "array"
              },
              "volume": {
                "items": {
                  "additionalProperties": false,
                  "properties": {
                    "module": {
                      "additionalProperties": {
                        "items": {
                          "additionalProperties": false,
                          "properties": {
                            "inputs": {
                              "additionalProperties": {},
                              "description": "Input values for the module",
                              "type": "object"
                            },
                            "source": {
                              "description": "The image source of the module",
                              "type": "string"
                            }
                          },
                          "required": [
                            "source",
                            "inputs"
                          ],
                          "type": "object"
                        },
                        "type": "array"
                      },
                      "description": "Modules that will be created once per matching application resource",
                      "type": "object"
                    },
                    "outputs": {
                      "additionalProperties": {},
                      "description": "A map of output values to be passed to upstream application resources",
                      "type": "object"
                    },
                    "when": {
                      "description": "A condition that restricts when the hook should be active. Must resolve to a boolean.",
                      "type": "string"
                    }
                  },
                  "type": "object"
                },
                "type": "array"
              }
            },
            "type": "object"
          },
          "type": "array"
        },
        "module": {
          "additionalProperties": {
            "items": {
              "additionalProperties": false,
              "properties": {
                "inputs": {
                  "additionalProperties": {},
                  "description": "Input values for the module",
                  "type": "object"
                },
                "source": {
                  "description": "The image source of the module",
                  "type": "string"
                }
              },
              "required": [
                "source",
                "inputs"
              ],
              "type": "object"
            },
            "type": "array"
          },
          "description": "Modules that will be created once per datacenter",
          "type": "object"
        },
        "variable": {
          "additionalProperties": {
            "items": {
              "additionalProperties": false,
              "properties": {
                "default": {
                  "description": "The default value of the variable",
                  "type": "string"
                },
                "description": {
                  "description": "A human-readable description of the variable",
                  "type": "string"
                },
                "type": {
                  "description": "The type of the variable",
                  "enum": [
                    "string",
                    "number",
                    "boolean"
                  ],
                  "type": "string"
                }
              },
              "required": [
                "type"
              ],
              "type": "object"
            },
            "type": "array"
          },
          "description": "Variables necessary for the datacenter to run",
          "type": "object"
        },
        "version": {
          "const": "v1",
          "type": "string"
        }
      },
      "required": [
        "version"
      ],
      "type": "object"
    }
  },
  "$id": "https://architect.io/.schemas/datacenter.json"
}