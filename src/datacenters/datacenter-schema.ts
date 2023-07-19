export default {
  '$ref': '#/definitions/DatacenterSchema',
  '$schema': 'https://json-schema.org/draft/2019-09/schema',
  'definitions': {
    'DatacenterSchema': {
      'additionalProperties': false,
      'properties': {
        'accounts': {
          'additionalProperties': {
            'additionalProperties': false,
            'properties': {
              'credentials': {
                'description': 'Credentials used to access the cloud provider',
                'type': 'object',
              },
              'name': {
                'description': 'Name of the new account',
                'type': 'string',
              },
              'provider': {
                'description': 'Cloud provider the account connects to',
                'type': 'string',
              },
            },
            'required': [
              'name',
              'provider',
              'credentials',
            ],
            'type': 'object',
          },
          'description': 'Cloud accounts to register and remove with the lifecycle of the datacenter',
          'type': 'object',
        },
        'environment': {
          'additionalProperties': false,
          'description': 'A template for how environments inside the datacenter should behave',
          'properties': {
            'accounts': {
              'additionalProperties': {
                'additionalProperties': false,
                'properties': {
                  'credentials': {
                    'description': 'Credentials used to access the cloud provider',
                    'type': 'object',
                  },
                  'name': {
                    'description': 'Name of the new account',
                    'type': 'string',
                  },
                  'provider': {
                    'description': 'Cloud provider the account connects to',
                    'type': 'string',
                  },
                },
                'required': [
                  'name',
                  'provider',
                  'credentials',
                ],
                'type': 'object',
              },
              'description': 'Cloud accounts to register and remove with the lifecycle of the environment',
              'type': 'object',
            },
            'hooks': {
              'description': 'Configure rules for how application resources should behave in the environment',
              'items': {
                'properties': {
                  'accounts': {
                    'additionalProperties': {
                      'additionalProperties': false,
                      'properties': {
                        'credentials': {
                          'description': 'Credentials used to access the cloud provider',
                          'type': 'object',
                        },
                        'name': {
                          'description': 'Name of the new account',
                          'type': 'string',
                        },
                        'provider': {
                          'description': 'Cloud provider the account connects to',
                          'type': 'string',
                        },
                      },
                      'required': [
                        'name',
                        'provider',
                        'credentials',
                      ],
                      'type': 'object',
                    },
                    'type': 'object',
                  },
                  'modules': {
                    'additionalProperties': {
                      'additionalProperties': {},
                      'properties': {
                        'source': {
                          'type': 'string',
                        },
                      },
                      'required': [
                        'source',
                      ],
                      'type': 'object',
                    },
                    'type': 'object',
                  },
                  'resources': {
                    'additionalProperties': {
                      'allOf': [
                        {
                          'if': {
                            'properties': {
                              'type': {
                                'const': 'arcctlAccount',
                                'type': 'string',
                              },
                            },
                          },
                          'then': {
                            'additionalProperties': false,
                            'properties': {
                              'account': {
                                'type': 'string',
                              },
                              'credentials': {
                                'description': 'Credentials used to access the cloud provider',
                                'type': 'object',
                              },
                              'name': {
                                'description': 'Name of the new account',
                                'type': 'string',
                              },
                              'provider': {
                                'description': 'Cloud provider the account connects to',
                                'type': 'string',
                              },
                              'type': {
                                'const': 'arcctlAccount',
                                'type': 'string',
                              },
                            },
                            'required': [
                              'account',
                              'credentials',
                              'name',
                              'provider',
                              'type',
                            ],
                            'type': 'object',
                          },
                        },
                        {
                          'if': {
                            'properties': {
                              'type': {
                                'const': 'cronjob',
                                'type': 'string',
                              },
                            },
                          },
                          'then': {
                            'additionalProperties': false,
                            'properties': {
                              'account': {
                                'type': 'string',
                              },
                              'command': {
                                'anyOf': [
                                  {
                                    'type': 'string',
                                  },
                                  {
                                    'items': {
                                      'type': 'string',
                                    },
                                    'type': 'array',
                                  },
                                ],
                              },
                              'cpu': {
                                'type': 'number',
                              },
                              'entrypoint': {
                                'anyOf': [
                                  {
                                    'type': 'string',
                                  },
                                  {
                                    'items': {
                                      'type': 'string',
                                    },
                                    'type': 'array',
                                  },
                                ],
                              },
                              'environment': {
                                'additionalProperties': {
                                  'type': 'string',
                                },
                                'type': 'object',
                              },
                              'image': {
                                'type': 'string',
                              },
                              'labels': {
                                'additionalProperties': {
                                  'type': 'string',
                                },
                                'type': 'object',
                              },
                              'memory': {
                                'type': 'string',
                              },
                              'namespace': {
                                'type': 'string',
                              },
                              'platform': {
                                'type': 'string',
                              },
                              'schedule': {
                                'type': 'string',
                              },
                              'sidecars': {
                                'items': {
                                  'additionalProperties': false,
                                  'properties': {
                                    'command': {
                                      'anyOf': [
                                        {
                                          'type': 'string',
                                        },
                                        {
                                          'items': {
                                            'type': 'string',
                                          },
                                          'type': 'array',
                                        },
                                      ],
                                    },
                                    'cpu': {
                                      'type': 'number',
                                    },
                                    'entrypoint': {
                                      'anyOf': [
                                        {
                                          'type': 'string',
                                        },
                                        {
                                          'items': {
                                            'type': 'string',
                                          },
                                          'type': 'array',
                                        },
                                      ],
                                    },
                                    'environment': {
                                      'additionalProperties': {
                                        'type': 'string',
                                      },
                                      'type': 'object',
                                    },
                                    'image': {
                                      'type': 'string',
                                    },
                                    'memory': {
                                      'type': 'string',
                                    },
                                    'platform': {
                                      'type': 'string',
                                    },
                                    'volume_mounts': {
                                      'items': {
                                        'additionalProperties': false,
                                        'properties': {
                                          'mount_path': {
                                            'type': 'string',
                                          },
                                          'readonly': {
                                            'type': 'boolean',
                                          },
                                          'volume': {
                                            'type': 'string',
                                          },
                                        },
                                        'required': [
                                          'volume',
                                          'mount_path',
                                        ],
                                        'type': 'object',
                                      },
                                      'type': 'array',
                                    },
                                  },
                                  'required': [
                                    'image',
                                  ],
                                  'type': 'object',
                                },
                                'type': 'array',
                              },
                              'type': {
                                'const': 'cronjob',
                                'type': 'string',
                              },
                              'volume_mounts': {
                                'items': {
                                  'additionalProperties': false,
                                  'properties': {
                                    'mount_path': {
                                      'type': 'string',
                                    },
                                    'readonly': {
                                      'type': 'boolean',
                                    },
                                    'volume': {
                                      'type': 'string',
                                    },
                                  },
                                  'required': [
                                    'volume',
                                    'mount_path',
                                  ],
                                  'type': 'object',
                                },
                                'type': 'array',
                              },
                            },
                            'required': [
                              'account',
                              'image',
                              'schedule',
                              'type',
                            ],
                            'type': 'object',
                          },
                        },
                        {
                          'if': {
                            'properties': {
                              'type': {
                                'const': 'database',
                                'type': 'string',
                              },
                            },
                          },
                          'then': {
                            'additionalProperties': false,
                            'properties': {
                              'account': {
                                'type': 'string',
                              },
                              'databaseSize': {
                                'description': 'Size of the database instance to create',
                                'type': 'string',
                              },
                              'databaseType': {
                                'description': 'The type of database engine to use',
                                'type': 'string',
                              },
                              'databaseVersion': {
                                'description': 'Refers to the unique ID of a `databaseVersion` response',
                                'type': 'string',
                              },
                              'description': {
                                'description': 'Human-readable description of the database',
                                'type': 'string',
                              },
                              'name': {
                                'description': 'Unique name for the database',
                                'type': 'string',
                              },
                              'region': {
                                'description': 'Unique ID of the region to run the database in',
                                'type': 'string',
                              },
                              'type': {
                                'const': 'database',
                                'type': 'string',
                              },
                              'vpc': {
                                'description': 'Unique ID of the VPC to run the database in',
                                'type': 'string',
                              },
                            },
                            'required': [
                              'account',
                              'databaseSize',
                              'databaseType',
                              'databaseVersion',
                              'name',
                              'region',
                              'type',
                              'vpc',
                            ],
                            'type': 'object',
                          },
                        },
                        {
                          'if': {
                            'properties': {
                              'type': {
                                'const': 'databaseSchema',
                                'type': 'string',
                              },
                            },
                          },
                          'then': {
                            'additionalProperties': false,
                            'properties': {
                              'account': {
                                'type': 'string',
                              },
                              'database': {
                                'description': 'Unique ID of the database backing this schema',
                                'type': 'string',
                              },
                              'databaseType': {
                                'description': 'Type of database required by the schema',
                                'type': 'string',
                              },
                              'databaseVersion': {
                                'description': 'Version of the database type the schema creation process expects',
                                'type': 'string',
                              },
                              'name': {
                                'description': 'Name to give to the new schema',
                                'type': 'string',
                              },
                              'type': {
                                'const': 'databaseSchema',
                                'type': 'string',
                              },
                            },
                            'required': [
                              'account',
                              'database',
                              'databaseType',
                              'databaseVersion',
                              'name',
                              'type',
                            ],
                            'type': 'object',
                          },
                        },
                        {
                          'if': {
                            'properties': {
                              'type': {
                                'properties': {},
                                'type': 'object',
                              },
                            },
                          },
                          'then': {
                            'additionalProperties': {},
                            'properties': {
                              'account': {
                                'type': 'string',
                              },
                              'type': {
                                'const': 'databaseSize',
                                'type': 'string',
                              },
                            },
                            'required': [
                              'account',
                              'type',
                            ],
                            'type': 'object',
                          },
                        },
                        {
                          'if': {
                            'properties': {
                              'type': {
                                'properties': {},
                                'type': 'object',
                              },
                            },
                          },
                          'then': {
                            'additionalProperties': {},
                            'properties': {
                              'account': {
                                'type': 'string',
                              },
                              'type': {
                                'const': 'databaseType',
                                'type': 'string',
                              },
                            },
                            'required': [
                              'account',
                              'type',
                            ],
                            'type': 'object',
                          },
                        },
                        {
                          'if': {
                            'properties': {
                              'type': {
                                'const': 'databaseUser',
                                'type': 'string',
                              },
                            },
                          },
                          'then': {
                            'additionalProperties': false,
                            'properties': {
                              'account': {
                                'type': 'string',
                              },
                              'databaseSchema': {
                                'description': 'The schema the user should have access to',
                                'type': 'string',
                              },
                              'type': {
                                'const': 'databaseUser',
                                'type': 'string',
                              },
                              'username': {
                                'description': 'Username of the user to create',
                                'type': 'string',
                              },
                            },
                            'required': [
                              'account',
                              'databaseSchema',
                              'type',
                              'username',
                            ],
                            'type': 'object',
                          },
                        },
                        {
                          'if': {
                            'properties': {
                              'type': {
                                'const': 'databaseVersion',
                                'type': 'string',
                              },
                            },
                          },
                          'then': {
                            'additionalProperties': false,
                            'properties': {
                              'account': {
                                'type': 'string',
                              },
                              'databaseType': {
                                'type': 'string',
                              },
                              'type': {
                                'const': 'databaseVersion',
                                'type': 'string',
                              },
                            },
                            'required': [
                              'account',
                              'databaseType',
                              'type',
                            ],
                            'type': 'object',
                          },
                        },
                        {
                          'if': {
                            'properties': {
                              'type': {
                                'const': 'deployment',
                                'type': 'string',
                              },
                            },
                          },
                          'then': {
                            'additionalProperties': false,
                            'properties': {
                              'account': {
                                'type': 'string',
                              },
                              'autoscaling': {
                                'additionalProperties': false,
                                'description': 'Autoscaling rules for the deployment',
                                'properties': {
                                  'max_replicas': {
                                    'description': 'Maximum number of replicas of the deployment to run',
                                    'type': 'number',
                                  },
                                  'min_replicas': {
                                    'description': 'Minimum number of replicas of the deployment to run',
                                    'minimum': 0,
                                    'type': 'number',
                                  },
                                },
                                'required': [
                                  'min_replicas',
                                  'max_replicas',
                                ],
                                'type': 'object',
                              },
                              'command': {
                                'anyOf': [
                                  {
                                    'type': 'string',
                                  },
                                  {
                                    'items': {
                                      'type': 'string',
                                    },
                                    'type': 'array',
                                  },
                                ],
                                'description': 'Command to execute in the container',
                              },
                              'cpu': {
                                'description': 'Number of CPUs to allocate to the container',
                                'minimum': 0.1,
                                'type': 'number',
                              },
                              'entrypoint': {
                                'anyOf': [
                                  {
                                    'type': 'string',
                                  },
                                  {
                                    'items': {
                                      'type': 'string',
                                    },
                                    'type': 'array',
                                  },
                                ],
                                'description': 'Entrypoint of the container',
                              },
                              'environment': {
                                'additionalProperties': {
                                  'anyOf': [
                                    {
                                      'type': 'string',
                                    },
                                    {
                                      'type': 'number',
                                    },
                                    {
                                      'type': 'boolean',
                                    },
                                    {
                                      'type': 'null',
                                    },
                                    {
                                      'not': {},
                                    },
                                  ],
                                },
                                'description': 'Environment variables to pass to the container',
                                'type': 'object',
                              },
                              'exposed_ports': {
                                'description': 'Port that the deployment should expose on all nodes',
                                'items': {
                                  'additionalProperties': false,
                                  'properties': {
                                    'port': {
                                      'type': 'number',
                                    },
                                    'target_port': {
                                      'type': 'number',
                                    },
                                  },
                                  'required': [
                                    'port',
                                    'target_port',
                                  ],
                                  'type': 'object',
                                },
                                'type': 'array',
                              },
                              'image': {
                                'description': 'Image the container runs from',
                                'type': 'string',
                              },
                              'labels': {
                                'additionalProperties': {
                                  'type': 'string',
                                },
                                'description': 'Labels for the deployment',
                                'type': 'object',
                              },
                              'memory': {
                                'description': 'Amount of memory to allocate to the container',
                                'type': 'string',
                              },
                              'name': {
                                'description': 'Deployment name',
                                'type': 'string',
                              },
                              'namespace': {
                                'description': 'Namespace the deployment should be in',
                                'type': 'string',
                              },
                              'platform': {
                                'description': 'Target platform the deployment will run on',
                                'type': 'string',
                              },
                              'probes': {
                                'additionalProperties': false,
                                'properties': {
                                  'liveness': {
                                    'anyOf': [
                                      {
                                        'additionalProperties': false,
                                        'properties': {
                                          'command': {
                                            'description':
                                              'Command to run inside the container to determine if its healthy',
                                            'items': {
                                              'type': 'string',
                                            },
                                            'type': 'array',
                                          },
                                          'failure_threshold': {
                                            'default': 3,
                                            'description':
                                              'Number of times the probe will tolerate failure before giving up. Giving up in the case of liveness probe means restarting the container.',
                                            'minimum': 1,
                                            'type': 'number',
                                          },
                                          'initial_delay': {
                                            'default': 0,
                                            'description':
                                              'Number of seconds after the container starts before the probe is initiated.',
                                            'minimum': 0,
                                            'type': 'number',
                                          },
                                          'interval': {
                                            'default': 10,
                                            'description': 'How often (in seconds) to perform the probe.',
                                            'minimum': 1,
                                            'type': 'number',
                                          },
                                          'success_threshold': {
                                            'default': 1,
                                            'description':
                                              'Minimum consecutive successes for the probe to be considered successful after having failed.',
                                            'minimum': 1,
                                            'type': 'number',
                                          },
                                          'timeout': {
                                            'default': 1,
                                            'description': 'Number of seconds after which the probe times out',
                                            'minimum': 1,
                                            'type': 'number',
                                          },
                                          'type': {
                                            'const': 'exec',
                                            'type': 'string',
                                          },
                                        },
                                        'required': [
                                          'command',
                                          'type',
                                        ],
                                        'type': 'object',
                                      },
                                      {
                                        'additionalProperties': false,
                                        'properties': {
                                          'failure_threshold': {
                                            'default': 3,
                                            'description':
                                              'Number of times the probe will tolerate failure before giving up. Giving up in the case of liveness probe means restarting the container.',
                                            'minimum': 1,
                                            'type': 'number',
                                          },
                                          'headers': {
                                            'description': 'Custom headers to set in the request.',
                                            'items': {
                                              'additionalProperties': false,
                                              'properties': {
                                                'name': {
                                                  'type': 'string',
                                                },
                                                'value': {
                                                  'type': 'string',
                                                },
                                              },
                                              'required': [
                                                'name',
                                                'value',
                                              ],
                                              'type': 'object',
                                            },
                                            'type': 'array',
                                          },
                                          'initial_delay': {
                                            'default': 0,
                                            'description':
                                              'Number of seconds after the container starts before the probe is initiated.',
                                            'minimum': 0,
                                            'type': 'number',
                                          },
                                          'interval': {
                                            'default': 10,
                                            'description': 'How often (in seconds) to perform the probe.',
                                            'minimum': 1,
                                            'type': 'number',
                                          },
                                          'path': {
                                            'default': '/',
                                            'description': 'Path to access on the http server',
                                            'type': 'string',
                                          },
                                          'port': {
                                            'description': 'Port to access on the container',
                                            'type': 'number',
                                          },
                                          'scheme': {
                                            'default': 'http',
                                            'description': 'Scheme to use for connecting to the host (http or https).',
                                            'type': 'string',
                                          },
                                          'success_threshold': {
                                            'default': 1,
                                            'description':
                                              'Minimum consecutive successes for the probe to be considered successful after having failed.',
                                            'minimum': 1,
                                            'type': 'number',
                                          },
                                          'timeout': {
                                            'default': 1,
                                            'description': 'Number of seconds after which the probe times out',
                                            'minimum': 1,
                                            'type': 'number',
                                          },
                                          'type': {
                                            'const': 'http',
                                            'type': 'string',
                                          },
                                        },
                                        'required': [
                                          'type',
                                        ],
                                        'type': 'object',
                                      },
                                    ],
                                  },
                                },
                                'type': 'object',
                              },
                              'replicas': {
                                'default': 1,
                                'description': 'Number of replicas of the deployment to run',
                                'type': 'number',
                              },
                              'services': {
                                'description': 'Services this deployment should register itself with',
                                'items': {
                                  'additionalProperties': false,
                                  'properties': {
                                    'account': {
                                      'description':
                                        'The account the deployment can use to register itself with the service.',
                                      'type': 'string',
                                    },
                                    'id': {
                                      'description': 'Unique ID of the service the deployment should attach itself to',
                                      'type': 'string',
                                    },
                                  },
                                  'required': [
                                    'id',
                                    'account',
                                  ],
                                  'type': 'object',
                                },
                                'type': 'array',
                              },
                              'sidecars': {
                                'description': 'A set of additional containers to run as part of each replica',
                                'items': {
                                  'additionalProperties': false,
                                  'properties': {
                                    'command': {
                                      'anyOf': [
                                        {
                                          'type': 'string',
                                        },
                                        {
                                          'items': {
                                            'type': 'string',
                                          },
                                          'type': 'array',
                                        },
                                      ],
                                      'description': 'Command to execute in the container',
                                    },
                                    'cpu': {
                                      'description': 'Number of CPUs to allocate to the container',
                                      'minimum': 0.1,
                                      'type': 'number',
                                    },
                                    'entrypoint': {
                                      'anyOf': [
                                        {
                                          'type': 'string',
                                        },
                                        {
                                          'items': {
                                            'type': 'string',
                                          },
                                          'type': 'array',
                                        },
                                      ],
                                      'description': 'Entrypoint of the container',
                                    },
                                    'environment': {
                                      'additionalProperties': {
                                        'anyOf': [
                                          {
                                            'type': 'string',
                                          },
                                          {
                                            'type': 'number',
                                          },
                                          {
                                            'type': 'boolean',
                                          },
                                          {
                                            'type': 'null',
                                          },
                                          {
                                            'not': {},
                                          },
                                        ],
                                      },
                                      'description': 'Environment variables to pass to the container',
                                      'type': 'object',
                                    },
                                    'image': {
                                      'description': 'Image the container runs from',
                                      'type': 'string',
                                    },
                                    'memory': {
                                      'description': 'Amount of memory to allocate to the container',
                                      'type': 'string',
                                    },
                                    'probes': {
                                      'additionalProperties': false,
                                      'properties': {
                                        'liveness': {
                                          'anyOf': [
                                            {
                                              'additionalProperties': false,
                                              'properties': {
                                                'command': {
                                                  'description':
                                                    'Command to run inside the container to determine if its healthy',
                                                  'items': {
                                                    'type': 'string',
                                                  },
                                                  'type': 'array',
                                                },
                                                'failure_threshold': {
                                                  'default': 3,
                                                  'description':
                                                    'Number of times the probe will tolerate failure before giving up. Giving up in the case of liveness probe means restarting the container.',
                                                  'minimum': 1,
                                                  'type': 'number',
                                                },
                                                'initial_delay': {
                                                  'default': 0,
                                                  'description':
                                                    'Number of seconds after the container starts before the probe is initiated.',
                                                  'minimum': 0,
                                                  'type': 'number',
                                                },
                                                'interval': {
                                                  'default': 10,
                                                  'description': 'How often (in seconds) to perform the probe.',
                                                  'minimum': 1,
                                                  'type': 'number',
                                                },
                                                'success_threshold': {
                                                  'default': 1,
                                                  'description':
                                                    'Minimum consecutive successes for the probe to be considered successful after having failed.',
                                                  'minimum': 1,
                                                  'type': 'number',
                                                },
                                                'timeout': {
                                                  'default': 1,
                                                  'description': 'Number of seconds after which the probe times out',
                                                  'minimum': 1,
                                                  'type': 'number',
                                                },
                                                'type': {
                                                  'const': 'exec',
                                                  'type': 'string',
                                                },
                                              },
                                              'required': [
                                                'command',
                                                'type',
                                              ],
                                              'type': 'object',
                                            },
                                            {
                                              'additionalProperties': false,
                                              'properties': {
                                                'failure_threshold': {
                                                  'default': 3,
                                                  'description':
                                                    'Number of times the probe will tolerate failure before giving up. Giving up in the case of liveness probe means restarting the container.',
                                                  'minimum': 1,
                                                  'type': 'number',
                                                },
                                                'headers': {
                                                  'description': 'Custom headers to set in the request.',
                                                  'items': {
                                                    'additionalProperties': false,
                                                    'properties': {
                                                      'name': {
                                                        'type': 'string',
                                                      },
                                                      'value': {
                                                        'type': 'string',
                                                      },
                                                    },
                                                    'required': [
                                                      'name',
                                                      'value',
                                                    ],
                                                    'type': 'object',
                                                  },
                                                  'type': 'array',
                                                },
                                                'initial_delay': {
                                                  'default': 0,
                                                  'description':
                                                    'Number of seconds after the container starts before the probe is initiated.',
                                                  'minimum': 0,
                                                  'type': 'number',
                                                },
                                                'interval': {
                                                  'default': 10,
                                                  'description': 'How often (in seconds) to perform the probe.',
                                                  'minimum': 1,
                                                  'type': 'number',
                                                },
                                                'path': {
                                                  'default': '/',
                                                  'description': 'Path to access on the http server',
                                                  'type': 'string',
                                                },
                                                'port': {
                                                  'description': 'Port to access on the container',
                                                  'type': 'number',
                                                },
                                                'scheme': {
                                                  'default': 'http',
                                                  'description':
                                                    'Scheme to use for connecting to the host (http or https).',
                                                  'type': 'string',
                                                },
                                                'success_threshold': {
                                                  'default': 1,
                                                  'description':
                                                    'Minimum consecutive successes for the probe to be considered successful after having failed.',
                                                  'minimum': 1,
                                                  'type': 'number',
                                                },
                                                'timeout': {
                                                  'default': 1,
                                                  'description': 'Number of seconds after which the probe times out',
                                                  'minimum': 1,
                                                  'type': 'number',
                                                },
                                                'type': {
                                                  'const': 'http',
                                                  'type': 'string',
                                                },
                                              },
                                              'required': [
                                                'type',
                                              ],
                                              'type': 'object',
                                            },
                                          ],
                                        },
                                      },
                                      'type': 'object',
                                    },
                                    'volume_mounts': {
                                      'description': 'A set of volumes to mount to the container',
                                      'items': {
                                        'additionalProperties': false,
                                        'properties': {
                                          'local_image': {
                                            'type': 'string',
                                          },
                                          'mount_path': {
                                            'type': 'string',
                                          },
                                          'readonly': {
                                            'type': 'boolean',
                                          },
                                          'remote_image': {
                                            'type': 'string',
                                          },
                                          'volume': {
                                            'type': 'string',
                                          },
                                        },
                                        'required': [
                                          'volume',
                                          'mount_path',
                                          'readonly',
                                        ],
                                        'type': 'object',
                                      },
                                      'type': 'array',
                                    },
                                  },
                                  'required': [
                                    'image',
                                    'volume_mounts',
                                  ],
                                  'type': 'object',
                                },
                                'type': 'array',
                              },
                              'type': {
                                'const': 'deployment',
                                'type': 'string',
                              },
                              'volume_mounts': {
                                'description': 'A set of volumes to mount to the container',
                                'items': {
                                  'additionalProperties': false,
                                  'properties': {
                                    'local_image': {
                                      'type': 'string',
                                    },
                                    'mount_path': {
                                      'type': 'string',
                                    },
                                    'readonly': {
                                      'type': 'boolean',
                                    },
                                    'remote_image': {
                                      'type': 'string',
                                    },
                                    'volume': {
                                      'type': 'string',
                                    },
                                  },
                                  'required': [
                                    'volume',
                                    'mount_path',
                                    'readonly',
                                  ],
                                  'type': 'object',
                                },
                                'type': 'array',
                              },
                            },
                            'required': [
                              'account',
                              'image',
                              'name',
                              'type',
                              'volume_mounts',
                            ],
                            'type': 'object',
                          },
                        },
                        {
                          'if': {
                            'properties': {
                              'type': {
                                'const': 'dnsRecord',
                                'type': 'string',
                              },
                            },
                          },
                          'then': {
                            'additionalProperties': false,
                            'properties': {
                              'account': {
                                'type': 'string',
                              },
                              'content': {
                                'type': 'string',
                              },
                              'dnsZone': {
                                'type': 'string',
                              },
                              'recordType': {
                                'type': 'string',
                              },
                              'subdomain': {
                                'type': 'string',
                              },
                              'ttl': {
                                'type': 'number',
                              },
                              'type': {
                                'const': 'dnsRecord',
                                'type': 'string',
                              },
                            },
                            'required': [
                              'account',
                              'content',
                              'dnsZone',
                              'recordType',
                              'subdomain',
                              'type',
                            ],
                            'type': 'object',
                          },
                        },
                        {
                          'if': {
                            'properties': {
                              'type': {
                                'const': 'dnsZone',
                                'type': 'string',
                              },
                            },
                          },
                          'then': {
                            'additionalProperties': false,
                            'properties': {
                              'account': {
                                'type': 'string',
                              },
                              'name': {
                                'type': 'string',
                              },
                              'type': {
                                'const': 'dnsZone',
                                'type': 'string',
                              },
                            },
                            'required': [
                              'account',
                              'name',
                              'type',
                            ],
                            'type': 'object',
                          },
                        },
                        {
                          'if': {
                            'properties': {
                              'type': {
                                'const': 'dockerBuild',
                                'type': 'string',
                              },
                            },
                          },
                          'then': {
                            'additionalProperties': false,
                            'properties': {
                              'account': {
                                'type': 'string',
                              },
                              'args': {
                                'additionalProperties': {
                                  'type': 'string',
                                },
                                'default': {},
                                'description': 'Arguments to pass to the build command',
                                'type': 'object',
                              },
                              'component_source': {
                                'description': 'Source of the component that contains the build context',
                                'type': 'string',
                              },
                              'context': {
                                'description': 'Docker build context relative to the component root',
                                'type': 'string',
                              },
                              'dockerfile': {
                                'default': 'Dockerfile',
                                'description': 'Path to the dockerfile relative to the context',
                                'type': 'string',
                              },
                              'registry': {
                                'default': 'registry.architect.io',
                                'description': 'Registry the artifact will be pushed to',
                                'type': 'string',
                              },
                              'repository': {
                                'description': 'The repository to push the artifact to',
                                'type': 'string',
                              },
                              'tag': {
                                'default': 'latest',
                                'description': 'Tag to assign to the image',
                                'type': 'string',
                              },
                              'target': {
                                'description': 'Name of a intermediate build stage to target',
                                'type': 'string',
                              },
                              'type': {
                                'const': 'dockerBuild',
                                'type': 'string',
                              },
                            },
                            'required': [
                              'account',
                              'component_source',
                              'context',
                              'repository',
                              'type',
                            ],
                            'type': 'object',
                          },
                        },
                        {
                          'if': {
                            'properties': {
                              'type': {
                                'const': 'helmChart',
                                'type': 'string',
                              },
                            },
                          },
                          'then': {
                            'additionalProperties': false,
                            'properties': {
                              'account': {
                                'type': 'string',
                              },
                              'chart': {
                                'description': 'Chart to be installed',
                                'type': 'string',
                              },
                              'name': {
                                'description': 'Name of the helm release',
                                'type': 'string',
                              },
                              'namespace': {
                                'default': 'default',
                                'description': 'The namespace to install the release in',
                                'type': 'string',
                              },
                              'repository': {
                                'description': 'The URL of the repository where the chart lives',
                                'type': 'string',
                              },
                              'type': {
                                'const': 'helmChart',
                                'type': 'string',
                              },
                              'values': {
                                'description': 'Values to pass to the helm chart release',
                                'type': 'object',
                              },
                              'version': {
                                'description': 'The exact chart version to install. Otherwise will use the latest.',
                                'type': 'string',
                              },
                            },
                            'required': [
                              'account',
                              'chart',
                              'name',
                              'repository',
                              'type',
                            ],
                            'type': 'object',
                          },
                        },
                        {
                          'if': {
                            'properties': {
                              'type': {
                                'const': 'ingressRule',
                                'type': 'string',
                              },
                            },
                          },
                          'then': {
                            'additionalProperties': false,
                            'properties': {
                              'account': {
                                'type': 'string',
                              },
                              'dnsZone': {
                                'description': 'The DNS zone (aka base URL) that the ingress rule listens on',
                                'type': 'string',
                              },
                              'headers': {
                                'additionalProperties': {
                                  'type': 'string',
                                },
                                'description': 'Headers to include in responses',
                                'type': 'object',
                              },
                              'internal': {
                                'default': false,
                                'description':
                                  'Whether or not this should be fulfilled by an internal load balancer (e.g. no public IP)',
                                'type': 'boolean',
                              },
                              'name': {
                                'description': 'Name to give to the ingress rule resource',
                                'type': 'string',
                              },
                              'namespace': {
                                'description': 'Namespace to put the ingress rule in',
                                'type': 'string',
                              },
                              'password': {
                                'description': 'Basic auth password',
                                'type': 'string',
                              },
                              'path': {
                                'default': '/',
                                'description': 'The path the ingress rule listens on',
                                'type': 'string',
                              },
                              'port': {
                                'description': 'Port that the ingress rule listens for traffic on',
                                'type': [
                                  'string',
                                  'number',
                                ],
                              },
                              'protocol': {
                                'default': 'http',
                                'description': 'The protocol the ingress rule listens for traffic on',
                                'type': 'string',
                              },
                              'registry': {
                                'description': 'Unique ID of the service registry this rule will be stored in',
                                'type': 'string',
                              },
                              'service': {
                                'description': 'Service the ingress forwards traffic to',
                                'type': 'string',
                              },
                              'subdomain': {
                                'description': 'The subdomain the ingress rule listens on',
                                'type': 'string',
                              },
                              'type': {
                                'const': 'ingressRule',
                                'type': 'string',
                              },
                              'username': {
                                'description': 'Basic auth username',
                                'type': 'string',
                              },
                            },
                            'required': [
                              'account',
                              'name',
                              'port',
                              'registry',
                              'service',
                              'type',
                            ],
                            'type': 'object',
                          },
                        },
                        {
                          'if': {
                            'properties': {
                              'type': {
                                'const': 'kubernetesCluster',
                                'type': 'string',
                              },
                            },
                          },
                          'then': {
                            'additionalProperties': false,
                            'properties': {
                              'account': {
                                'type': 'string',
                              },
                              'description': {
                                'description': 'Description of the cluster',
                                'type': 'string',
                              },
                              'kubernetesVersion': {
                                'description': 'Version of the kubernetes control plane to use',
                                'type': 'string',
                              },
                              'name': {
                                'description': 'Name of the cluster',
                                'type': 'string',
                              },
                              'nodePools': {
                                'description': 'Node pools',
                                'items': {
                                  'additionalProperties': false,
                                  'properties': {
                                    'count': {
                                      'description': 'Number of nodes the pool should have',
                                      'minimum': 1,
                                      'type': 'number',
                                    },
                                    'name': {
                                      'description': 'Name of the node pool',
                                      'type': 'string',
                                    },
                                    'nodeSize': {
                                      'description': 'Size of each node in the pool',
                                      'type': 'string',
                                    },
                                  },
                                  'required': [
                                    'name',
                                    'count',
                                    'nodeSize',
                                  ],
                                  'type': 'object',
                                },
                                'minimum': 1,
                                'type': 'array',
                              },
                              'region': {
                                'description': 'Region the cluster should live in',
                                'type': 'string',
                              },
                              'type': {
                                'const': 'kubernetesCluster',
                                'type': 'string',
                              },
                              'vpc': {
                                'description': 'VPC the cluster should live in',
                                'type': 'string',
                              },
                            },
                            'required': [
                              'account',
                              'kubernetesVersion',
                              'name',
                              'nodePools',
                              'region',
                              'type',
                              'vpc',
                            ],
                            'type': 'object',
                          },
                        },
                        {
                          'if': {
                            'properties': {
                              'type': {
                                'properties': {},
                                'type': 'object',
                              },
                            },
                          },
                          'then': {
                            'additionalProperties': {},
                            'properties': {
                              'account': {
                                'type': 'string',
                              },
                              'type': {
                                'const': 'kubernetesVersion',
                                'type': 'string',
                              },
                            },
                            'required': [
                              'account',
                              'type',
                            ],
                            'type': 'object',
                          },
                        },
                        {
                          'if': {
                            'properties': {
                              'type': {
                                'const': 'namespace',
                                'type': 'string',
                              },
                            },
                          },
                          'then': {
                            'additionalProperties': false,
                            'properties': {
                              'account': {
                                'type': 'string',
                              },
                              'name': {
                                'type': 'string',
                              },
                              'type': {
                                'const': 'namespace',
                                'type': 'string',
                              },
                            },
                            'required': [
                              'account',
                              'name',
                              'type',
                            ],
                            'type': 'object',
                          },
                        },
                        {
                          'if': {
                            'properties': {
                              'type': {
                                'properties': {},
                                'type': 'object',
                              },
                            },
                          },
                          'then': {
                            'additionalProperties': {},
                            'properties': {
                              'account': {
                                'type': 'string',
                              },
                              'type': {
                                'const': 'node',
                                'type': 'string',
                              },
                            },
                            'required': [
                              'account',
                              'type',
                            ],
                            'type': 'object',
                          },
                        },
                        {
                          'if': {
                            'properties': {
                              'type': {
                                'properties': {},
                                'type': 'object',
                              },
                            },
                          },
                          'then': {
                            'additionalProperties': {},
                            'properties': {
                              'account': {
                                'type': 'string',
                              },
                              'type': {
                                'const': 'nodeSize',
                                'type': 'string',
                              },
                            },
                            'required': [
                              'account',
                              'type',
                            ],
                            'type': 'object',
                          },
                        },
                        {
                          'if': {
                            'properties': {
                              'type': {
                                'properties': {},
                                'type': 'object',
                              },
                            },
                          },
                          'then': {
                            'additionalProperties': {},
                            'properties': {
                              'account': {
                                'type': 'string',
                              },
                              'type': {
                                'const': 'region',
                                'type': 'string',
                              },
                            },
                            'required': [
                              'account',
                              'type',
                            ],
                            'type': 'object',
                          },
                        },
                        {
                          'if': {
                            'properties': {
                              'type': {
                                'const': 'secret',
                                'type': 'string',
                              },
                            },
                          },
                          'then': {
                            'additionalProperties': false,
                            'properties': {
                              'account': {
                                'type': 'string',
                              },
                              'data': {
                                'description': 'Data to populate the secret with',
                                'type': 'string',
                              },
                              'merge': {
                                'default': false,
                                'description':
                                  'Whether or not to merge the input data from multiple sources into an array of values',
                                'type': 'boolean',
                              },
                              'name': {
                                'description': 'Name for the secret',
                                'type': 'string',
                              },
                              'namespace': {
                                'description': 'Namespace the secret should be place in',
                                'type': 'string',
                              },
                              'required': {
                                'default': false,
                                'description': 'Whether or not the secret is required',
                                'type': 'boolean',
                              },
                              'sensitive': {
                                'default': false,
                                'description':
                                  'Whether or not the data is to be considered sensitive and stripped from logs',
                                'type': 'boolean',
                              },
                              'type': {
                                'const': 'secret',
                                'type': 'string',
                              },
                            },
                            'required': [
                              'account',
                              'data',
                              'name',
                              'type',
                            ],
                            'type': 'object',
                          },
                        },
                        {
                          'if': {
                            'properties': {
                              'type': {
                                'const': 'service',
                                'type': 'string',
                              },
                            },
                          },
                          'then': {
                            'additionalProperties': false,
                            'properties': {
                              'account': {
                                'type': 'string',
                              },
                              'dnsZone': {
                                'description': 'Optional DNS zone to use for listeners',
                                'type': 'string',
                              },
                              'external_hostname': {
                                'description': 'External address to point to',
                                'type': 'string',
                              },
                              'labels': {
                                'additionalProperties': {
                                  'type': 'string',
                                },
                                'description': 'Resource labels',
                                'type': 'object',
                              },
                              'name': {
                                'description': 'Hostname to listen on',
                                'type': 'string',
                              },
                              'namespace': {
                                'description': 'Resource namespace',
                                'type': 'string',
                              },
                              'password': {
                                'description': 'Basic auth password',
                                'type': 'string',
                              },
                              'port': {
                                'description': 'Port to listen on',
                                'type': 'number',
                              },
                              'target_deployment': {
                                'description': 'Target deployment name',
                                'type': 'string',
                              },
                              'target_port': {
                                'description': 'Target port',
                                'type': 'number',
                              },
                              'target_protocol': {
                                'default': 'http',
                                'description': 'Protocol',
                                'type': 'string',
                              },
                              'type': {
                                'const': 'service',
                                'type': 'string',
                              },
                              'username': {
                                'description': 'Basic auth username',
                                'type': 'string',
                              },
                            },
                            'required': [
                              'account',
                              'name',
                              'target_deployment',
                              'target_port',
                              'type',
                            ],
                            'type': 'object',
                          },
                        },
                        {
                          'if': {
                            'properties': {
                              'type': {
                                'const': 'task',
                                'type': 'string',
                              },
                            },
                          },
                          'then': {
                            'additionalProperties': false,
                            'properties': {
                              'account': {
                                'type': 'string',
                              },
                              'command': {
                                'anyOf': [
                                  {
                                    'type': 'string',
                                  },
                                  {
                                    'items': {
                                      'type': 'string',
                                    },
                                    'type': 'array',
                                  },
                                ],
                              },
                              'cpu': {
                                'type': 'number',
                              },
                              'entrypoint': {
                                'anyOf': [
                                  {
                                    'type': 'string',
                                  },
                                  {
                                    'items': {
                                      'type': 'string',
                                    },
                                    'type': 'array',
                                  },
                                ],
                              },
                              'environment': {
                                'additionalProperties': {
                                  'type': 'string',
                                },
                                'type': 'object',
                              },
                              'image': {
                                'type': 'string',
                              },
                              'labels': {
                                'additionalProperties': {
                                  'type': 'string',
                                },
                                'type': 'object',
                              },
                              'memory': {
                                'type': 'string',
                              },
                              'namespace': {
                                'type': 'string',
                              },
                              'sidecars': {
                                'items': {
                                  'additionalProperties': false,
                                  'properties': {
                                    'command': {
                                      'anyOf': [
                                        {
                                          'type': 'string',
                                        },
                                        {
                                          'items': {
                                            'type': 'string',
                                          },
                                          'type': 'array',
                                        },
                                      ],
                                    },
                                    'cpu': {
                                      'type': 'number',
                                    },
                                    'entrypoint': {
                                      'anyOf': [
                                        {
                                          'type': 'string',
                                        },
                                        {
                                          'items': {
                                            'type': 'string',
                                          },
                                          'type': 'array',
                                        },
                                      ],
                                    },
                                    'environment': {
                                      'additionalProperties': {
                                        'type': 'string',
                                      },
                                      'type': 'object',
                                    },
                                    'image': {
                                      'type': 'string',
                                    },
                                    'memory': {
                                      'type': 'string',
                                    },
                                    'volume_mounts': {
                                      'items': {
                                        'additionalProperties': false,
                                        'properties': {
                                          'mount_path': {
                                            'type': 'string',
                                          },
                                          'readonly': {
                                            'type': 'boolean',
                                          },
                                          'volume': {
                                            'type': 'string',
                                          },
                                        },
                                        'required': [
                                          'volume',
                                          'mount_path',
                                        ],
                                        'type': 'object',
                                      },
                                      'type': 'array',
                                    },
                                  },
                                  'required': [
                                    'image',
                                  ],
                                  'type': 'object',
                                },
                                'type': 'array',
                              },
                              'type': {
                                'const': 'task',
                                'type': 'string',
                              },
                              'volume_mounts': {
                                'items': {
                                  'additionalProperties': false,
                                  'properties': {
                                    'mount_path': {
                                      'type': 'string',
                                    },
                                    'readonly': {
                                      'type': 'boolean',
                                    },
                                    'volume': {
                                      'type': 'string',
                                    },
                                  },
                                  'required': [
                                    'volume',
                                    'mount_path',
                                  ],
                                  'type': 'object',
                                },
                                'type': 'array',
                              },
                            },
                            'required': [
                              'account',
                              'image',
                              'type',
                            ],
                            'type': 'object',
                          },
                        },
                        {
                          'if': {
                            'properties': {
                              'type': {
                                'const': 'volume',
                                'type': 'string',
                              },
                            },
                          },
                          'then': {
                            'additionalProperties': false,
                            'properties': {
                              'account': {
                                'type': 'string',
                              },
                              'hostPath': {
                                'description': 'Path on the host machine to mount the volume to',
                                'type': 'string',
                              },
                              'name': {
                                'description': 'Name to give to the volume resource',
                                'type': 'string',
                              },
                              'type': {
                                'const': 'volume',
                                'type': 'string',
                              },
                            },
                            'required': [
                              'account',
                              'name',
                              'type',
                            ],
                            'type': 'object',
                          },
                        },
                        {
                          'if': {
                            'properties': {
                              'type': {
                                'const': 'vpc',
                                'type': 'string',
                              },
                            },
                          },
                          'then': {
                            'additionalProperties': false,
                            'properties': {
                              'account': {
                                'type': 'string',
                              },
                              'description': {
                                'description': 'Description for the VPC',
                                'type': 'string',
                              },
                              'name': {
                                'description': 'Name of the VPC',
                                'type': 'string',
                              },
                              'region': {
                                'description': 'Region the VPC exists in',
                                'type': 'string',
                              },
                              'type': {
                                'const': 'vpc',
                                'type': 'string',
                              },
                            },
                            'required': [
                              'account',
                              'name',
                              'region',
                              'type',
                            ],
                            'type': 'object',
                          },
                        },
                      ],
                      'properties': {
                        'type': {
                          'enum': [
                            'arcctlAccount',
                            'cronjob',
                            'database',
                            'databaseSchema',
                            'databaseUser',
                            'databaseVersion',
                            'deployment',
                            'dnsRecord',
                            'dnsZone',
                            'dockerBuild',
                            'helmChart',
                            'ingressRule',
                            'kubernetesCluster',
                            'namespace',
                            'secret',
                            'service',
                            'task',
                            'volume',
                            'vpc',
                          ],
                        },
                      },
                      'required': [
                        'type',
                      ],
                      'type': 'object',
                    },
                    'type': 'object',
                  },
                  'when': {
                    'additionalProperties': false,
                    'properties': {
                      'account': {
                        'type': 'string',
                      },
                      'args': {
                        'additionalProperties': false,
                        'type': 'object',
                      },
                      'autoscaling': {
                        'additionalProperties': false,
                        'properties': {
                          'max_replicas': {
                            'type': 'number',
                          },
                          'min_replicas': {
                            'type': 'number',
                          },
                        },
                        'type': 'object',
                      },
                      'chart': {
                        'anyOf': [
                          {
                            'additionalProperties': false,
                            'type': 'object',
                          },
                          {
                            'description': 'Chart to be installed',
                            'type': 'string',
                          },
                        ],
                      },
                      'command': {
                        'anyOf': [
                          {
                            'additionalProperties': false,
                            'type': 'object',
                          },
                          {
                            'type': 'string',
                          },
                        ],
                      },
                      'component_source': {
                        'anyOf': [
                          {
                            'additionalProperties': false,
                            'type': 'object',
                          },
                          {
                            'description': 'Source of the component that contains the build context',
                            'type': 'string',
                          },
                        ],
                      },
                      'content': {
                        'anyOf': [
                          {
                            'additionalProperties': false,
                            'type': 'object',
                          },
                          {
                            'type': 'string',
                          },
                        ],
                      },
                      'context': {
                        'anyOf': [
                          {
                            'additionalProperties': false,
                            'type': 'object',
                          },
                          {
                            'description': 'Docker build context relative to the component root',
                            'type': 'string',
                          },
                        ],
                      },
                      'cpu': {
                        'anyOf': [
                          {
                            'additionalProperties': false,
                            'type': 'object',
                          },
                          {
                            'type': 'number',
                          },
                          {
                            'description': 'Number of CPUs to allocate to the container',
                            'minimum': 0.1,
                            'type': 'number',
                          },
                        ],
                      },
                      'credentials': {
                        'additionalProperties': false,
                        'type': 'object',
                      },
                      'data': {
                        'anyOf': [
                          {
                            'additionalProperties': false,
                            'type': 'object',
                          },
                          {
                            'description': 'Data to populate the secret with',
                            'type': 'string',
                          },
                        ],
                      },
                      'database': {
                        'anyOf': [
                          {
                            'additionalProperties': false,
                            'type': 'object',
                          },
                          {
                            'description': 'Unique ID of the database backing this schema',
                            'type': 'string',
                          },
                        ],
                      },
                      'databaseSchema': {
                        'anyOf': [
                          {
                            'additionalProperties': false,
                            'type': 'object',
                          },
                          {
                            'description': 'The schema the user should have access to',
                            'type': 'string',
                          },
                        ],
                      },
                      'databaseSize': {
                        'anyOf': [
                          {
                            'additionalProperties': false,
                            'type': 'object',
                          },
                          {
                            'description': 'Size of the database instance to create',
                            'type': 'string',
                          },
                        ],
                      },
                      'databaseType': {
                        'anyOf': [
                          {
                            'additionalProperties': false,
                            'type': 'object',
                          },
                          {
                            'description': 'The type of database engine to use',
                            'type': 'string',
                          },
                          {
                            'description': 'Type of database required by the schema',
                            'type': 'string',
                          },
                          {
                            'type': 'string',
                          },
                        ],
                      },
                      'databaseVersion': {
                        'anyOf': [
                          {
                            'additionalProperties': false,
                            'type': 'object',
                          },
                          {
                            'description': 'Refers to the unique ID of a `databaseVersion` response',
                            'type': 'string',
                          },
                          {
                            'description': 'Version of the database type the schema creation process expects',
                            'type': 'string',
                          },
                        ],
                      },
                      'description': {
                        'anyOf': [
                          {
                            'additionalProperties': false,
                            'type': 'object',
                          },
                          {
                            'description': 'Human-readable description of the database',
                            'type': 'string',
                          },
                          {
                            'description': 'Description of the cluster',
                            'type': 'string',
                          },
                          {
                            'description': 'Description for the VPC',
                            'type': 'string',
                          },
                        ],
                      },
                      'dnsZone': {
                        'anyOf': [
                          {
                            'additionalProperties': false,
                            'type': 'object',
                          },
                          {
                            'type': 'string',
                          },
                          {
                            'description': 'The DNS zone (aka base URL) that the ingress rule listens on',
                            'type': 'string',
                          },
                          {
                            'description': 'Optional DNS zone to use for listeners',
                            'type': 'string',
                          },
                        ],
                      },
                      'dockerfile': {
                        'anyOf': [
                          {
                            'additionalProperties': false,
                            'type': 'object',
                          },
                          {
                            'default': 'Dockerfile',
                            'description': 'Path to the dockerfile relative to the context',
                            'type': 'string',
                          },
                        ],
                      },
                      'entrypoint': {
                        'anyOf': [
                          {
                            'additionalProperties': false,
                            'type': 'object',
                          },
                          {
                            'type': 'string',
                          },
                        ],
                      },
                      'environment': {
                        'additionalProperties': false,
                        'type': 'object',
                      },
                      'exposed_ports': {
                        'additionalProperties': false,
                        'type': 'object',
                      },
                      'external_hostname': {
                        'anyOf': [
                          {
                            'additionalProperties': false,
                            'type': 'object',
                          },
                          {
                            'description': 'External address to point to',
                            'type': 'string',
                          },
                        ],
                      },
                      'headers': {
                        'additionalProperties': false,
                        'type': 'object',
                      },
                      'hostPath': {
                        'anyOf': [
                          {
                            'additionalProperties': false,
                            'type': 'object',
                          },
                          {
                            'description': 'Path on the host machine to mount the volume to',
                            'type': 'string',
                          },
                        ],
                      },
                      'image': {
                        'anyOf': [
                          {
                            'additionalProperties': false,
                            'type': 'object',
                          },
                          {
                            'type': 'string',
                          },
                          {
                            'description': 'Image the container runs from',
                            'type': 'string',
                          },
                        ],
                      },
                      'internal': {
                        'anyOf': [
                          {
                            'additionalProperties': false,
                            'type': 'object',
                          },
                          {
                            'default': false,
                            'description':
                              'Whether or not this should be fulfilled by an internal load balancer (e.g. no public IP)',
                            'type': 'boolean',
                          },
                        ],
                      },
                      'kubernetesVersion': {
                        'anyOf': [
                          {
                            'additionalProperties': false,
                            'type': 'object',
                          },
                          {
                            'description': 'Version of the kubernetes control plane to use',
                            'type': 'string',
                          },
                        ],
                      },
                      'labels': {
                        'additionalProperties': false,
                        'type': 'object',
                      },
                      'memory': {
                        'anyOf': [
                          {
                            'additionalProperties': false,
                            'type': 'object',
                          },
                          {
                            'type': 'string',
                          },
                          {
                            'description': 'Amount of memory to allocate to the container',
                            'type': 'string',
                          },
                        ],
                      },
                      'merge': {
                        'anyOf': [
                          {
                            'additionalProperties': false,
                            'type': 'object',
                          },
                          {
                            'default': false,
                            'description':
                              'Whether or not to merge the input data from multiple sources into an array of values',
                            'type': 'boolean',
                          },
                        ],
                      },
                      'name': {
                        'anyOf': [
                          {
                            'additionalProperties': false,
                            'type': 'object',
                          },
                          {
                            'description': 'Name of the new account',
                            'type': 'string',
                          },
                          {
                            'description': 'Unique name for the database',
                            'type': 'string',
                          },
                          {
                            'description': 'Name to give to the new schema',
                            'type': 'string',
                          },
                          {
                            'description': 'Deployment name',
                            'type': 'string',
                          },
                          {
                            'type': 'string',
                          },
                          {
                            'description': 'Name of the helm release',
                            'type': 'string',
                          },
                          {
                            'description': 'Name to give to the ingress rule resource',
                            'type': 'string',
                          },
                          {
                            'description': 'Name of the cluster',
                            'type': 'string',
                          },
                          {
                            'description': 'Name for the secret',
                            'type': 'string',
                          },
                          {
                            'description': 'Hostname to listen on',
                            'type': 'string',
                          },
                          {
                            'description': 'Name to give to the volume resource',
                            'type': 'string',
                          },
                          {
                            'description': 'Name of the VPC',
                            'type': 'string',
                          },
                        ],
                      },
                      'namespace': {
                        'anyOf': [
                          {
                            'additionalProperties': false,
                            'type': 'object',
                          },
                          {
                            'type': 'string',
                          },
                          {
                            'description': 'Namespace the deployment should be in',
                            'type': 'string',
                          },
                          {
                            'default': 'default',
                            'description': 'The namespace to install the release in',
                            'type': 'string',
                          },
                          {
                            'description': 'Namespace to put the ingress rule in',
                            'type': 'string',
                          },
                          {
                            'description': 'Namespace the secret should be place in',
                            'type': 'string',
                          },
                          {
                            'description': 'Resource namespace',
                            'type': 'string',
                          },
                        ],
                      },
                      'nodePools': {
                        'additionalProperties': false,
                        'type': 'object',
                      },
                      'password': {
                        'anyOf': [
                          {
                            'additionalProperties': false,
                            'type': 'object',
                          },
                          {
                            'description': 'Basic auth password',
                            'type': 'string',
                          },
                        ],
                      },
                      'path': {
                        'anyOf': [
                          {
                            'additionalProperties': false,
                            'type': 'object',
                          },
                          {
                            'default': '/',
                            'description': 'The path the ingress rule listens on',
                            'type': 'string',
                          },
                        ],
                      },
                      'platform': {
                        'anyOf': [
                          {
                            'additionalProperties': false,
                            'type': 'object',
                          },
                          {
                            'type': 'string',
                          },
                          {
                            'description': 'Target platform the deployment will run on',
                            'type': 'string',
                          },
                        ],
                      },
                      'port': {
                        'anyOf': [
                          {
                            'additionalProperties': false,
                            'type': 'object',
                          },
                          {
                            'description': 'Port that the ingress rule listens for traffic on',
                            'type': [
                              'string',
                              'number',
                            ],
                          },
                          {
                            'description': 'Port to listen on',
                            'type': 'number',
                          },
                        ],
                      },
                      'probes': {
                        'additionalProperties': false,
                        'properties': {
                          'liveness': {
                            'additionalProperties': false,
                            'properties': {
                              'command': {
                                'items': {
                                  'type': 'string',
                                },
                                'type': 'array',
                              },
                              'failure_threshold': {
                                'type': 'number',
                              },
                              'headers': {
                                'items': {
                                  'additionalProperties': false,
                                  'properties': {
                                    'name': {
                                      'type': 'string',
                                    },
                                    'value': {
                                      'type': 'string',
                                    },
                                  },
                                  'type': 'object',
                                },
                                'type': 'array',
                              },
                              'initial_delay': {
                                'type': 'number',
                              },
                              'interval': {
                                'type': 'number',
                              },
                              'path': {
                                'type': 'string',
                              },
                              'port': {
                                'type': 'number',
                              },
                              'scheme': {
                                'type': 'string',
                              },
                              'success_threshold': {
                                'type': 'number',
                              },
                              'timeout': {
                                'type': 'number',
                              },
                              'type': {
                                'enum': [
                                  'exec',
                                  'http',
                                ],
                                'type': 'string',
                              },
                            },
                            'type': 'object',
                          },
                        },
                        'type': 'object',
                      },
                      'protocol': {
                        'anyOf': [
                          {
                            'additionalProperties': false,
                            'type': 'object',
                          },
                          {
                            'default': 'http',
                            'description': 'The protocol the ingress rule listens for traffic on',
                            'type': 'string',
                          },
                        ],
                      },
                      'provider': {
                        'anyOf': [
                          {
                            'additionalProperties': false,
                            'type': 'object',
                          },
                          {
                            'description': 'Cloud provider the account connects to',
                            'type': 'string',
                          },
                        ],
                      },
                      'recordType': {
                        'anyOf': [
                          {
                            'additionalProperties': false,
                            'type': 'object',
                          },
                          {
                            'type': 'string',
                          },
                        ],
                      },
                      'region': {
                        'anyOf': [
                          {
                            'additionalProperties': false,
                            'type': 'object',
                          },
                          {
                            'description': 'Unique ID of the region to run the database in',
                            'type': 'string',
                          },
                          {
                            'description': 'Region the cluster should live in',
                            'type': 'string',
                          },
                          {
                            'description': 'Region the VPC exists in',
                            'type': 'string',
                          },
                        ],
                      },
                      'registry': {
                        'anyOf': [
                          {
                            'additionalProperties': false,
                            'type': 'object',
                          },
                          {
                            'default': 'registry.architect.io',
                            'description': 'Registry the artifact will be pushed to',
                            'type': 'string',
                          },
                          {
                            'description': 'Unique ID of the service registry this rule will be stored in',
                            'type': 'string',
                          },
                        ],
                      },
                      'replicas': {
                        'anyOf': [
                          {
                            'additionalProperties': false,
                            'type': 'object',
                          },
                          {
                            'default': 1,
                            'description': 'Number of replicas of the deployment to run',
                            'type': 'number',
                          },
                        ],
                      },
                      'repository': {
                        'anyOf': [
                          {
                            'additionalProperties': false,
                            'type': 'object',
                          },
                          {
                            'description': 'The repository to push the artifact to',
                            'type': 'string',
                          },
                          {
                            'description': 'The URL of the repository where the chart lives',
                            'type': 'string',
                          },
                        ],
                      },
                      'required': {
                        'anyOf': [
                          {
                            'additionalProperties': false,
                            'type': 'object',
                          },
                          {
                            'default': false,
                            'description': 'Whether or not the secret is required',
                            'type': 'boolean',
                          },
                        ],
                      },
                      'schedule': {
                        'anyOf': [
                          {
                            'additionalProperties': false,
                            'type': 'object',
                          },
                          {
                            'type': 'string',
                          },
                        ],
                      },
                      'sensitive': {
                        'anyOf': [
                          {
                            'additionalProperties': false,
                            'type': 'object',
                          },
                          {
                            'default': false,
                            'description':
                              'Whether or not the data is to be considered sensitive and stripped from logs',
                            'type': 'boolean',
                          },
                        ],
                      },
                      'service': {
                        'anyOf': [
                          {
                            'additionalProperties': false,
                            'type': 'object',
                          },
                          {
                            'description': 'Service the ingress forwards traffic to',
                            'type': 'string',
                          },
                        ],
                      },
                      'services': {
                        'additionalProperties': false,
                        'type': 'object',
                      },
                      'sidecars': {
                        'additionalProperties': false,
                        'type': 'object',
                      },
                      'subdomain': {
                        'anyOf': [
                          {
                            'additionalProperties': false,
                            'type': 'object',
                          },
                          {
                            'type': 'string',
                          },
                          {
                            'description': 'The subdomain the ingress rule listens on',
                            'type': 'string',
                          },
                        ],
                      },
                      'tag': {
                        'anyOf': [
                          {
                            'additionalProperties': false,
                            'type': 'object',
                          },
                          {
                            'default': 'latest',
                            'description': 'Tag to assign to the image',
                            'type': 'string',
                          },
                        ],
                      },
                      'target': {
                        'anyOf': [
                          {
                            'additionalProperties': false,
                            'type': 'object',
                          },
                          {
                            'description': 'Name of a intermediate build stage to target',
                            'type': 'string',
                          },
                        ],
                      },
                      'target_deployment': {
                        'anyOf': [
                          {
                            'additionalProperties': false,
                            'type': 'object',
                          },
                          {
                            'description': 'Target deployment name',
                            'type': 'string',
                          },
                        ],
                      },
                      'target_port': {
                        'anyOf': [
                          {
                            'additionalProperties': false,
                            'type': 'object',
                          },
                          {
                            'description': 'Target port',
                            'type': 'number',
                          },
                        ],
                      },
                      'target_protocol': {
                        'anyOf': [
                          {
                            'additionalProperties': false,
                            'type': 'object',
                          },
                          {
                            'default': 'http',
                            'description': 'Protocol',
                            'type': 'string',
                          },
                        ],
                      },
                      'ttl': {
                        'anyOf': [
                          {
                            'additionalProperties': false,
                            'type': 'object',
                          },
                          {
                            'type': 'number',
                          },
                        ],
                      },
                      'type': {
                        'enum': [
                          'arcctlAccount',
                          'cronjob',
                          'database',
                          'databaseSchema',
                          'databaseSize',
                          'databaseType',
                          'databaseUser',
                          'databaseVersion',
                          'deployment',
                          'dnsRecord',
                          'dnsZone',
                          'dockerBuild',
                          'helmChart',
                          'ingressRule',
                          'kubernetesCluster',
                          'kubernetesVersion',
                          'namespace',
                          'node',
                          'nodeSize',
                          'region',
                          'secret',
                          'service',
                          'task',
                          'volume',
                          'vpc',
                        ],
                        'type': 'string',
                      },
                      'username': {
                        'anyOf': [
                          {
                            'additionalProperties': false,
                            'type': 'object',
                          },
                          {
                            'description': 'Username of the user to create',
                            'type': 'string',
                          },
                          {
                            'description': 'Basic auth username',
                            'type': 'string',
                          },
                        ],
                      },
                      'values': {
                        'additionalProperties': false,
                        'type': 'object',
                      },
                      'version': {
                        'anyOf': [
                          {
                            'additionalProperties': false,
                            'type': 'object',
                          },
                          {
                            'description': 'The exact chart version to install. Otherwise will use the latest.',
                            'type': 'string',
                          },
                        ],
                      },
                      'volume_mounts': {
                        'additionalProperties': false,
                        'type': 'object',
                      },
                      'vpc': {
                        'anyOf': [
                          {
                            'additionalProperties': false,
                            'type': 'object',
                          },
                          {
                            'description': 'Unique ID of the VPC to run the database in',
                            'type': 'string',
                          },
                          {
                            'description': 'VPC the cluster should live in',
                            'type': 'string',
                          },
                        ],
                      },
                    },
                    'required': [
                      'type',
                    ],
                    'type': 'object',
                  },
                },
                'type': 'object',
              },
              'type': 'array',
            },
            'modules': {
              'additionalProperties': {
                'additionalProperties': {},
                'properties': {
                  'source': {
                    'type': 'string',
                  },
                },
                'required': [
                  'source',
                ],
                'type': 'object',
              },
              'description': 'Create terraform modules that should be applied to each environment in the datacenter',
              'type': 'object',
            },
            'resources': {
              'additionalProperties': {
                'allOf': [
                  {
                    'if': {
                      'properties': {
                        'type': {
                          'const': 'arcctlAccount',
                          'type': 'string',
                        },
                      },
                    },
                    'then': {
                      'additionalProperties': false,
                      'properties': {
                        'account': {
                          'type': 'string',
                        },
                        'credentials': {
                          'description': 'Credentials used to access the cloud provider',
                          'type': 'object',
                        },
                        'name': {
                          'description': 'Name of the new account',
                          'type': 'string',
                        },
                        'provider': {
                          'description': 'Cloud provider the account connects to',
                          'type': 'string',
                        },
                        'type': {
                          'const': 'arcctlAccount',
                          'type': 'string',
                        },
                      },
                      'required': [
                        'account',
                        'credentials',
                        'name',
                        'provider',
                        'type',
                      ],
                      'type': 'object',
                    },
                  },
                  {
                    'if': {
                      'properties': {
                        'type': {
                          'const': 'cronjob',
                          'type': 'string',
                        },
                      },
                    },
                    'then': {
                      'additionalProperties': false,
                      'properties': {
                        'account': {
                          'type': 'string',
                        },
                        'command': {
                          'anyOf': [
                            {
                              'type': 'string',
                            },
                            {
                              'items': {
                                'type': 'string',
                              },
                              'type': 'array',
                            },
                          ],
                        },
                        'cpu': {
                          'type': 'number',
                        },
                        'entrypoint': {
                          'anyOf': [
                            {
                              'type': 'string',
                            },
                            {
                              'items': {
                                'type': 'string',
                              },
                              'type': 'array',
                            },
                          ],
                        },
                        'environment': {
                          'additionalProperties': {
                            'type': 'string',
                          },
                          'type': 'object',
                        },
                        'image': {
                          'type': 'string',
                        },
                        'labels': {
                          'additionalProperties': {
                            'type': 'string',
                          },
                          'type': 'object',
                        },
                        'memory': {
                          'type': 'string',
                        },
                        'namespace': {
                          'type': 'string',
                        },
                        'platform': {
                          'type': 'string',
                        },
                        'schedule': {
                          'type': 'string',
                        },
                        'sidecars': {
                          'items': {
                            'additionalProperties': false,
                            'properties': {
                              'command': {
                                'anyOf': [
                                  {
                                    'type': 'string',
                                  },
                                  {
                                    'items': {
                                      'type': 'string',
                                    },
                                    'type': 'array',
                                  },
                                ],
                              },
                              'cpu': {
                                'type': 'number',
                              },
                              'entrypoint': {
                                'anyOf': [
                                  {
                                    'type': 'string',
                                  },
                                  {
                                    'items': {
                                      'type': 'string',
                                    },
                                    'type': 'array',
                                  },
                                ],
                              },
                              'environment': {
                                'additionalProperties': {
                                  'type': 'string',
                                },
                                'type': 'object',
                              },
                              'image': {
                                'type': 'string',
                              },
                              'memory': {
                                'type': 'string',
                              },
                              'platform': {
                                'type': 'string',
                              },
                              'volume_mounts': {
                                'items': {
                                  'additionalProperties': false,
                                  'properties': {
                                    'mount_path': {
                                      'type': 'string',
                                    },
                                    'readonly': {
                                      'type': 'boolean',
                                    },
                                    'volume': {
                                      'type': 'string',
                                    },
                                  },
                                  'required': [
                                    'volume',
                                    'mount_path',
                                  ],
                                  'type': 'object',
                                },
                                'type': 'array',
                              },
                            },
                            'required': [
                              'image',
                            ],
                            'type': 'object',
                          },
                          'type': 'array',
                        },
                        'type': {
                          'const': 'cronjob',
                          'type': 'string',
                        },
                        'volume_mounts': {
                          'items': {
                            'additionalProperties': false,
                            'properties': {
                              'mount_path': {
                                'type': 'string',
                              },
                              'readonly': {
                                'type': 'boolean',
                              },
                              'volume': {
                                'type': 'string',
                              },
                            },
                            'required': [
                              'volume',
                              'mount_path',
                            ],
                            'type': 'object',
                          },
                          'type': 'array',
                        },
                      },
                      'required': [
                        'account',
                        'image',
                        'schedule',
                        'type',
                      ],
                      'type': 'object',
                    },
                  },
                  {
                    'if': {
                      'properties': {
                        'type': {
                          'const': 'database',
                          'type': 'string',
                        },
                      },
                    },
                    'then': {
                      'additionalProperties': false,
                      'properties': {
                        'account': {
                          'type': 'string',
                        },
                        'databaseSize': {
                          'description': 'Size of the database instance to create',
                          'type': 'string',
                        },
                        'databaseType': {
                          'description': 'The type of database engine to use',
                          'type': 'string',
                        },
                        'databaseVersion': {
                          'description': 'Refers to the unique ID of a `databaseVersion` response',
                          'type': 'string',
                        },
                        'description': {
                          'description': 'Human-readable description of the database',
                          'type': 'string',
                        },
                        'name': {
                          'description': 'Unique name for the database',
                          'type': 'string',
                        },
                        'region': {
                          'description': 'Unique ID of the region to run the database in',
                          'type': 'string',
                        },
                        'type': {
                          'const': 'database',
                          'type': 'string',
                        },
                        'vpc': {
                          'description': 'Unique ID of the VPC to run the database in',
                          'type': 'string',
                        },
                      },
                      'required': [
                        'account',
                        'databaseSize',
                        'databaseType',
                        'databaseVersion',
                        'name',
                        'region',
                        'type',
                        'vpc',
                      ],
                      'type': 'object',
                    },
                  },
                  {
                    'if': {
                      'properties': {
                        'type': {
                          'const': 'databaseSchema',
                          'type': 'string',
                        },
                      },
                    },
                    'then': {
                      'additionalProperties': false,
                      'properties': {
                        'account': {
                          'type': 'string',
                        },
                        'database': {
                          'description': 'Unique ID of the database backing this schema',
                          'type': 'string',
                        },
                        'databaseType': {
                          'description': 'Type of database required by the schema',
                          'type': 'string',
                        },
                        'databaseVersion': {
                          'description': 'Version of the database type the schema creation process expects',
                          'type': 'string',
                        },
                        'name': {
                          'description': 'Name to give to the new schema',
                          'type': 'string',
                        },
                        'type': {
                          'const': 'databaseSchema',
                          'type': 'string',
                        },
                      },
                      'required': [
                        'account',
                        'database',
                        'databaseType',
                        'databaseVersion',
                        'name',
                        'type',
                      ],
                      'type': 'object',
                    },
                  },
                  {
                    'if': {
                      'properties': {
                        'type': {
                          'properties': {},
                          'type': 'object',
                        },
                      },
                    },
                    'then': {
                      'additionalProperties': {},
                      'properties': {
                        'account': {
                          'type': 'string',
                        },
                        'type': {
                          'const': 'databaseSize',
                          'type': 'string',
                        },
                      },
                      'required': [
                        'account',
                        'type',
                      ],
                      'type': 'object',
                    },
                  },
                  {
                    'if': {
                      'properties': {
                        'type': {
                          'properties': {},
                          'type': 'object',
                        },
                      },
                    },
                    'then': {
                      'additionalProperties': {},
                      'properties': {
                        'account': {
                          'type': 'string',
                        },
                        'type': {
                          'const': 'databaseType',
                          'type': 'string',
                        },
                      },
                      'required': [
                        'account',
                        'type',
                      ],
                      'type': 'object',
                    },
                  },
                  {
                    'if': {
                      'properties': {
                        'type': {
                          'const': 'databaseUser',
                          'type': 'string',
                        },
                      },
                    },
                    'then': {
                      'additionalProperties': false,
                      'properties': {
                        'account': {
                          'type': 'string',
                        },
                        'databaseSchema': {
                          'description': 'The schema the user should have access to',
                          'type': 'string',
                        },
                        'type': {
                          'const': 'databaseUser',
                          'type': 'string',
                        },
                        'username': {
                          'description': 'Username of the user to create',
                          'type': 'string',
                        },
                      },
                      'required': [
                        'account',
                        'databaseSchema',
                        'type',
                        'username',
                      ],
                      'type': 'object',
                    },
                  },
                  {
                    'if': {
                      'properties': {
                        'type': {
                          'const': 'databaseVersion',
                          'type': 'string',
                        },
                      },
                    },
                    'then': {
                      'additionalProperties': false,
                      'properties': {
                        'account': {
                          'type': 'string',
                        },
                        'databaseType': {
                          'type': 'string',
                        },
                        'type': {
                          'const': 'databaseVersion',
                          'type': 'string',
                        },
                      },
                      'required': [
                        'account',
                        'databaseType',
                        'type',
                      ],
                      'type': 'object',
                    },
                  },
                  {
                    'if': {
                      'properties': {
                        'type': {
                          'const': 'deployment',
                          'type': 'string',
                        },
                      },
                    },
                    'then': {
                      'additionalProperties': false,
                      'properties': {
                        'account': {
                          'type': 'string',
                        },
                        'autoscaling': {
                          'additionalProperties': false,
                          'description': 'Autoscaling rules for the deployment',
                          'properties': {
                            'max_replicas': {
                              'description': 'Maximum number of replicas of the deployment to run',
                              'type': 'number',
                            },
                            'min_replicas': {
                              'description': 'Minimum number of replicas of the deployment to run',
                              'minimum': 0,
                              'type': 'number',
                            },
                          },
                          'required': [
                            'min_replicas',
                            'max_replicas',
                          ],
                          'type': 'object',
                        },
                        'command': {
                          'anyOf': [
                            {
                              'type': 'string',
                            },
                            {
                              'items': {
                                'type': 'string',
                              },
                              'type': 'array',
                            },
                          ],
                          'description': 'Command to execute in the container',
                        },
                        'cpu': {
                          'description': 'Number of CPUs to allocate to the container',
                          'minimum': 0.1,
                          'type': 'number',
                        },
                        'entrypoint': {
                          'anyOf': [
                            {
                              'type': 'string',
                            },
                            {
                              'items': {
                                'type': 'string',
                              },
                              'type': 'array',
                            },
                          ],
                          'description': 'Entrypoint of the container',
                        },
                        'environment': {
                          'additionalProperties': {
                            'anyOf': [
                              {
                                'type': 'string',
                              },
                              {
                                'type': 'number',
                              },
                              {
                                'type': 'boolean',
                              },
                              {
                                'type': 'null',
                              },
                              {
                                'not': {},
                              },
                            ],
                          },
                          'description': 'Environment variables to pass to the container',
                          'type': 'object',
                        },
                        'exposed_ports': {
                          'description': 'Port that the deployment should expose on all nodes',
                          'items': {
                            'additionalProperties': false,
                            'properties': {
                              'port': {
                                'type': 'number',
                              },
                              'target_port': {
                                'type': 'number',
                              },
                            },
                            'required': [
                              'port',
                              'target_port',
                            ],
                            'type': 'object',
                          },
                          'type': 'array',
                        },
                        'image': {
                          'description': 'Image the container runs from',
                          'type': 'string',
                        },
                        'labels': {
                          'additionalProperties': {
                            'type': 'string',
                          },
                          'description': 'Labels for the deployment',
                          'type': 'object',
                        },
                        'memory': {
                          'description': 'Amount of memory to allocate to the container',
                          'type': 'string',
                        },
                        'name': {
                          'description': 'Deployment name',
                          'type': 'string',
                        },
                        'namespace': {
                          'description': 'Namespace the deployment should be in',
                          'type': 'string',
                        },
                        'platform': {
                          'description': 'Target platform the deployment will run on',
                          'type': 'string',
                        },
                        'probes': {
                          'additionalProperties': false,
                          'properties': {
                            'liveness': {
                              'anyOf': [
                                {
                                  'additionalProperties': false,
                                  'properties': {
                                    'command': {
                                      'description': 'Command to run inside the container to determine if its healthy',
                                      'items': {
                                        'type': 'string',
                                      },
                                      'type': 'array',
                                    },
                                    'failure_threshold': {
                                      'default': 3,
                                      'description':
                                        'Number of times the probe will tolerate failure before giving up. Giving up in the case of liveness probe means restarting the container.',
                                      'minimum': 1,
                                      'type': 'number',
                                    },
                                    'initial_delay': {
                                      'default': 0,
                                      'description':
                                        'Number of seconds after the container starts before the probe is initiated.',
                                      'minimum': 0,
                                      'type': 'number',
                                    },
                                    'interval': {
                                      'default': 10,
                                      'description': 'How often (in seconds) to perform the probe.',
                                      'minimum': 1,
                                      'type': 'number',
                                    },
                                    'success_threshold': {
                                      'default': 1,
                                      'description':
                                        'Minimum consecutive successes for the probe to be considered successful after having failed.',
                                      'minimum': 1,
                                      'type': 'number',
                                    },
                                    'timeout': {
                                      'default': 1,
                                      'description': 'Number of seconds after which the probe times out',
                                      'minimum': 1,
                                      'type': 'number',
                                    },
                                    'type': {
                                      'const': 'exec',
                                      'type': 'string',
                                    },
                                  },
                                  'required': [
                                    'command',
                                    'type',
                                  ],
                                  'type': 'object',
                                },
                                {
                                  'additionalProperties': false,
                                  'properties': {
                                    'failure_threshold': {
                                      'default': 3,
                                      'description':
                                        'Number of times the probe will tolerate failure before giving up. Giving up in the case of liveness probe means restarting the container.',
                                      'minimum': 1,
                                      'type': 'number',
                                    },
                                    'headers': {
                                      'description': 'Custom headers to set in the request.',
                                      'items': {
                                        'additionalProperties': false,
                                        'properties': {
                                          'name': {
                                            'type': 'string',
                                          },
                                          'value': {
                                            'type': 'string',
                                          },
                                        },
                                        'required': [
                                          'name',
                                          'value',
                                        ],
                                        'type': 'object',
                                      },
                                      'type': 'array',
                                    },
                                    'initial_delay': {
                                      'default': 0,
                                      'description':
                                        'Number of seconds after the container starts before the probe is initiated.',
                                      'minimum': 0,
                                      'type': 'number',
                                    },
                                    'interval': {
                                      'default': 10,
                                      'description': 'How often (in seconds) to perform the probe.',
                                      'minimum': 1,
                                      'type': 'number',
                                    },
                                    'path': {
                                      'default': '/',
                                      'description': 'Path to access on the http server',
                                      'type': 'string',
                                    },
                                    'port': {
                                      'description': 'Port to access on the container',
                                      'type': 'number',
                                    },
                                    'scheme': {
                                      'default': 'http',
                                      'description': 'Scheme to use for connecting to the host (http or https).',
                                      'type': 'string',
                                    },
                                    'success_threshold': {
                                      'default': 1,
                                      'description':
                                        'Minimum consecutive successes for the probe to be considered successful after having failed.',
                                      'minimum': 1,
                                      'type': 'number',
                                    },
                                    'timeout': {
                                      'default': 1,
                                      'description': 'Number of seconds after which the probe times out',
                                      'minimum': 1,
                                      'type': 'number',
                                    },
                                    'type': {
                                      'const': 'http',
                                      'type': 'string',
                                    },
                                  },
                                  'required': [
                                    'type',
                                  ],
                                  'type': 'object',
                                },
                              ],
                            },
                          },
                          'type': 'object',
                        },
                        'replicas': {
                          'default': 1,
                          'description': 'Number of replicas of the deployment to run',
                          'type': 'number',
                        },
                        'services': {
                          'description': 'Services this deployment should register itself with',
                          'items': {
                            'additionalProperties': false,
                            'properties': {
                              'account': {
                                'description':
                                  'The account the deployment can use to register itself with the service.',
                                'type': 'string',
                              },
                              'id': {
                                'description': 'Unique ID of the service the deployment should attach itself to',
                                'type': 'string',
                              },
                            },
                            'required': [
                              'id',
                              'account',
                            ],
                            'type': 'object',
                          },
                          'type': 'array',
                        },
                        'sidecars': {
                          'description': 'A set of additional containers to run as part of each replica',
                          'items': {
                            'additionalProperties': false,
                            'properties': {
                              'command': {
                                'anyOf': [
                                  {
                                    'type': 'string',
                                  },
                                  {
                                    'items': {
                                      'type': 'string',
                                    },
                                    'type': 'array',
                                  },
                                ],
                                'description': 'Command to execute in the container',
                              },
                              'cpu': {
                                'description': 'Number of CPUs to allocate to the container',
                                'minimum': 0.1,
                                'type': 'number',
                              },
                              'entrypoint': {
                                'anyOf': [
                                  {
                                    'type': 'string',
                                  },
                                  {
                                    'items': {
                                      'type': 'string',
                                    },
                                    'type': 'array',
                                  },
                                ],
                                'description': 'Entrypoint of the container',
                              },
                              'environment': {
                                'additionalProperties': {
                                  'anyOf': [
                                    {
                                      'type': 'string',
                                    },
                                    {
                                      'type': 'number',
                                    },
                                    {
                                      'type': 'boolean',
                                    },
                                    {
                                      'type': 'null',
                                    },
                                    {
                                      'not': {},
                                    },
                                  ],
                                },
                                'description': 'Environment variables to pass to the container',
                                'type': 'object',
                              },
                              'image': {
                                'description': 'Image the container runs from',
                                'type': 'string',
                              },
                              'memory': {
                                'description': 'Amount of memory to allocate to the container',
                                'type': 'string',
                              },
                              'probes': {
                                'additionalProperties': false,
                                'properties': {
                                  'liveness': {
                                    'anyOf': [
                                      {
                                        'additionalProperties': false,
                                        'properties': {
                                          'command': {
                                            'description':
                                              'Command to run inside the container to determine if its healthy',
                                            'items': {
                                              'type': 'string',
                                            },
                                            'type': 'array',
                                          },
                                          'failure_threshold': {
                                            'default': 3,
                                            'description':
                                              'Number of times the probe will tolerate failure before giving up. Giving up in the case of liveness probe means restarting the container.',
                                            'minimum': 1,
                                            'type': 'number',
                                          },
                                          'initial_delay': {
                                            'default': 0,
                                            'description':
                                              'Number of seconds after the container starts before the probe is initiated.',
                                            'minimum': 0,
                                            'type': 'number',
                                          },
                                          'interval': {
                                            'default': 10,
                                            'description': 'How often (in seconds) to perform the probe.',
                                            'minimum': 1,
                                            'type': 'number',
                                          },
                                          'success_threshold': {
                                            'default': 1,
                                            'description':
                                              'Minimum consecutive successes for the probe to be considered successful after having failed.',
                                            'minimum': 1,
                                            'type': 'number',
                                          },
                                          'timeout': {
                                            'default': 1,
                                            'description': 'Number of seconds after which the probe times out',
                                            'minimum': 1,
                                            'type': 'number',
                                          },
                                          'type': {
                                            'const': 'exec',
                                            'type': 'string',
                                          },
                                        },
                                        'required': [
                                          'command',
                                          'type',
                                        ],
                                        'type': 'object',
                                      },
                                      {
                                        'additionalProperties': false,
                                        'properties': {
                                          'failure_threshold': {
                                            'default': 3,
                                            'description':
                                              'Number of times the probe will tolerate failure before giving up. Giving up in the case of liveness probe means restarting the container.',
                                            'minimum': 1,
                                            'type': 'number',
                                          },
                                          'headers': {
                                            'description': 'Custom headers to set in the request.',
                                            'items': {
                                              'additionalProperties': false,
                                              'properties': {
                                                'name': {
                                                  'type': 'string',
                                                },
                                                'value': {
                                                  'type': 'string',
                                                },
                                              },
                                              'required': [
                                                'name',
                                                'value',
                                              ],
                                              'type': 'object',
                                            },
                                            'type': 'array',
                                          },
                                          'initial_delay': {
                                            'default': 0,
                                            'description':
                                              'Number of seconds after the container starts before the probe is initiated.',
                                            'minimum': 0,
                                            'type': 'number',
                                          },
                                          'interval': {
                                            'default': 10,
                                            'description': 'How often (in seconds) to perform the probe.',
                                            'minimum': 1,
                                            'type': 'number',
                                          },
                                          'path': {
                                            'default': '/',
                                            'description': 'Path to access on the http server',
                                            'type': 'string',
                                          },
                                          'port': {
                                            'description': 'Port to access on the container',
                                            'type': 'number',
                                          },
                                          'scheme': {
                                            'default': 'http',
                                            'description': 'Scheme to use for connecting to the host (http or https).',
                                            'type': 'string',
                                          },
                                          'success_threshold': {
                                            'default': 1,
                                            'description':
                                              'Minimum consecutive successes for the probe to be considered successful after having failed.',
                                            'minimum': 1,
                                            'type': 'number',
                                          },
                                          'timeout': {
                                            'default': 1,
                                            'description': 'Number of seconds after which the probe times out',
                                            'minimum': 1,
                                            'type': 'number',
                                          },
                                          'type': {
                                            'const': 'http',
                                            'type': 'string',
                                          },
                                        },
                                        'required': [
                                          'type',
                                        ],
                                        'type': 'object',
                                      },
                                    ],
                                  },
                                },
                                'type': 'object',
                              },
                              'volume_mounts': {
                                'description': 'A set of volumes to mount to the container',
                                'items': {
                                  'additionalProperties': false,
                                  'properties': {
                                    'local_image': {
                                      'type': 'string',
                                    },
                                    'mount_path': {
                                      'type': 'string',
                                    },
                                    'readonly': {
                                      'type': 'boolean',
                                    },
                                    'remote_image': {
                                      'type': 'string',
                                    },
                                    'volume': {
                                      'type': 'string',
                                    },
                                  },
                                  'required': [
                                    'volume',
                                    'mount_path',
                                    'readonly',
                                  ],
                                  'type': 'object',
                                },
                                'type': 'array',
                              },
                            },
                            'required': [
                              'image',
                              'volume_mounts',
                            ],
                            'type': 'object',
                          },
                          'type': 'array',
                        },
                        'type': {
                          'const': 'deployment',
                          'type': 'string',
                        },
                        'volume_mounts': {
                          'description': 'A set of volumes to mount to the container',
                          'items': {
                            'additionalProperties': false,
                            'properties': {
                              'local_image': {
                                'type': 'string',
                              },
                              'mount_path': {
                                'type': 'string',
                              },
                              'readonly': {
                                'type': 'boolean',
                              },
                              'remote_image': {
                                'type': 'string',
                              },
                              'volume': {
                                'type': 'string',
                              },
                            },
                            'required': [
                              'volume',
                              'mount_path',
                              'readonly',
                            ],
                            'type': 'object',
                          },
                          'type': 'array',
                        },
                      },
                      'required': [
                        'account',
                        'image',
                        'name',
                        'type',
                        'volume_mounts',
                      ],
                      'type': 'object',
                    },
                  },
                  {
                    'if': {
                      'properties': {
                        'type': {
                          'const': 'dnsRecord',
                          'type': 'string',
                        },
                      },
                    },
                    'then': {
                      'additionalProperties': false,
                      'properties': {
                        'account': {
                          'type': 'string',
                        },
                        'content': {
                          'type': 'string',
                        },
                        'dnsZone': {
                          'type': 'string',
                        },
                        'recordType': {
                          'type': 'string',
                        },
                        'subdomain': {
                          'type': 'string',
                        },
                        'ttl': {
                          'type': 'number',
                        },
                        'type': {
                          'const': 'dnsRecord',
                          'type': 'string',
                        },
                      },
                      'required': [
                        'account',
                        'content',
                        'dnsZone',
                        'recordType',
                        'subdomain',
                        'type',
                      ],
                      'type': 'object',
                    },
                  },
                  {
                    'if': {
                      'properties': {
                        'type': {
                          'const': 'dnsZone',
                          'type': 'string',
                        },
                      },
                    },
                    'then': {
                      'additionalProperties': false,
                      'properties': {
                        'account': {
                          'type': 'string',
                        },
                        'name': {
                          'type': 'string',
                        },
                        'type': {
                          'const': 'dnsZone',
                          'type': 'string',
                        },
                      },
                      'required': [
                        'account',
                        'name',
                        'type',
                      ],
                      'type': 'object',
                    },
                  },
                  {
                    'if': {
                      'properties': {
                        'type': {
                          'const': 'dockerBuild',
                          'type': 'string',
                        },
                      },
                    },
                    'then': {
                      'additionalProperties': false,
                      'properties': {
                        'account': {
                          'type': 'string',
                        },
                        'args': {
                          'additionalProperties': {
                            'type': 'string',
                          },
                          'default': {},
                          'description': 'Arguments to pass to the build command',
                          'type': 'object',
                        },
                        'component_source': {
                          'description': 'Source of the component that contains the build context',
                          'type': 'string',
                        },
                        'context': {
                          'description': 'Docker build context relative to the component root',
                          'type': 'string',
                        },
                        'dockerfile': {
                          'default': 'Dockerfile',
                          'description': 'Path to the dockerfile relative to the context',
                          'type': 'string',
                        },
                        'registry': {
                          'default': 'registry.architect.io',
                          'description': 'Registry the artifact will be pushed to',
                          'type': 'string',
                        },
                        'repository': {
                          'description': 'The repository to push the artifact to',
                          'type': 'string',
                        },
                        'tag': {
                          'default': 'latest',
                          'description': 'Tag to assign to the image',
                          'type': 'string',
                        },
                        'target': {
                          'description': 'Name of a intermediate build stage to target',
                          'type': 'string',
                        },
                        'type': {
                          'const': 'dockerBuild',
                          'type': 'string',
                        },
                      },
                      'required': [
                        'account',
                        'component_source',
                        'context',
                        'repository',
                        'type',
                      ],
                      'type': 'object',
                    },
                  },
                  {
                    'if': {
                      'properties': {
                        'type': {
                          'const': 'helmChart',
                          'type': 'string',
                        },
                      },
                    },
                    'then': {
                      'additionalProperties': false,
                      'properties': {
                        'account': {
                          'type': 'string',
                        },
                        'chart': {
                          'description': 'Chart to be installed',
                          'type': 'string',
                        },
                        'name': {
                          'description': 'Name of the helm release',
                          'type': 'string',
                        },
                        'namespace': {
                          'default': 'default',
                          'description': 'The namespace to install the release in',
                          'type': 'string',
                        },
                        'repository': {
                          'description': 'The URL of the repository where the chart lives',
                          'type': 'string',
                        },
                        'type': {
                          'const': 'helmChart',
                          'type': 'string',
                        },
                        'values': {
                          'description': 'Values to pass to the helm chart release',
                          'type': 'object',
                        },
                        'version': {
                          'description': 'The exact chart version to install. Otherwise will use the latest.',
                          'type': 'string',
                        },
                      },
                      'required': [
                        'account',
                        'chart',
                        'name',
                        'repository',
                        'type',
                      ],
                      'type': 'object',
                    },
                  },
                  {
                    'if': {
                      'properties': {
                        'type': {
                          'const': 'ingressRule',
                          'type': 'string',
                        },
                      },
                    },
                    'then': {
                      'additionalProperties': false,
                      'properties': {
                        'account': {
                          'type': 'string',
                        },
                        'dnsZone': {
                          'description': 'The DNS zone (aka base URL) that the ingress rule listens on',
                          'type': 'string',
                        },
                        'headers': {
                          'additionalProperties': {
                            'type': 'string',
                          },
                          'description': 'Headers to include in responses',
                          'type': 'object',
                        },
                        'internal': {
                          'default': false,
                          'description':
                            'Whether or not this should be fulfilled by an internal load balancer (e.g. no public IP)',
                          'type': 'boolean',
                        },
                        'name': {
                          'description': 'Name to give to the ingress rule resource',
                          'type': 'string',
                        },
                        'namespace': {
                          'description': 'Namespace to put the ingress rule in',
                          'type': 'string',
                        },
                        'password': {
                          'description': 'Basic auth password',
                          'type': 'string',
                        },
                        'path': {
                          'default': '/',
                          'description': 'The path the ingress rule listens on',
                          'type': 'string',
                        },
                        'port': {
                          'description': 'Port that the ingress rule listens for traffic on',
                          'type': [
                            'string',
                            'number',
                          ],
                        },
                        'protocol': {
                          'default': 'http',
                          'description': 'The protocol the ingress rule listens for traffic on',
                          'type': 'string',
                        },
                        'registry': {
                          'description': 'Unique ID of the service registry this rule will be stored in',
                          'type': 'string',
                        },
                        'service': {
                          'description': 'Service the ingress forwards traffic to',
                          'type': 'string',
                        },
                        'subdomain': {
                          'description': 'The subdomain the ingress rule listens on',
                          'type': 'string',
                        },
                        'type': {
                          'const': 'ingressRule',
                          'type': 'string',
                        },
                        'username': {
                          'description': 'Basic auth username',
                          'type': 'string',
                        },
                      },
                      'required': [
                        'account',
                        'name',
                        'port',
                        'registry',
                        'service',
                        'type',
                      ],
                      'type': 'object',
                    },
                  },
                  {
                    'if': {
                      'properties': {
                        'type': {
                          'const': 'kubernetesCluster',
                          'type': 'string',
                        },
                      },
                    },
                    'then': {
                      'additionalProperties': false,
                      'properties': {
                        'account': {
                          'type': 'string',
                        },
                        'description': {
                          'description': 'Description of the cluster',
                          'type': 'string',
                        },
                        'kubernetesVersion': {
                          'description': 'Version of the kubernetes control plane to use',
                          'type': 'string',
                        },
                        'name': {
                          'description': 'Name of the cluster',
                          'type': 'string',
                        },
                        'nodePools': {
                          'description': 'Node pools',
                          'items': {
                            'additionalProperties': false,
                            'properties': {
                              'count': {
                                'description': 'Number of nodes the pool should have',
                                'minimum': 1,
                                'type': 'number',
                              },
                              'name': {
                                'description': 'Name of the node pool',
                                'type': 'string',
                              },
                              'nodeSize': {
                                'description': 'Size of each node in the pool',
                                'type': 'string',
                              },
                            },
                            'required': [
                              'name',
                              'count',
                              'nodeSize',
                            ],
                            'type': 'object',
                          },
                          'minimum': 1,
                          'type': 'array',
                        },
                        'region': {
                          'description': 'Region the cluster should live in',
                          'type': 'string',
                        },
                        'type': {
                          'const': 'kubernetesCluster',
                          'type': 'string',
                        },
                        'vpc': {
                          'description': 'VPC the cluster should live in',
                          'type': 'string',
                        },
                      },
                      'required': [
                        'account',
                        'kubernetesVersion',
                        'name',
                        'nodePools',
                        'region',
                        'type',
                        'vpc',
                      ],
                      'type': 'object',
                    },
                  },
                  {
                    'if': {
                      'properties': {
                        'type': {
                          'properties': {},
                          'type': 'object',
                        },
                      },
                    },
                    'then': {
                      'additionalProperties': {},
                      'properties': {
                        'account': {
                          'type': 'string',
                        },
                        'type': {
                          'const': 'kubernetesVersion',
                          'type': 'string',
                        },
                      },
                      'required': [
                        'account',
                        'type',
                      ],
                      'type': 'object',
                    },
                  },
                  {
                    'if': {
                      'properties': {
                        'type': {
                          'const': 'namespace',
                          'type': 'string',
                        },
                      },
                    },
                    'then': {
                      'additionalProperties': false,
                      'properties': {
                        'account': {
                          'type': 'string',
                        },
                        'name': {
                          'type': 'string',
                        },
                        'type': {
                          'const': 'namespace',
                          'type': 'string',
                        },
                      },
                      'required': [
                        'account',
                        'name',
                        'type',
                      ],
                      'type': 'object',
                    },
                  },
                  {
                    'if': {
                      'properties': {
                        'type': {
                          'properties': {},
                          'type': 'object',
                        },
                      },
                    },
                    'then': {
                      'additionalProperties': {},
                      'properties': {
                        'account': {
                          'type': 'string',
                        },
                        'type': {
                          'const': 'node',
                          'type': 'string',
                        },
                      },
                      'required': [
                        'account',
                        'type',
                      ],
                      'type': 'object',
                    },
                  },
                  {
                    'if': {
                      'properties': {
                        'type': {
                          'properties': {},
                          'type': 'object',
                        },
                      },
                    },
                    'then': {
                      'additionalProperties': {},
                      'properties': {
                        'account': {
                          'type': 'string',
                        },
                        'type': {
                          'const': 'nodeSize',
                          'type': 'string',
                        },
                      },
                      'required': [
                        'account',
                        'type',
                      ],
                      'type': 'object',
                    },
                  },
                  {
                    'if': {
                      'properties': {
                        'type': {
                          'properties': {},
                          'type': 'object',
                        },
                      },
                    },
                    'then': {
                      'additionalProperties': {},
                      'properties': {
                        'account': {
                          'type': 'string',
                        },
                        'type': {
                          'const': 'region',
                          'type': 'string',
                        },
                      },
                      'required': [
                        'account',
                        'type',
                      ],
                      'type': 'object',
                    },
                  },
                  {
                    'if': {
                      'properties': {
                        'type': {
                          'const': 'secret',
                          'type': 'string',
                        },
                      },
                    },
                    'then': {
                      'additionalProperties': false,
                      'properties': {
                        'account': {
                          'type': 'string',
                        },
                        'data': {
                          'description': 'Data to populate the secret with',
                          'type': 'string',
                        },
                        'merge': {
                          'default': false,
                          'description':
                            'Whether or not to merge the input data from multiple sources into an array of values',
                          'type': 'boolean',
                        },
                        'name': {
                          'description': 'Name for the secret',
                          'type': 'string',
                        },
                        'namespace': {
                          'description': 'Namespace the secret should be place in',
                          'type': 'string',
                        },
                        'required': {
                          'default': false,
                          'description': 'Whether or not the secret is required',
                          'type': 'boolean',
                        },
                        'sensitive': {
                          'default': false,
                          'description': 'Whether or not the data is to be considered sensitive and stripped from logs',
                          'type': 'boolean',
                        },
                        'type': {
                          'const': 'secret',
                          'type': 'string',
                        },
                      },
                      'required': [
                        'account',
                        'data',
                        'name',
                        'type',
                      ],
                      'type': 'object',
                    },
                  },
                  {
                    'if': {
                      'properties': {
                        'type': {
                          'const': 'service',
                          'type': 'string',
                        },
                      },
                    },
                    'then': {
                      'additionalProperties': false,
                      'properties': {
                        'account': {
                          'type': 'string',
                        },
                        'dnsZone': {
                          'description': 'Optional DNS zone to use for listeners',
                          'type': 'string',
                        },
                        'external_hostname': {
                          'description': 'External address to point to',
                          'type': 'string',
                        },
                        'labels': {
                          'additionalProperties': {
                            'type': 'string',
                          },
                          'description': 'Resource labels',
                          'type': 'object',
                        },
                        'name': {
                          'description': 'Hostname to listen on',
                          'type': 'string',
                        },
                        'namespace': {
                          'description': 'Resource namespace',
                          'type': 'string',
                        },
                        'password': {
                          'description': 'Basic auth password',
                          'type': 'string',
                        },
                        'port': {
                          'description': 'Port to listen on',
                          'type': 'number',
                        },
                        'target_deployment': {
                          'description': 'Target deployment name',
                          'type': 'string',
                        },
                        'target_port': {
                          'description': 'Target port',
                          'type': 'number',
                        },
                        'target_protocol': {
                          'default': 'http',
                          'description': 'Protocol',
                          'type': 'string',
                        },
                        'type': {
                          'const': 'service',
                          'type': 'string',
                        },
                        'username': {
                          'description': 'Basic auth username',
                          'type': 'string',
                        },
                      },
                      'required': [
                        'account',
                        'name',
                        'target_deployment',
                        'target_port',
                        'type',
                      ],
                      'type': 'object',
                    },
                  },
                  {
                    'if': {
                      'properties': {
                        'type': {
                          'const': 'task',
                          'type': 'string',
                        },
                      },
                    },
                    'then': {
                      'additionalProperties': false,
                      'properties': {
                        'account': {
                          'type': 'string',
                        },
                        'command': {
                          'anyOf': [
                            {
                              'type': 'string',
                            },
                            {
                              'items': {
                                'type': 'string',
                              },
                              'type': 'array',
                            },
                          ],
                        },
                        'cpu': {
                          'type': 'number',
                        },
                        'entrypoint': {
                          'anyOf': [
                            {
                              'type': 'string',
                            },
                            {
                              'items': {
                                'type': 'string',
                              },
                              'type': 'array',
                            },
                          ],
                        },
                        'environment': {
                          'additionalProperties': {
                            'type': 'string',
                          },
                          'type': 'object',
                        },
                        'image': {
                          'type': 'string',
                        },
                        'labels': {
                          'additionalProperties': {
                            'type': 'string',
                          },
                          'type': 'object',
                        },
                        'memory': {
                          'type': 'string',
                        },
                        'namespace': {
                          'type': 'string',
                        },
                        'sidecars': {
                          'items': {
                            'additionalProperties': false,
                            'properties': {
                              'command': {
                                'anyOf': [
                                  {
                                    'type': 'string',
                                  },
                                  {
                                    'items': {
                                      'type': 'string',
                                    },
                                    'type': 'array',
                                  },
                                ],
                              },
                              'cpu': {
                                'type': 'number',
                              },
                              'entrypoint': {
                                'anyOf': [
                                  {
                                    'type': 'string',
                                  },
                                  {
                                    'items': {
                                      'type': 'string',
                                    },
                                    'type': 'array',
                                  },
                                ],
                              },
                              'environment': {
                                'additionalProperties': {
                                  'type': 'string',
                                },
                                'type': 'object',
                              },
                              'image': {
                                'type': 'string',
                              },
                              'memory': {
                                'type': 'string',
                              },
                              'volume_mounts': {
                                'items': {
                                  'additionalProperties': false,
                                  'properties': {
                                    'mount_path': {
                                      'type': 'string',
                                    },
                                    'readonly': {
                                      'type': 'boolean',
                                    },
                                    'volume': {
                                      'type': 'string',
                                    },
                                  },
                                  'required': [
                                    'volume',
                                    'mount_path',
                                  ],
                                  'type': 'object',
                                },
                                'type': 'array',
                              },
                            },
                            'required': [
                              'image',
                            ],
                            'type': 'object',
                          },
                          'type': 'array',
                        },
                        'type': {
                          'const': 'task',
                          'type': 'string',
                        },
                        'volume_mounts': {
                          'items': {
                            'additionalProperties': false,
                            'properties': {
                              'mount_path': {
                                'type': 'string',
                              },
                              'readonly': {
                                'type': 'boolean',
                              },
                              'volume': {
                                'type': 'string',
                              },
                            },
                            'required': [
                              'volume',
                              'mount_path',
                            ],
                            'type': 'object',
                          },
                          'type': 'array',
                        },
                      },
                      'required': [
                        'account',
                        'image',
                        'type',
                      ],
                      'type': 'object',
                    },
                  },
                  {
                    'if': {
                      'properties': {
                        'type': {
                          'const': 'volume',
                          'type': 'string',
                        },
                      },
                    },
                    'then': {
                      'additionalProperties': false,
                      'properties': {
                        'account': {
                          'type': 'string',
                        },
                        'hostPath': {
                          'description': 'Path on the host machine to mount the volume to',
                          'type': 'string',
                        },
                        'name': {
                          'description': 'Name to give to the volume resource',
                          'type': 'string',
                        },
                        'type': {
                          'const': 'volume',
                          'type': 'string',
                        },
                      },
                      'required': [
                        'account',
                        'name',
                        'type',
                      ],
                      'type': 'object',
                    },
                  },
                  {
                    'if': {
                      'properties': {
                        'type': {
                          'const': 'vpc',
                          'type': 'string',
                        },
                      },
                    },
                    'then': {
                      'additionalProperties': false,
                      'properties': {
                        'account': {
                          'type': 'string',
                        },
                        'description': {
                          'description': 'Description for the VPC',
                          'type': 'string',
                        },
                        'name': {
                          'description': 'Name of the VPC',
                          'type': 'string',
                        },
                        'region': {
                          'description': 'Region the VPC exists in',
                          'type': 'string',
                        },
                        'type': {
                          'const': 'vpc',
                          'type': 'string',
                        },
                      },
                      'required': [
                        'account',
                        'name',
                        'region',
                        'type',
                      ],
                      'type': 'object',
                    },
                  },
                ],
                'properties': {
                  'type': {
                    'enum': [
                      'arcctlAccount',
                      'cronjob',
                      'database',
                      'databaseSchema',
                      'databaseUser',
                      'databaseVersion',
                      'deployment',
                      'dnsRecord',
                      'dnsZone',
                      'dockerBuild',
                      'helmChart',
                      'ingressRule',
                      'kubernetesCluster',
                      'namespace',
                      'secret',
                      'service',
                      'task',
                      'volume',
                      'vpc',
                    ],
                  },
                },
                'required': [
                  'type',
                ],
                'type': 'object',
              },
              'description': 'Configure what resources must exist in each environment in the datacenter',
              'type': 'object',
            },
          },
          'type': 'object',
        },
        'modules': {
          'additionalProperties': {
            'additionalProperties': {},
            'properties': {
              'source': {
                'type': 'string',
              },
            },
            'required': [
              'source',
            ],
            'type': 'object',
          },
          'description': 'Create terraform modules that live and die with the lifecycle of the datacenter',
          'type': 'object',
        },
        'resources': {
          'additionalProperties': {
            'allOf': [
              {
                'if': {
                  'properties': {
                    'type': {
                      'const': 'arcctlAccount',
                      'type': 'string',
                    },
                  },
                },
                'then': {
                  'additionalProperties': false,
                  'properties': {
                    'account': {
                      'type': 'string',
                    },
                    'credentials': {
                      'description': 'Credentials used to access the cloud provider',
                      'type': 'object',
                    },
                    'name': {
                      'description': 'Name of the new account',
                      'type': 'string',
                    },
                    'provider': {
                      'description': 'Cloud provider the account connects to',
                      'type': 'string',
                    },
                    'type': {
                      'const': 'arcctlAccount',
                      'type': 'string',
                    },
                  },
                  'required': [
                    'account',
                    'credentials',
                    'name',
                    'provider',
                    'type',
                  ],
                  'type': 'object',
                },
              },
              {
                'if': {
                  'properties': {
                    'type': {
                      'const': 'cronjob',
                      'type': 'string',
                    },
                  },
                },
                'then': {
                  'additionalProperties': false,
                  'properties': {
                    'account': {
                      'type': 'string',
                    },
                    'command': {
                      'anyOf': [
                        {
                          'type': 'string',
                        },
                        {
                          'items': {
                            'type': 'string',
                          },
                          'type': 'array',
                        },
                      ],
                    },
                    'cpu': {
                      'type': 'number',
                    },
                    'entrypoint': {
                      'anyOf': [
                        {
                          'type': 'string',
                        },
                        {
                          'items': {
                            'type': 'string',
                          },
                          'type': 'array',
                        },
                      ],
                    },
                    'environment': {
                      'additionalProperties': {
                        'type': 'string',
                      },
                      'type': 'object',
                    },
                    'image': {
                      'type': 'string',
                    },
                    'labels': {
                      'additionalProperties': {
                        'type': 'string',
                      },
                      'type': 'object',
                    },
                    'memory': {
                      'type': 'string',
                    },
                    'namespace': {
                      'type': 'string',
                    },
                    'platform': {
                      'type': 'string',
                    },
                    'schedule': {
                      'type': 'string',
                    },
                    'sidecars': {
                      'items': {
                        'additionalProperties': false,
                        'properties': {
                          'command': {
                            'anyOf': [
                              {
                                'type': 'string',
                              },
                              {
                                'items': {
                                  'type': 'string',
                                },
                                'type': 'array',
                              },
                            ],
                          },
                          'cpu': {
                            'type': 'number',
                          },
                          'entrypoint': {
                            'anyOf': [
                              {
                                'type': 'string',
                              },
                              {
                                'items': {
                                  'type': 'string',
                                },
                                'type': 'array',
                              },
                            ],
                          },
                          'environment': {
                            'additionalProperties': {
                              'type': 'string',
                            },
                            'type': 'object',
                          },
                          'image': {
                            'type': 'string',
                          },
                          'memory': {
                            'type': 'string',
                          },
                          'platform': {
                            'type': 'string',
                          },
                          'volume_mounts': {
                            'items': {
                              'additionalProperties': false,
                              'properties': {
                                'mount_path': {
                                  'type': 'string',
                                },
                                'readonly': {
                                  'type': 'boolean',
                                },
                                'volume': {
                                  'type': 'string',
                                },
                              },
                              'required': [
                                'volume',
                                'mount_path',
                              ],
                              'type': 'object',
                            },
                            'type': 'array',
                          },
                        },
                        'required': [
                          'image',
                        ],
                        'type': 'object',
                      },
                      'type': 'array',
                    },
                    'type': {
                      'const': 'cronjob',
                      'type': 'string',
                    },
                    'volume_mounts': {
                      'items': {
                        'additionalProperties': false,
                        'properties': {
                          'mount_path': {
                            'type': 'string',
                          },
                          'readonly': {
                            'type': 'boolean',
                          },
                          'volume': {
                            'type': 'string',
                          },
                        },
                        'required': [
                          'volume',
                          'mount_path',
                        ],
                        'type': 'object',
                      },
                      'type': 'array',
                    },
                  },
                  'required': [
                    'account',
                    'image',
                    'schedule',
                    'type',
                  ],
                  'type': 'object',
                },
              },
              {
                'if': {
                  'properties': {
                    'type': {
                      'const': 'database',
                      'type': 'string',
                    },
                  },
                },
                'then': {
                  'additionalProperties': false,
                  'properties': {
                    'account': {
                      'type': 'string',
                    },
                    'databaseSize': {
                      'description': 'Size of the database instance to create',
                      'type': 'string',
                    },
                    'databaseType': {
                      'description': 'The type of database engine to use',
                      'type': 'string',
                    },
                    'databaseVersion': {
                      'description': 'Refers to the unique ID of a `databaseVersion` response',
                      'type': 'string',
                    },
                    'description': {
                      'description': 'Human-readable description of the database',
                      'type': 'string',
                    },
                    'name': {
                      'description': 'Unique name for the database',
                      'type': 'string',
                    },
                    'region': {
                      'description': 'Unique ID of the region to run the database in',
                      'type': 'string',
                    },
                    'type': {
                      'const': 'database',
                      'type': 'string',
                    },
                    'vpc': {
                      'description': 'Unique ID of the VPC to run the database in',
                      'type': 'string',
                    },
                  },
                  'required': [
                    'account',
                    'databaseSize',
                    'databaseType',
                    'databaseVersion',
                    'name',
                    'region',
                    'type',
                    'vpc',
                  ],
                  'type': 'object',
                },
              },
              {
                'if': {
                  'properties': {
                    'type': {
                      'const': 'databaseSchema',
                      'type': 'string',
                    },
                  },
                },
                'then': {
                  'additionalProperties': false,
                  'properties': {
                    'account': {
                      'type': 'string',
                    },
                    'database': {
                      'description': 'Unique ID of the database backing this schema',
                      'type': 'string',
                    },
                    'databaseType': {
                      'description': 'Type of database required by the schema',
                      'type': 'string',
                    },
                    'databaseVersion': {
                      'description': 'Version of the database type the schema creation process expects',
                      'type': 'string',
                    },
                    'name': {
                      'description': 'Name to give to the new schema',
                      'type': 'string',
                    },
                    'type': {
                      'const': 'databaseSchema',
                      'type': 'string',
                    },
                  },
                  'required': [
                    'account',
                    'database',
                    'databaseType',
                    'databaseVersion',
                    'name',
                    'type',
                  ],
                  'type': 'object',
                },
              },
              {
                'if': {
                  'properties': {
                    'type': {
                      'properties': {},
                      'type': 'object',
                    },
                  },
                },
                'then': {
                  'additionalProperties': {},
                  'properties': {
                    'account': {
                      'type': 'string',
                    },
                    'type': {
                      'const': 'databaseSize',
                      'type': 'string',
                    },
                  },
                  'required': [
                    'account',
                    'type',
                  ],
                  'type': 'object',
                },
              },
              {
                'if': {
                  'properties': {
                    'type': {
                      'properties': {},
                      'type': 'object',
                    },
                  },
                },
                'then': {
                  'additionalProperties': {},
                  'properties': {
                    'account': {
                      'type': 'string',
                    },
                    'type': {
                      'const': 'databaseType',
                      'type': 'string',
                    },
                  },
                  'required': [
                    'account',
                    'type',
                  ],
                  'type': 'object',
                },
              },
              {
                'if': {
                  'properties': {
                    'type': {
                      'const': 'databaseUser',
                      'type': 'string',
                    },
                  },
                },
                'then': {
                  'additionalProperties': false,
                  'properties': {
                    'account': {
                      'type': 'string',
                    },
                    'databaseSchema': {
                      'description': 'The schema the user should have access to',
                      'type': 'string',
                    },
                    'type': {
                      'const': 'databaseUser',
                      'type': 'string',
                    },
                    'username': {
                      'description': 'Username of the user to create',
                      'type': 'string',
                    },
                  },
                  'required': [
                    'account',
                    'databaseSchema',
                    'type',
                    'username',
                  ],
                  'type': 'object',
                },
              },
              {
                'if': {
                  'properties': {
                    'type': {
                      'const': 'databaseVersion',
                      'type': 'string',
                    },
                  },
                },
                'then': {
                  'additionalProperties': false,
                  'properties': {
                    'account': {
                      'type': 'string',
                    },
                    'databaseType': {
                      'type': 'string',
                    },
                    'type': {
                      'const': 'databaseVersion',
                      'type': 'string',
                    },
                  },
                  'required': [
                    'account',
                    'databaseType',
                    'type',
                  ],
                  'type': 'object',
                },
              },
              {
                'if': {
                  'properties': {
                    'type': {
                      'const': 'deployment',
                      'type': 'string',
                    },
                  },
                },
                'then': {
                  'additionalProperties': false,
                  'properties': {
                    'account': {
                      'type': 'string',
                    },
                    'autoscaling': {
                      'additionalProperties': false,
                      'description': 'Autoscaling rules for the deployment',
                      'properties': {
                        'max_replicas': {
                          'description': 'Maximum number of replicas of the deployment to run',
                          'type': 'number',
                        },
                        'min_replicas': {
                          'description': 'Minimum number of replicas of the deployment to run',
                          'minimum': 0,
                          'type': 'number',
                        },
                      },
                      'required': [
                        'min_replicas',
                        'max_replicas',
                      ],
                      'type': 'object',
                    },
                    'command': {
                      'anyOf': [
                        {
                          'type': 'string',
                        },
                        {
                          'items': {
                            'type': 'string',
                          },
                          'type': 'array',
                        },
                      ],
                      'description': 'Command to execute in the container',
                    },
                    'cpu': {
                      'description': 'Number of CPUs to allocate to the container',
                      'minimum': 0.1,
                      'type': 'number',
                    },
                    'entrypoint': {
                      'anyOf': [
                        {
                          'type': 'string',
                        },
                        {
                          'items': {
                            'type': 'string',
                          },
                          'type': 'array',
                        },
                      ],
                      'description': 'Entrypoint of the container',
                    },
                    'environment': {
                      'additionalProperties': {
                        'anyOf': [
                          {
                            'type': 'string',
                          },
                          {
                            'type': 'number',
                          },
                          {
                            'type': 'boolean',
                          },
                          {
                            'type': 'null',
                          },
                          {
                            'not': {},
                          },
                        ],
                      },
                      'description': 'Environment variables to pass to the container',
                      'type': 'object',
                    },
                    'exposed_ports': {
                      'description': 'Port that the deployment should expose on all nodes',
                      'items': {
                        'additionalProperties': false,
                        'properties': {
                          'port': {
                            'type': 'number',
                          },
                          'target_port': {
                            'type': 'number',
                          },
                        },
                        'required': [
                          'port',
                          'target_port',
                        ],
                        'type': 'object',
                      },
                      'type': 'array',
                    },
                    'image': {
                      'description': 'Image the container runs from',
                      'type': 'string',
                    },
                    'labels': {
                      'additionalProperties': {
                        'type': 'string',
                      },
                      'description': 'Labels for the deployment',
                      'type': 'object',
                    },
                    'memory': {
                      'description': 'Amount of memory to allocate to the container',
                      'type': 'string',
                    },
                    'name': {
                      'description': 'Deployment name',
                      'type': 'string',
                    },
                    'namespace': {
                      'description': 'Namespace the deployment should be in',
                      'type': 'string',
                    },
                    'platform': {
                      'description': 'Target platform the deployment will run on',
                      'type': 'string',
                    },
                    'probes': {
                      'additionalProperties': false,
                      'properties': {
                        'liveness': {
                          'anyOf': [
                            {
                              'additionalProperties': false,
                              'properties': {
                                'command': {
                                  'description': 'Command to run inside the container to determine if its healthy',
                                  'items': {
                                    'type': 'string',
                                  },
                                  'type': 'array',
                                },
                                'failure_threshold': {
                                  'default': 3,
                                  'description':
                                    'Number of times the probe will tolerate failure before giving up. Giving up in the case of liveness probe means restarting the container.',
                                  'minimum': 1,
                                  'type': 'number',
                                },
                                'initial_delay': {
                                  'default': 0,
                                  'description':
                                    'Number of seconds after the container starts before the probe is initiated.',
                                  'minimum': 0,
                                  'type': 'number',
                                },
                                'interval': {
                                  'default': 10,
                                  'description': 'How often (in seconds) to perform the probe.',
                                  'minimum': 1,
                                  'type': 'number',
                                },
                                'success_threshold': {
                                  'default': 1,
                                  'description':
                                    'Minimum consecutive successes for the probe to be considered successful after having failed.',
                                  'minimum': 1,
                                  'type': 'number',
                                },
                                'timeout': {
                                  'default': 1,
                                  'description': 'Number of seconds after which the probe times out',
                                  'minimum': 1,
                                  'type': 'number',
                                },
                                'type': {
                                  'const': 'exec',
                                  'type': 'string',
                                },
                              },
                              'required': [
                                'command',
                                'type',
                              ],
                              'type': 'object',
                            },
                            {
                              'additionalProperties': false,
                              'properties': {
                                'failure_threshold': {
                                  'default': 3,
                                  'description':
                                    'Number of times the probe will tolerate failure before giving up. Giving up in the case of liveness probe means restarting the container.',
                                  'minimum': 1,
                                  'type': 'number',
                                },
                                'headers': {
                                  'description': 'Custom headers to set in the request.',
                                  'items': {
                                    'additionalProperties': false,
                                    'properties': {
                                      'name': {
                                        'type': 'string',
                                      },
                                      'value': {
                                        'type': 'string',
                                      },
                                    },
                                    'required': [
                                      'name',
                                      'value',
                                    ],
                                    'type': 'object',
                                  },
                                  'type': 'array',
                                },
                                'initial_delay': {
                                  'default': 0,
                                  'description':
                                    'Number of seconds after the container starts before the probe is initiated.',
                                  'minimum': 0,
                                  'type': 'number',
                                },
                                'interval': {
                                  'default': 10,
                                  'description': 'How often (in seconds) to perform the probe.',
                                  'minimum': 1,
                                  'type': 'number',
                                },
                                'path': {
                                  'default': '/',
                                  'description': 'Path to access on the http server',
                                  'type': 'string',
                                },
                                'port': {
                                  'description': 'Port to access on the container',
                                  'type': 'number',
                                },
                                'scheme': {
                                  'default': 'http',
                                  'description': 'Scheme to use for connecting to the host (http or https).',
                                  'type': 'string',
                                },
                                'success_threshold': {
                                  'default': 1,
                                  'description':
                                    'Minimum consecutive successes for the probe to be considered successful after having failed.',
                                  'minimum': 1,
                                  'type': 'number',
                                },
                                'timeout': {
                                  'default': 1,
                                  'description': 'Number of seconds after which the probe times out',
                                  'minimum': 1,
                                  'type': 'number',
                                },
                                'type': {
                                  'const': 'http',
                                  'type': 'string',
                                },
                              },
                              'required': [
                                'type',
                              ],
                              'type': 'object',
                            },
                          ],
                        },
                      },
                      'type': 'object',
                    },
                    'replicas': {
                      'default': 1,
                      'description': 'Number of replicas of the deployment to run',
                      'type': 'number',
                    },
                    'services': {
                      'description': 'Services this deployment should register itself with',
                      'items': {
                        'additionalProperties': false,
                        'properties': {
                          'account': {
                            'description': 'The account the deployment can use to register itself with the service.',
                            'type': 'string',
                          },
                          'id': {
                            'description': 'Unique ID of the service the deployment should attach itself to',
                            'type': 'string',
                          },
                        },
                        'required': [
                          'id',
                          'account',
                        ],
                        'type': 'object',
                      },
                      'type': 'array',
                    },
                    'sidecars': {
                      'description': 'A set of additional containers to run as part of each replica',
                      'items': {
                        'additionalProperties': false,
                        'properties': {
                          'command': {
                            'anyOf': [
                              {
                                'type': 'string',
                              },
                              {
                                'items': {
                                  'type': 'string',
                                },
                                'type': 'array',
                              },
                            ],
                            'description': 'Command to execute in the container',
                          },
                          'cpu': {
                            'description': 'Number of CPUs to allocate to the container',
                            'minimum': 0.1,
                            'type': 'number',
                          },
                          'entrypoint': {
                            'anyOf': [
                              {
                                'type': 'string',
                              },
                              {
                                'items': {
                                  'type': 'string',
                                },
                                'type': 'array',
                              },
                            ],
                            'description': 'Entrypoint of the container',
                          },
                          'environment': {
                            'additionalProperties': {
                              'anyOf': [
                                {
                                  'type': 'string',
                                },
                                {
                                  'type': 'number',
                                },
                                {
                                  'type': 'boolean',
                                },
                                {
                                  'type': 'null',
                                },
                                {
                                  'not': {},
                                },
                              ],
                            },
                            'description': 'Environment variables to pass to the container',
                            'type': 'object',
                          },
                          'image': {
                            'description': 'Image the container runs from',
                            'type': 'string',
                          },
                          'memory': {
                            'description': 'Amount of memory to allocate to the container',
                            'type': 'string',
                          },
                          'probes': {
                            'additionalProperties': false,
                            'properties': {
                              'liveness': {
                                'anyOf': [
                                  {
                                    'additionalProperties': false,
                                    'properties': {
                                      'command': {
                                        'description':
                                          'Command to run inside the container to determine if its healthy',
                                        'items': {
                                          'type': 'string',
                                        },
                                        'type': 'array',
                                      },
                                      'failure_threshold': {
                                        'default': 3,
                                        'description':
                                          'Number of times the probe will tolerate failure before giving up. Giving up in the case of liveness probe means restarting the container.',
                                        'minimum': 1,
                                        'type': 'number',
                                      },
                                      'initial_delay': {
                                        'default': 0,
                                        'description':
                                          'Number of seconds after the container starts before the probe is initiated.',
                                        'minimum': 0,
                                        'type': 'number',
                                      },
                                      'interval': {
                                        'default': 10,
                                        'description': 'How often (in seconds) to perform the probe.',
                                        'minimum': 1,
                                        'type': 'number',
                                      },
                                      'success_threshold': {
                                        'default': 1,
                                        'description':
                                          'Minimum consecutive successes for the probe to be considered successful after having failed.',
                                        'minimum': 1,
                                        'type': 'number',
                                      },
                                      'timeout': {
                                        'default': 1,
                                        'description': 'Number of seconds after which the probe times out',
                                        'minimum': 1,
                                        'type': 'number',
                                      },
                                      'type': {
                                        'const': 'exec',
                                        'type': 'string',
                                      },
                                    },
                                    'required': [
                                      'command',
                                      'type',
                                    ],
                                    'type': 'object',
                                  },
                                  {
                                    'additionalProperties': false,
                                    'properties': {
                                      'failure_threshold': {
                                        'default': 3,
                                        'description':
                                          'Number of times the probe will tolerate failure before giving up. Giving up in the case of liveness probe means restarting the container.',
                                        'minimum': 1,
                                        'type': 'number',
                                      },
                                      'headers': {
                                        'description': 'Custom headers to set in the request.',
                                        'items': {
                                          'additionalProperties': false,
                                          'properties': {
                                            'name': {
                                              'type': 'string',
                                            },
                                            'value': {
                                              'type': 'string',
                                            },
                                          },
                                          'required': [
                                            'name',
                                            'value',
                                          ],
                                          'type': 'object',
                                        },
                                        'type': 'array',
                                      },
                                      'initial_delay': {
                                        'default': 0,
                                        'description':
                                          'Number of seconds after the container starts before the probe is initiated.',
                                        'minimum': 0,
                                        'type': 'number',
                                      },
                                      'interval': {
                                        'default': 10,
                                        'description': 'How often (in seconds) to perform the probe.',
                                        'minimum': 1,
                                        'type': 'number',
                                      },
                                      'path': {
                                        'default': '/',
                                        'description': 'Path to access on the http server',
                                        'type': 'string',
                                      },
                                      'port': {
                                        'description': 'Port to access on the container',
                                        'type': 'number',
                                      },
                                      'scheme': {
                                        'default': 'http',
                                        'description': 'Scheme to use for connecting to the host (http or https).',
                                        'type': 'string',
                                      },
                                      'success_threshold': {
                                        'default': 1,
                                        'description':
                                          'Minimum consecutive successes for the probe to be considered successful after having failed.',
                                        'minimum': 1,
                                        'type': 'number',
                                      },
                                      'timeout': {
                                        'default': 1,
                                        'description': 'Number of seconds after which the probe times out',
                                        'minimum': 1,
                                        'type': 'number',
                                      },
                                      'type': {
                                        'const': 'http',
                                        'type': 'string',
                                      },
                                    },
                                    'required': [
                                      'type',
                                    ],
                                    'type': 'object',
                                  },
                                ],
                              },
                            },
                            'type': 'object',
                          },
                          'volume_mounts': {
                            'description': 'A set of volumes to mount to the container',
                            'items': {
                              'additionalProperties': false,
                              'properties': {
                                'local_image': {
                                  'type': 'string',
                                },
                                'mount_path': {
                                  'type': 'string',
                                },
                                'readonly': {
                                  'type': 'boolean',
                                },
                                'remote_image': {
                                  'type': 'string',
                                },
                                'volume': {
                                  'type': 'string',
                                },
                              },
                              'required': [
                                'volume',
                                'mount_path',
                                'readonly',
                              ],
                              'type': 'object',
                            },
                            'type': 'array',
                          },
                        },
                        'required': [
                          'image',
                          'volume_mounts',
                        ],
                        'type': 'object',
                      },
                      'type': 'array',
                    },
                    'type': {
                      'const': 'deployment',
                      'type': 'string',
                    },
                    'volume_mounts': {
                      'description': 'A set of volumes to mount to the container',
                      'items': {
                        'additionalProperties': false,
                        'properties': {
                          'local_image': {
                            'type': 'string',
                          },
                          'mount_path': {
                            'type': 'string',
                          },
                          'readonly': {
                            'type': 'boolean',
                          },
                          'remote_image': {
                            'type': 'string',
                          },
                          'volume': {
                            'type': 'string',
                          },
                        },
                        'required': [
                          'volume',
                          'mount_path',
                          'readonly',
                        ],
                        'type': 'object',
                      },
                      'type': 'array',
                    },
                  },
                  'required': [
                    'account',
                    'image',
                    'name',
                    'type',
                    'volume_mounts',
                  ],
                  'type': 'object',
                },
              },
              {
                'if': {
                  'properties': {
                    'type': {
                      'const': 'dnsRecord',
                      'type': 'string',
                    },
                  },
                },
                'then': {
                  'additionalProperties': false,
                  'properties': {
                    'account': {
                      'type': 'string',
                    },
                    'content': {
                      'type': 'string',
                    },
                    'dnsZone': {
                      'type': 'string',
                    },
                    'recordType': {
                      'type': 'string',
                    },
                    'subdomain': {
                      'type': 'string',
                    },
                    'ttl': {
                      'type': 'number',
                    },
                    'type': {
                      'const': 'dnsRecord',
                      'type': 'string',
                    },
                  },
                  'required': [
                    'account',
                    'content',
                    'dnsZone',
                    'recordType',
                    'subdomain',
                    'type',
                  ],
                  'type': 'object',
                },
              },
              {
                'if': {
                  'properties': {
                    'type': {
                      'const': 'dnsZone',
                      'type': 'string',
                    },
                  },
                },
                'then': {
                  'additionalProperties': false,
                  'properties': {
                    'account': {
                      'type': 'string',
                    },
                    'name': {
                      'type': 'string',
                    },
                    'type': {
                      'const': 'dnsZone',
                      'type': 'string',
                    },
                  },
                  'required': [
                    'account',
                    'name',
                    'type',
                  ],
                  'type': 'object',
                },
              },
              {
                'if': {
                  'properties': {
                    'type': {
                      'const': 'dockerBuild',
                      'type': 'string',
                    },
                  },
                },
                'then': {
                  'additionalProperties': false,
                  'properties': {
                    'account': {
                      'type': 'string',
                    },
                    'args': {
                      'additionalProperties': {
                        'type': 'string',
                      },
                      'default': {},
                      'description': 'Arguments to pass to the build command',
                      'type': 'object',
                    },
                    'component_source': {
                      'description': 'Source of the component that contains the build context',
                      'type': 'string',
                    },
                    'context': {
                      'description': 'Docker build context relative to the component root',
                      'type': 'string',
                    },
                    'dockerfile': {
                      'default': 'Dockerfile',
                      'description': 'Path to the dockerfile relative to the context',
                      'type': 'string',
                    },
                    'registry': {
                      'default': 'registry.architect.io',
                      'description': 'Registry the artifact will be pushed to',
                      'type': 'string',
                    },
                    'repository': {
                      'description': 'The repository to push the artifact to',
                      'type': 'string',
                    },
                    'tag': {
                      'default': 'latest',
                      'description': 'Tag to assign to the image',
                      'type': 'string',
                    },
                    'target': {
                      'description': 'Name of a intermediate build stage to target',
                      'type': 'string',
                    },
                    'type': {
                      'const': 'dockerBuild',
                      'type': 'string',
                    },
                  },
                  'required': [
                    'account',
                    'component_source',
                    'context',
                    'repository',
                    'type',
                  ],
                  'type': 'object',
                },
              },
              {
                'if': {
                  'properties': {
                    'type': {
                      'const': 'helmChart',
                      'type': 'string',
                    },
                  },
                },
                'then': {
                  'additionalProperties': false,
                  'properties': {
                    'account': {
                      'type': 'string',
                    },
                    'chart': {
                      'description': 'Chart to be installed',
                      'type': 'string',
                    },
                    'name': {
                      'description': 'Name of the helm release',
                      'type': 'string',
                    },
                    'namespace': {
                      'default': 'default',
                      'description': 'The namespace to install the release in',
                      'type': 'string',
                    },
                    'repository': {
                      'description': 'The URL of the repository where the chart lives',
                      'type': 'string',
                    },
                    'type': {
                      'const': 'helmChart',
                      'type': 'string',
                    },
                    'values': {
                      'description': 'Values to pass to the helm chart release',
                      'type': 'object',
                    },
                    'version': {
                      'description': 'The exact chart version to install. Otherwise will use the latest.',
                      'type': 'string',
                    },
                  },
                  'required': [
                    'account',
                    'chart',
                    'name',
                    'repository',
                    'type',
                  ],
                  'type': 'object',
                },
              },
              {
                'if': {
                  'properties': {
                    'type': {
                      'const': 'ingressRule',
                      'type': 'string',
                    },
                  },
                },
                'then': {
                  'additionalProperties': false,
                  'properties': {
                    'account': {
                      'type': 'string',
                    },
                    'dnsZone': {
                      'description': 'The DNS zone (aka base URL) that the ingress rule listens on',
                      'type': 'string',
                    },
                    'headers': {
                      'additionalProperties': {
                        'type': 'string',
                      },
                      'description': 'Headers to include in responses',
                      'type': 'object',
                    },
                    'internal': {
                      'default': false,
                      'description':
                        'Whether or not this should be fulfilled by an internal load balancer (e.g. no public IP)',
                      'type': 'boolean',
                    },
                    'name': {
                      'description': 'Name to give to the ingress rule resource',
                      'type': 'string',
                    },
                    'namespace': {
                      'description': 'Namespace to put the ingress rule in',
                      'type': 'string',
                    },
                    'password': {
                      'description': 'Basic auth password',
                      'type': 'string',
                    },
                    'path': {
                      'default': '/',
                      'description': 'The path the ingress rule listens on',
                      'type': 'string',
                    },
                    'port': {
                      'description': 'Port that the ingress rule listens for traffic on',
                      'type': [
                        'string',
                        'number',
                      ],
                    },
                    'protocol': {
                      'default': 'http',
                      'description': 'The protocol the ingress rule listens for traffic on',
                      'type': 'string',
                    },
                    'registry': {
                      'description': 'Unique ID of the service registry this rule will be stored in',
                      'type': 'string',
                    },
                    'service': {
                      'description': 'Service the ingress forwards traffic to',
                      'type': 'string',
                    },
                    'subdomain': {
                      'description': 'The subdomain the ingress rule listens on',
                      'type': 'string',
                    },
                    'type': {
                      'const': 'ingressRule',
                      'type': 'string',
                    },
                    'username': {
                      'description': 'Basic auth username',
                      'type': 'string',
                    },
                  },
                  'required': [
                    'account',
                    'name',
                    'port',
                    'registry',
                    'service',
                    'type',
                  ],
                  'type': 'object',
                },
              },
              {
                'if': {
                  'properties': {
                    'type': {
                      'const': 'kubernetesCluster',
                      'type': 'string',
                    },
                  },
                },
                'then': {
                  'additionalProperties': false,
                  'properties': {
                    'account': {
                      'type': 'string',
                    },
                    'description': {
                      'description': 'Description of the cluster',
                      'type': 'string',
                    },
                    'kubernetesVersion': {
                      'description': 'Version of the kubernetes control plane to use',
                      'type': 'string',
                    },
                    'name': {
                      'description': 'Name of the cluster',
                      'type': 'string',
                    },
                    'nodePools': {
                      'description': 'Node pools',
                      'items': {
                        'additionalProperties': false,
                        'properties': {
                          'count': {
                            'description': 'Number of nodes the pool should have',
                            'minimum': 1,
                            'type': 'number',
                          },
                          'name': {
                            'description': 'Name of the node pool',
                            'type': 'string',
                          },
                          'nodeSize': {
                            'description': 'Size of each node in the pool',
                            'type': 'string',
                          },
                        },
                        'required': [
                          'name',
                          'count',
                          'nodeSize',
                        ],
                        'type': 'object',
                      },
                      'minimum': 1,
                      'type': 'array',
                    },
                    'region': {
                      'description': 'Region the cluster should live in',
                      'type': 'string',
                    },
                    'type': {
                      'const': 'kubernetesCluster',
                      'type': 'string',
                    },
                    'vpc': {
                      'description': 'VPC the cluster should live in',
                      'type': 'string',
                    },
                  },
                  'required': [
                    'account',
                    'kubernetesVersion',
                    'name',
                    'nodePools',
                    'region',
                    'type',
                    'vpc',
                  ],
                  'type': 'object',
                },
              },
              {
                'if': {
                  'properties': {
                    'type': {
                      'properties': {},
                      'type': 'object',
                    },
                  },
                },
                'then': {
                  'additionalProperties': {},
                  'properties': {
                    'account': {
                      'type': 'string',
                    },
                    'type': {
                      'const': 'kubernetesVersion',
                      'type': 'string',
                    },
                  },
                  'required': [
                    'account',
                    'type',
                  ],
                  'type': 'object',
                },
              },
              {
                'if': {
                  'properties': {
                    'type': {
                      'const': 'namespace',
                      'type': 'string',
                    },
                  },
                },
                'then': {
                  'additionalProperties': false,
                  'properties': {
                    'account': {
                      'type': 'string',
                    },
                    'name': {
                      'type': 'string',
                    },
                    'type': {
                      'const': 'namespace',
                      'type': 'string',
                    },
                  },
                  'required': [
                    'account',
                    'name',
                    'type',
                  ],
                  'type': 'object',
                },
              },
              {
                'if': {
                  'properties': {
                    'type': {
                      'properties': {},
                      'type': 'object',
                    },
                  },
                },
                'then': {
                  'additionalProperties': {},
                  'properties': {
                    'account': {
                      'type': 'string',
                    },
                    'type': {
                      'const': 'node',
                      'type': 'string',
                    },
                  },
                  'required': [
                    'account',
                    'type',
                  ],
                  'type': 'object',
                },
              },
              {
                'if': {
                  'properties': {
                    'type': {
                      'properties': {},
                      'type': 'object',
                    },
                  },
                },
                'then': {
                  'additionalProperties': {},
                  'properties': {
                    'account': {
                      'type': 'string',
                    },
                    'type': {
                      'const': 'nodeSize',
                      'type': 'string',
                    },
                  },
                  'required': [
                    'account',
                    'type',
                  ],
                  'type': 'object',
                },
              },
              {
                'if': {
                  'properties': {
                    'type': {
                      'properties': {},
                      'type': 'object',
                    },
                  },
                },
                'then': {
                  'additionalProperties': {},
                  'properties': {
                    'account': {
                      'type': 'string',
                    },
                    'type': {
                      'const': 'region',
                      'type': 'string',
                    },
                  },
                  'required': [
                    'account',
                    'type',
                  ],
                  'type': 'object',
                },
              },
              {
                'if': {
                  'properties': {
                    'type': {
                      'const': 'secret',
                      'type': 'string',
                    },
                  },
                },
                'then': {
                  'additionalProperties': false,
                  'properties': {
                    'account': {
                      'type': 'string',
                    },
                    'data': {
                      'description': 'Data to populate the secret with',
                      'type': 'string',
                    },
                    'merge': {
                      'default': false,
                      'description':
                        'Whether or not to merge the input data from multiple sources into an array of values',
                      'type': 'boolean',
                    },
                    'name': {
                      'description': 'Name for the secret',
                      'type': 'string',
                    },
                    'namespace': {
                      'description': 'Namespace the secret should be place in',
                      'type': 'string',
                    },
                    'required': {
                      'default': false,
                      'description': 'Whether or not the secret is required',
                      'type': 'boolean',
                    },
                    'sensitive': {
                      'default': false,
                      'description': 'Whether or not the data is to be considered sensitive and stripped from logs',
                      'type': 'boolean',
                    },
                    'type': {
                      'const': 'secret',
                      'type': 'string',
                    },
                  },
                  'required': [
                    'account',
                    'data',
                    'name',
                    'type',
                  ],
                  'type': 'object',
                },
              },
              {
                'if': {
                  'properties': {
                    'type': {
                      'const': 'service',
                      'type': 'string',
                    },
                  },
                },
                'then': {
                  'additionalProperties': false,
                  'properties': {
                    'account': {
                      'type': 'string',
                    },
                    'dnsZone': {
                      'description': 'Optional DNS zone to use for listeners',
                      'type': 'string',
                    },
                    'external_hostname': {
                      'description': 'External address to point to',
                      'type': 'string',
                    },
                    'labels': {
                      'additionalProperties': {
                        'type': 'string',
                      },
                      'description': 'Resource labels',
                      'type': 'object',
                    },
                    'name': {
                      'description': 'Hostname to listen on',
                      'type': 'string',
                    },
                    'namespace': {
                      'description': 'Resource namespace',
                      'type': 'string',
                    },
                    'password': {
                      'description': 'Basic auth password',
                      'type': 'string',
                    },
                    'port': {
                      'description': 'Port to listen on',
                      'type': 'number',
                    },
                    'target_deployment': {
                      'description': 'Target deployment name',
                      'type': 'string',
                    },
                    'target_port': {
                      'description': 'Target port',
                      'type': 'number',
                    },
                    'target_protocol': {
                      'default': 'http',
                      'description': 'Protocol',
                      'type': 'string',
                    },
                    'type': {
                      'const': 'service',
                      'type': 'string',
                    },
                    'username': {
                      'description': 'Basic auth username',
                      'type': 'string',
                    },
                  },
                  'required': [
                    'account',
                    'name',
                    'target_deployment',
                    'target_port',
                    'type',
                  ],
                  'type': 'object',
                },
              },
              {
                'if': {
                  'properties': {
                    'type': {
                      'const': 'task',
                      'type': 'string',
                    },
                  },
                },
                'then': {
                  'additionalProperties': false,
                  'properties': {
                    'account': {
                      'type': 'string',
                    },
                    'command': {
                      'anyOf': [
                        {
                          'type': 'string',
                        },
                        {
                          'items': {
                            'type': 'string',
                          },
                          'type': 'array',
                        },
                      ],
                    },
                    'cpu': {
                      'type': 'number',
                    },
                    'entrypoint': {
                      'anyOf': [
                        {
                          'type': 'string',
                        },
                        {
                          'items': {
                            'type': 'string',
                          },
                          'type': 'array',
                        },
                      ],
                    },
                    'environment': {
                      'additionalProperties': {
                        'type': 'string',
                      },
                      'type': 'object',
                    },
                    'image': {
                      'type': 'string',
                    },
                    'labels': {
                      'additionalProperties': {
                        'type': 'string',
                      },
                      'type': 'object',
                    },
                    'memory': {
                      'type': 'string',
                    },
                    'namespace': {
                      'type': 'string',
                    },
                    'sidecars': {
                      'items': {
                        'additionalProperties': false,
                        'properties': {
                          'command': {
                            'anyOf': [
                              {
                                'type': 'string',
                              },
                              {
                                'items': {
                                  'type': 'string',
                                },
                                'type': 'array',
                              },
                            ],
                          },
                          'cpu': {
                            'type': 'number',
                          },
                          'entrypoint': {
                            'anyOf': [
                              {
                                'type': 'string',
                              },
                              {
                                'items': {
                                  'type': 'string',
                                },
                                'type': 'array',
                              },
                            ],
                          },
                          'environment': {
                            'additionalProperties': {
                              'type': 'string',
                            },
                            'type': 'object',
                          },
                          'image': {
                            'type': 'string',
                          },
                          'memory': {
                            'type': 'string',
                          },
                          'volume_mounts': {
                            'items': {
                              'additionalProperties': false,
                              'properties': {
                                'mount_path': {
                                  'type': 'string',
                                },
                                'readonly': {
                                  'type': 'boolean',
                                },
                                'volume': {
                                  'type': 'string',
                                },
                              },
                              'required': [
                                'volume',
                                'mount_path',
                              ],
                              'type': 'object',
                            },
                            'type': 'array',
                          },
                        },
                        'required': [
                          'image',
                        ],
                        'type': 'object',
                      },
                      'type': 'array',
                    },
                    'type': {
                      'const': 'task',
                      'type': 'string',
                    },
                    'volume_mounts': {
                      'items': {
                        'additionalProperties': false,
                        'properties': {
                          'mount_path': {
                            'type': 'string',
                          },
                          'readonly': {
                            'type': 'boolean',
                          },
                          'volume': {
                            'type': 'string',
                          },
                        },
                        'required': [
                          'volume',
                          'mount_path',
                        ],
                        'type': 'object',
                      },
                      'type': 'array',
                    },
                  },
                  'required': [
                    'account',
                    'image',
                    'type',
                  ],
                  'type': 'object',
                },
              },
              {
                'if': {
                  'properties': {
                    'type': {
                      'const': 'volume',
                      'type': 'string',
                    },
                  },
                },
                'then': {
                  'additionalProperties': false,
                  'properties': {
                    'account': {
                      'type': 'string',
                    },
                    'hostPath': {
                      'description': 'Path on the host machine to mount the volume to',
                      'type': 'string',
                    },
                    'name': {
                      'description': 'Name to give to the volume resource',
                      'type': 'string',
                    },
                    'type': {
                      'const': 'volume',
                      'type': 'string',
                    },
                  },
                  'required': [
                    'account',
                    'name',
                    'type',
                  ],
                  'type': 'object',
                },
              },
              {
                'if': {
                  'properties': {
                    'type': {
                      'const': 'vpc',
                      'type': 'string',
                    },
                  },
                },
                'then': {
                  'additionalProperties': false,
                  'properties': {
                    'account': {
                      'type': 'string',
                    },
                    'description': {
                      'description': 'Description for the VPC',
                      'type': 'string',
                    },
                    'name': {
                      'description': 'Name of the VPC',
                      'type': 'string',
                    },
                    'region': {
                      'description': 'Region the VPC exists in',
                      'type': 'string',
                    },
                    'type': {
                      'const': 'vpc',
                      'type': 'string',
                    },
                  },
                  'required': [
                    'account',
                    'name',
                    'region',
                    'type',
                  ],
                  'type': 'object',
                },
              },
            ],
            'properties': {
              'type': {
                'enum': [
                  'arcctlAccount',
                  'cronjob',
                  'database',
                  'databaseSchema',
                  'databaseUser',
                  'databaseVersion',
                  'deployment',
                  'dnsRecord',
                  'dnsZone',
                  'dockerBuild',
                  'helmChart',
                  'ingressRule',
                  'kubernetesCluster',
                  'namespace',
                  'secret',
                  'service',
                  'task',
                  'volume',
                  'vpc',
                ],
              },
            },
            'required': [
              'type',
            ],
            'type': 'object',
          },
          'description': 'Create resources that live and die with the lifecycle of the datacenter',
          'type': 'object',
        },
        'secrets': {
          'additionalProperties': false,
          'description': 'Configure how secrets should be stored.',
          'properties': {
            'account': {
              'description': 'Which account secrets should be stored in',
              'type': 'string',
            },
            'namespace': {
              'description': 'What additional namespacing to use for secrets hosted by the datacenter',
              'type': 'string',
            },
          },
          'required': [
            'account',
          ],
          'type': 'object',
        },
        'variables': {
          'additionalProperties': {
            'additionalProperties': false,
            'properties': {
              'arcctlAccount': {
                'type': 'string',
              },
              'cronjob': {
                'type': 'string',
              },
              'database': {
                'type': 'string',
              },
              'databaseSchema': {
                'type': 'string',
              },
              'databaseSize': {
                'type': 'string',
              },
              'databaseType': {
                'type': 'string',
              },
              'databaseUser': {
                'type': 'string',
              },
              'databaseVersion': {
                'type': 'string',
              },
              'deployment': {
                'type': 'string',
              },
              'description': {
                'type': 'string',
              },
              'dnsRecord': {
                'type': 'string',
              },
              'dnsZone': {
                'type': 'string',
              },
              'dockerBuild': {
                'type': 'string',
              },
              'helmChart': {
                'type': 'string',
              },
              'ingressRule': {
                'type': 'string',
              },
              'kubernetesCluster': {
                'type': 'string',
              },
              'kubernetesVersion': {
                'type': 'string',
              },
              'namespace': {
                'type': 'string',
              },
              'node': {
                'type': 'string',
              },
              'nodeSize': {
                'type': 'string',
              },
              'provider': {
                'type': 'string',
              },
              'region': {
                'type': 'string',
              },
              'secret': {
                'type': 'string',
              },
              'service': {
                'type': 'string',
              },
              'task': {
                'type': 'string',
              },
              'type': {
                'enum': [
                  'arcctlAccount',
                  'cronjob',
                  'database',
                  'databaseSchema',
                  'databaseSize',
                  'databaseType',
                  'databaseUser',
                  'databaseVersion',
                  'deployment',
                  'dnsRecord',
                  'dnsZone',
                  'dockerBuild',
                  'helmChart',
                  'ingressRule',
                  'kubernetesCluster',
                  'kubernetesVersion',
                  'namespace',
                  'node',
                  'nodeSize',
                  'region',
                  'secret',
                  'service',
                  'task',
                  'volume',
                  'vpc',
                  'string',
                  'number',
                  'boolean',
                ],
                'type': 'string',
              },
              'value': {
                'type': [
                  'string',
                  'number',
                  'boolean',
                ],
              },
              'volume': {
                'type': 'string',
              },
              'vpc': {
                'type': 'string',
              },
            },
            'required': [
              'type',
            ],
            'type': 'object',
          },
          'description': 'Variables whose values will be prompted for when creating the datacenter',
          'type': 'object',
        },
        'version': {
          'const': 'v1',
          'type': 'string',
        },
      },
      'required': [
        'secrets',
        'version',
      ],
      'type': 'object',
    },
  },
  '$id': 'https://architect.io/.schemas/datacenter.json',
};