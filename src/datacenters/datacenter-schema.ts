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
                            "build": {
                              "description": "The path to a module that will be built during the build step.",
                              "type": "string"
                            },
                            "environment": {
                              "additionalProperties": {
                                "type": "string"
                              },
                              "description": "Environment variables that should be provided to the container executing the module",
                              "type": "object"
                            },
                            "inputs": {
                              "anyOf": [
                                {
                                  "additionalProperties": {},
                                  "type": "object"
                                },
                                {
                                  "type": "string"
                                }
                              ],
                              "description": "Input values for the module."
                            },
                            "plugin": {
                              "description": "The plugin used to build the module. Defaults to pulumi.",
                              "enum": [
                                "pulumi",
                                "opentofu"
                              ],
                              "type": "string"
                            },
                            "source": {
                              "description": "The image source of the module.",
                              "type": "string"
                            },
                            "volume": {
                              "description": "Volumes that should be mounted to the container executing the module",
                              "items": {
                                "additionalProperties": false,
                                "properties": {
                                  "host_path": {
                                    "description": "The path on the host machine to mount to the container",
                                    "type": "string"
                                  },
                                  "mount_path": {
                                    "description": "The path in the container to mount the volume to",
                                    "type": "string"
                                  }
                                },
                                "required": [
                                  "host_path",
                                  "mount_path"
                                ],
                                "type": "object"
                              },
                              "type": "array"
                            },
                            "when": {
                              "description": "A condition that restricts when the module should be created. Must resolve to a boolean.",
                              "type": "string"
                            }
                          },
                          "required": [
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
                            "build": {
                              "description": "The path to a module that will be built during the build step.",
                              "type": "string"
                            },
                            "environment": {
                              "additionalProperties": {
                                "type": "string"
                              },
                              "description": "Environment variables that should be provided to the container executing the module",
                              "type": "object"
                            },
                            "inputs": {
                              "anyOf": [
                                {
                                  "additionalProperties": {},
                                  "type": "object"
                                },
                                {
                                  "type": "string"
                                }
                              ],
                              "description": "Input values for the module."
                            },
                            "plugin": {
                              "description": "The plugin used to build the module. Defaults to pulumi.",
                              "enum": [
                                "pulumi",
                                "opentofu"
                              ],
                              "type": "string"
                            },
                            "source": {
                              "description": "The image source of the module.",
                              "type": "string"
                            },
                            "volume": {
                              "description": "Volumes that should be mounted to the container executing the module",
                              "items": {
                                "additionalProperties": false,
                                "properties": {
                                  "host_path": {
                                    "description": "The path on the host machine to mount to the container",
                                    "type": "string"
                                  },
                                  "mount_path": {
                                    "description": "The path in the container to mount the volume to",
                                    "type": "string"
                                  }
                                },
                                "required": [
                                  "host_path",
                                  "mount_path"
                                ],
                                "type": "object"
                              },
                              "type": "array"
                            },
                            "when": {
                              "description": "A condition that restricts when the module should be created. Must resolve to a boolean.",
                              "type": "string"
                            }
                          },
                          "required": [
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
                            "build": {
                              "description": "The path to a module that will be built during the build step.",
                              "type": "string"
                            },
                            "environment": {
                              "additionalProperties": {
                                "type": "string"
                              },
                              "description": "Environment variables that should be provided to the container executing the module",
                              "type": "object"
                            },
                            "inputs": {
                              "anyOf": [
                                {
                                  "additionalProperties": {},
                                  "type": "object"
                                },
                                {
                                  "type": "string"
                                }
                              ],
                              "description": "Input values for the module."
                            },
                            "plugin": {
                              "description": "The plugin used to build the module. Defaults to pulumi.",
                              "enum": [
                                "pulumi",
                                "opentofu"
                              ],
                              "type": "string"
                            },
                            "source": {
                              "description": "The image source of the module.",
                              "type": "string"
                            },
                            "volume": {
                              "description": "Volumes that should be mounted to the container executing the module",
                              "items": {
                                "additionalProperties": false,
                                "properties": {
                                  "host_path": {
                                    "description": "The path on the host machine to mount to the container",
                                    "type": "string"
                                  },
                                  "mount_path": {
                                    "description": "The path in the container to mount the volume to",
                                    "type": "string"
                                  }
                                },
                                "required": [
                                  "host_path",
                                  "mount_path"
                                ],
                                "type": "object"
                              },
                              "type": "array"
                            },
                            "when": {
                              "description": "A condition that restricts when the module should be created. Must resolve to a boolean.",
                              "type": "string"
                            }
                          },
                          "required": [
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
                          "type": [
                            "number",
                            "string"
                          ]
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
                            "build": {
                              "description": "The path to a module that will be built during the build step.",
                              "type": "string"
                            },
                            "environment": {
                              "additionalProperties": {
                                "type": "string"
                              },
                              "description": "Environment variables that should be provided to the container executing the module",
                              "type": "object"
                            },
                            "inputs": {
                              "anyOf": [
                                {
                                  "additionalProperties": {},
                                  "type": "object"
                                },
                                {
                                  "type": "string"
                                }
                              ],
                              "description": "Input values for the module."
                            },
                            "plugin": {
                              "description": "The plugin used to build the module. Defaults to pulumi.",
                              "enum": [
                                "pulumi",
                                "opentofu"
                              ],
                              "type": "string"
                            },
                            "source": {
                              "description": "The image source of the module.",
                              "type": "string"
                            },
                            "volume": {
                              "description": "Volumes that should be mounted to the container executing the module",
                              "items": {
                                "additionalProperties": false,
                                "properties": {
                                  "host_path": {
                                    "description": "The path on the host machine to mount to the container",
                                    "type": "string"
                                  },
                                  "mount_path": {
                                    "description": "The path in the container to mount the volume to",
                                    "type": "string"
                                  }
                                },
                                "required": [
                                  "host_path",
                                  "mount_path"
                                ],
                                "type": "object"
                              },
                              "type": "array"
                            },
                            "when": {
                              "description": "A condition that restricts when the module should be created. Must resolve to a boolean.",
                              "type": "string"
                            }
                          },
                          "required": [
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
                            "build": {
                              "description": "The path to a module that will be built during the build step.",
                              "type": "string"
                            },
                            "environment": {
                              "additionalProperties": {
                                "type": "string"
                              },
                              "description": "Environment variables that should be provided to the container executing the module",
                              "type": "object"
                            },
                            "inputs": {
                              "anyOf": [
                                {
                                  "additionalProperties": {},
                                  "type": "object"
                                },
                                {
                                  "type": "string"
                                }
                              ],
                              "description": "Input values for the module."
                            },
                            "plugin": {
                              "description": "The plugin used to build the module. Defaults to pulumi.",
                              "enum": [
                                "pulumi",
                                "opentofu"
                              ],
                              "type": "string"
                            },
                            "source": {
                              "description": "The image source of the module.",
                              "type": "string"
                            },
                            "volume": {
                              "description": "Volumes that should be mounted to the container executing the module",
                              "items": {
                                "additionalProperties": false,
                                "properties": {
                                  "host_path": {
                                    "description": "The path on the host machine to mount to the container",
                                    "type": "string"
                                  },
                                  "mount_path": {
                                    "description": "The path in the container to mount the volume to",
                                    "type": "string"
                                  }
                                },
                                "required": [
                                  "host_path",
                                  "mount_path"
                                ],
                                "type": "object"
                              },
                              "type": "array"
                            },
                            "when": {
                              "description": "A condition that restricts when the module should be created. Must resolve to a boolean.",
                              "type": "string"
                            }
                          },
                          "required": [
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
                            "build": {
                              "description": "The path to a module that will be built during the build step.",
                              "type": "string"
                            },
                            "environment": {
                              "additionalProperties": {
                                "type": "string"
                              },
                              "description": "Environment variables that should be provided to the container executing the module",
                              "type": "object"
                            },
                            "inputs": {
                              "anyOf": [
                                {
                                  "additionalProperties": {},
                                  "type": "object"
                                },
                                {
                                  "type": "string"
                                }
                              ],
                              "description": "Input values for the module."
                            },
                            "plugin": {
                              "description": "The plugin used to build the module. Defaults to pulumi.",
                              "enum": [
                                "pulumi",
                                "opentofu"
                              ],
                              "type": "string"
                            },
                            "source": {
                              "description": "The image source of the module.",
                              "type": "string"
                            },
                            "volume": {
                              "description": "Volumes that should be mounted to the container executing the module",
                              "items": {
                                "additionalProperties": false,
                                "properties": {
                                  "host_path": {
                                    "description": "The path on the host machine to mount to the container",
                                    "type": "string"
                                  },
                                  "mount_path": {
                                    "description": "The path in the container to mount the volume to",
                                    "type": "string"
                                  }
                                },
                                "required": [
                                  "host_path",
                                  "mount_path"
                                ],
                                "type": "object"
                              },
                              "type": "array"
                            },
                            "when": {
                              "description": "A condition that restricts when the module should be created. Must resolve to a boolean.",
                              "type": "string"
                            }
                          },
                          "required": [
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
                        "url",
                        "path"
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
                      "build": {
                        "description": "The path to a module that will be built during the build step.",
                        "type": "string"
                      },
                      "environment": {
                        "additionalProperties": {
                          "type": "string"
                        },
                        "description": "Environment variables that should be provided to the container executing the module",
                        "type": "object"
                      },
                      "inputs": {
                        "anyOf": [
                          {
                            "additionalProperties": {},
                            "type": "object"
                          },
                          {
                            "type": "string"
                          }
                        ],
                        "description": "Input values for the module."
                      },
                      "plugin": {
                        "description": "The plugin used to build the module. Defaults to pulumi.",
                        "enum": [
                          "pulumi",
                          "opentofu"
                        ],
                        "type": "string"
                      },
                      "source": {
                        "description": "The image source of the module.",
                        "type": "string"
                      },
                      "volume": {
                        "description": "Volumes that should be mounted to the container executing the module",
                        "items": {
                          "additionalProperties": false,
                          "properties": {
                            "host_path": {
                              "description": "The path on the host machine to mount to the container",
                              "type": "string"
                            },
                            "mount_path": {
                              "description": "The path in the container to mount the volume to",
                              "type": "string"
                            }
                          },
                          "required": [
                            "host_path",
                            "mount_path"
                          ],
                          "type": "object"
                        },
                        "type": "array"
                      },
                      "when": {
                        "description": "A condition that restricts when the module should be created. Must resolve to a boolean.",
                        "type": "string"
                      }
                    },
                    "required": [
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
                            "build": {
                              "description": "The path to a module that will be built during the build step.",
                              "type": "string"
                            },
                            "environment": {
                              "additionalProperties": {
                                "type": "string"
                              },
                              "description": "Environment variables that should be provided to the container executing the module",
                              "type": "object"
                            },
                            "inputs": {
                              "anyOf": [
                                {
                                  "additionalProperties": {},
                                  "type": "object"
                                },
                                {
                                  "type": "string"
                                }
                              ],
                              "description": "Input values for the module."
                            },
                            "plugin": {
                              "description": "The plugin used to build the module. Defaults to pulumi.",
                              "enum": [
                                "pulumi",
                                "opentofu"
                              ],
                              "type": "string"
                            },
                            "source": {
                              "description": "The image source of the module.",
                              "type": "string"
                            },
                            "volume": {
                              "description": "Volumes that should be mounted to the container executing the module",
                              "items": {
                                "additionalProperties": false,
                                "properties": {
                                  "host_path": {
                                    "description": "The path on the host machine to mount to the container",
                                    "type": "string"
                                  },
                                  "mount_path": {
                                    "description": "The path in the container to mount the volume to",
                                    "type": "string"
                                  }
                                },
                                "required": [
                                  "host_path",
                                  "mount_path"
                                ],
                                "type": "object"
                              },
                              "type": "array"
                            },
                            "when": {
                              "description": "A condition that restricts when the module should be created. Must resolve to a boolean.",
                              "type": "string"
                            }
                          },
                          "required": [
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
                            "build": {
                              "description": "The path to a module that will be built during the build step.",
                              "type": "string"
                            },
                            "environment": {
                              "additionalProperties": {
                                "type": "string"
                              },
                              "description": "Environment variables that should be provided to the container executing the module",
                              "type": "object"
                            },
                            "inputs": {
                              "anyOf": [
                                {
                                  "additionalProperties": {},
                                  "type": "object"
                                },
                                {
                                  "type": "string"
                                }
                              ],
                              "description": "Input values for the module."
                            },
                            "plugin": {
                              "description": "The plugin used to build the module. Defaults to pulumi.",
                              "enum": [
                                "pulumi",
                                "opentofu"
                              ],
                              "type": "string"
                            },
                            "source": {
                              "description": "The image source of the module.",
                              "type": "string"
                            },
                            "volume": {
                              "description": "Volumes that should be mounted to the container executing the module",
                              "items": {
                                "additionalProperties": false,
                                "properties": {
                                  "host_path": {
                                    "description": "The path on the host machine to mount to the container",
                                    "type": "string"
                                  },
                                  "mount_path": {
                                    "description": "The path in the container to mount the volume to",
                                    "type": "string"
                                  }
                                },
                                "required": [
                                  "host_path",
                                  "mount_path"
                                ],
                                "type": "object"
                              },
                              "type": "array"
                            },
                            "when": {
                              "description": "A condition that restricts when the module should be created. Must resolve to a boolean.",
                              "type": "string"
                            }
                          },
                          "required": [
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
                          "description": "Host the service listens on",
                          "type": "string"
                        },
                        "port": {
                          "description": "Port the service listens on",
                          "type": [
                            "number",
                            "string"
                          ]
                        },
                        "protocol": {
                          "description": "Protocol the service listens on",
                          "type": "string"
                        },
                        "url": {
                          "description": "Fully resolvable URL of the service",
                          "type": "string"
                        }
                      },
                      "required": [
                        "protocol",
                        "host",
                        "port",
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
                            "build": {
                              "description": "The path to a module that will be built during the build step.",
                              "type": "string"
                            },
                            "environment": {
                              "additionalProperties": {
                                "type": "string"
                              },
                              "description": "Environment variables that should be provided to the container executing the module",
                              "type": "object"
                            },
                            "inputs": {
                              "anyOf": [
                                {
                                  "additionalProperties": {},
                                  "type": "object"
                                },
                                {
                                  "type": "string"
                                }
                              ],
                              "description": "Input values for the module."
                            },
                            "plugin": {
                              "description": "The plugin used to build the module. Defaults to pulumi.",
                              "enum": [
                                "pulumi",
                                "opentofu"
                              ],
                              "type": "string"
                            },
                            "source": {
                              "description": "The image source of the module.",
                              "type": "string"
                            },
                            "volume": {
                              "description": "Volumes that should be mounted to the container executing the module",
                              "items": {
                                "additionalProperties": false,
                                "properties": {
                                  "host_path": {
                                    "description": "The path on the host machine to mount to the container",
                                    "type": "string"
                                  },
                                  "mount_path": {
                                    "description": "The path in the container to mount the volume to",
                                    "type": "string"
                                  }
                                },
                                "required": [
                                  "host_path",
                                  "mount_path"
                                ],
                                "type": "object"
                              },
                              "type": "array"
                            },
                            "when": {
                              "description": "A condition that restricts when the module should be created. Must resolve to a boolean.",
                              "type": "string"
                            }
                          },
                          "required": [
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
                "build": {
                  "description": "The path to a module that will be built during the build step.",
                  "type": "string"
                },
                "environment": {
                  "additionalProperties": {
                    "type": "string"
                  },
                  "description": "Environment variables that should be provided to the container executing the module",
                  "type": "object"
                },
                "inputs": {
                  "anyOf": [
                    {
                      "additionalProperties": {},
                      "type": "object"
                    },
                    {
                      "type": "string"
                    }
                  ],
                  "description": "Input values for the module."
                },
                "plugin": {
                  "description": "The plugin used to build the module. Defaults to pulumi.",
                  "enum": [
                    "pulumi",
                    "opentofu"
                  ],
                  "type": "string"
                },
                "source": {
                  "description": "The image source of the module.",
                  "type": "string"
                },
                "volume": {
                  "description": "Volumes that should be mounted to the container executing the module",
                  "items": {
                    "additionalProperties": false,
                    "properties": {
                      "host_path": {
                        "description": "The path on the host machine to mount to the container",
                        "type": "string"
                      },
                      "mount_path": {
                        "description": "The path in the container to mount the volume to",
                        "type": "string"
                      }
                    },
                    "required": [
                      "host_path",
                      "mount_path"
                    ],
                    "type": "object"
                  },
                  "type": "array"
                },
                "when": {
                  "description": "A condition that restricts when the module should be created. Must resolve to a boolean.",
                  "type": "string"
                }
              },
              "required": [
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