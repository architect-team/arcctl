export default {
  'oneOf': [
    {
      'additionalProperties': false,
      'properties': {
        'databases': {
          'additionalProperties': {
            'additionalProperties': false,
            'properties': {
              'description': {
                'description': 'A human-readable description of the database and its purpose',
                'type': 'string',
              },
              'type': {
                'description': 'Type of database and version required by the application',
                'type': 'string',
              },
            },
            'required': [
              'type',
            ],
            'type': 'object',
          },
          'description': 'A set of databases required by the component',
          'type': 'object',
        },
        'dependencies': {
          'additionalProperties': {
            'anyOf': [
              {
                'type': 'string',
              },
              {
                'additionalProperties': false,
                'properties': {
                  'component': {
                    'type': 'string',
                  },
                  'inputs': {
                    'additionalProperties': {
                      'items': {
                        'type': 'string',
                      },
                      'type': 'array',
                    },
                    'type': 'object',
                  },
                },
                'required': [
                  'component',
                ],
                'type': 'object',
              },
            ],
          },
          'description': 'A set of components and associated versions that this component depends on.',
          'type': 'object',
        },
        'description': {
          'description': 'A human-readable description of the component and what it should be used for',
          'type': 'string',
        },
        'interfaces': {
          'additionalProperties': {
            'anyOf': [
              {
                'type': 'string',
              },
              {
                'additionalProperties': false,
                'properties': {
                  'description': {
                    'description': 'A human-readable description of the interface and how it should be used.',
                    'type': 'string',
                  },
                  'ingress': {
                    'additionalProperties': false,
                    'description': 'Ingress configuration to allow the interface to be exposed publicly',
                    'properties': {
                      'internal': {
                        'default': false,
                        'description':
                          'Indicates whether the ingress rule should be attached to a public or private load balancer',
                        'type': 'boolean',
                      },
                      'path': {
                        'description': 'Path that the interface should be exposed under',
                        'type': 'string',
                      },
                      'subdomain': {
                        'description': 'Subdomain the interface should be accessed on',
                        'type': 'string',
                      },
                    },
                    'type': 'object',
                  },
                  'url': {
                    'description':
                      'The url of the downstream interfaces that should be exposed. This will usually be a reference to one of your services interfaces.',
                    'type': 'string',
                  },
                },
                'required': [
                  'url',
                ],
                'type': 'object',
              },
            ],
          },
          'description':
            'A dictionary of named interfaces that the component makes available to upstreams, including other components via dependencies or environments via interface mapping.\n\nInterfaces can either be an object describing the interface, or a string shorthand that directly applies to the `url` value.',
          'type': 'object',
        },
        'keywords': {
          'description':
            'An array of keywords that can be used to index the component and make it discoverable for others',
          'items': {
            'type': 'string',
          },
          'type': 'array',
        },
        'name': {
          'description': 'Unique name of the component. Must be of the format, <account-name>/<component-name>',
          'type': 'string',
        },
        'parameters': {
          'additionalProperties': {
            'anyOf': [
              {
                'type': 'string',
              },
              {
                'additionalProperties': false,
                'properties': {
                  'default': {
                    'description':
                      'The default value to apply to the parameter when one wasn\'t provided by the operator',
                    'type': [
                      'string',
                      'number',
                    ],
                  },
                  'description': {
                    'description':
                      'A human-readable description of the parameter, how it should be used, and what kinds of values it supports.',
                    'type': 'string',
                  },
                  'merge': {
                    'default': false,
                    'description': 'Whether or not to merge results from multiple sources into a single array',
                    'type': 'boolean',
                  },
                  'required': {
                    'default': false,
                    'description': 'A boolean indicating whether or not an operator is required ot provide a value',
                    'type': 'boolean',
                  },
                },
                'type': 'object',
              },
            ],
          },
          'description':
            'A dictionary of named parameters that this component uses to configure services.\n\nParameters can either be an object describing the parameter or a string shorthand that directly applies to the `default` value.\n\nThis is an alias for the `inputs` field.',
          'type': 'object',
        },
        'secrets': {
          'additionalProperties': {
            'anyOf': [
              {
                'type': 'string',
              },
              {
                'additionalProperties': false,
                'properties': {
                  'default': {
                    'description':
                      'The default value to apply to the parameter when one wasn\'t provided by the operator',
                    'type': [
                      'string',
                      'number',
                    ],
                  },
                  'description': {
                    'description':
                      'A human-readable description of the parameter, how it should be used, and what kinds of values it supports.',
                    'type': 'string',
                  },
                  'merge': {
                    'default': false,
                    'description': 'Whether or not to merge results from multiple sources into a single array',
                    'type': 'boolean',
                  },
                  'required': {
                    'default': false,
                    'description': 'A boolean indicating whether or not an operator is required ot provide a value',
                    'type': 'boolean',
                  },
                },
                'type': 'object',
              },
            ],
          },
          'description':
            'A dictionary of named parameters that this component uses to configure services.\n\nParameters can either be an object describing the parameter or a string shorthand that directly applies to the `default` value.\n\nThis is an alias for the `inputs` field.',
          'type': 'object',
        },
        'services': {
          'additionalProperties': {
            'anyOf': [
              {
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
                    'type': [
                      'number',
                      'string',
                    ],
                  },
                  'debug': {
                    'additionalProperties': false,
                    'properties': {
                      'build': {
                        'additionalProperties': false,
                        'properties': {
                          'args': {
                            'additionalProperties': {
                              'type': 'string',
                            },
                            'type': 'object',
                          },
                          'context': {
                            'type': 'string',
                          },
                          'dockerfile': {
                            'type': 'string',
                          },
                          'target': {
                            'type': 'string',
                          },
                        },
                        'type': 'object',
                      },
                      'command': {
                        'anyOf': [
                          {
                            'items': {
                              'type': 'string',
                            },
                            'type': 'array',
                          },
                          {
                            'type': 'string',
                          },
                        ],
                      },
                      'cpu': {
                        'type': [
                          'number',
                          'string',
                        ],
                      },
                      'depends_on': {
                        'items': {
                          'type': 'string',
                        },
                        'type': 'array',
                      },
                      'entrypoint': {
                        'anyOf': [
                          {
                            'items': {
                              'type': 'string',
                            },
                            'type': 'array',
                          },
                          {
                            'type': 'string',
                          },
                        ],
                      },
                      'environment': {
                        'additionalProperties': {
                          'type': [
                            'string',
                            'number',
                          ],
                        },
                        'type': 'object',
                      },
                      'image': {
                        'type': 'string',
                      },
                      'interfaces': {
                        'additionalProperties': {
                          'anyOf': [
                            {
                              'additionalProperties': false,
                              'properties': {
                                'host': {
                                  'type': 'string',
                                },
                                'ingress': {
                                  'additionalProperties': false,
                                  'properties': {
                                    'internal': {
                                      'type': 'boolean',
                                    },
                                    'path': {
                                      'type': 'string',
                                    },
                                    'subdomain': {
                                      'type': 'string',
                                    },
                                  },
                                  'type': 'object',
                                },
                                'password': {
                                  'type': 'string',
                                },
                                'port': {
                                  'type': [
                                    'number',
                                    'string',
                                  ],
                                },
                                'protocol': {
                                  'type': 'string',
                                },
                                'url': {
                                  'type': 'string',
                                },
                                'username': {
                                  'type': 'string',
                                },
                              },
                              'type': 'object',
                            },
                            {
                              'type': 'number',
                            },
                            {
                              'type': 'string',
                            },
                          ],
                        },
                        'type': 'object',
                      },
                      'labels': {
                        'additionalProperties': {
                          'type': 'string',
                        },
                        'type': 'object',
                      },
                      'language': {
                        'type': 'string',
                      },
                      'liveness_probe': {
                        'additionalProperties': false,
                        'properties': {
                          'command': {
                            'anyOf': [
                              {
                                'items': {
                                  'type': 'string',
                                },
                                'type': 'array',
                              },
                              {
                                'type': 'string',
                              },
                            ],
                          },
                          'failure_threshold': {
                            'type': [
                              'number',
                              'string',
                            ],
                          },
                          'initial_delay': {
                            'type': 'string',
                          },
                          'interval': {
                            'type': 'string',
                          },
                          'path': {
                            'type': 'string',
                          },
                          'port': {
                            'type': [
                              'number',
                              'string',
                            ],
                          },
                          'success_threshold': {
                            'type': [
                              'number',
                              'string',
                            ],
                          },
                          'timeout': {
                            'type': 'string',
                          },
                        },
                        'type': 'object',
                      },
                      'memory': {
                        'type': 'string',
                      },
                      'platform': {
                        'type': 'string',
                      },
                      'replicas': {
                        'type': [
                          'number',
                          'string',
                        ],
                      },
                      'scaling': {
                        'additionalProperties': false,
                        'properties': {
                          'max_replicas': {
                            'type': [
                              'number',
                              'string',
                            ],
                          },
                          'metrics': {
                            'additionalProperties': false,
                            'properties': {
                              'cpu': {
                                'type': [
                                  'number',
                                  'string',
                                ],
                              },
                              'memory': {
                                'type': 'string',
                              },
                            },
                            'type': 'object',
                          },
                          'min_replicas': {
                            'type': [
                              'number',
                              'string',
                            ],
                          },
                        },
                        'type': 'object',
                      },
                      'volumes': {
                        'additionalProperties': {
                          'additionalProperties': false,
                          'properties': {
                            'description': {
                              'type': 'string',
                            },
                            'host_path': {
                              'type': 'string',
                            },
                            'image': {
                              'type': 'string',
                            },
                            'mount_path': {
                              'type': 'string',
                            },
                            'readonly': {
                              'type': [
                                'boolean',
                                'string',
                              ],
                            },
                          },
                          'type': 'object',
                        },
                        'type': 'object',
                      },
                    },
                    'type': 'object',
                  },
                  'depends_on': {
                    'description': 'Specify other services that you want to wait for before starting this one',
                    'items': {
                      'type': 'string',
                    },
                    'type': 'array',
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
                      'type': [
                        'string',
                        'number',
                      ],
                    },
                    'type': 'object',
                  },
                  'image': {
                    'type': 'string',
                  },
                  'interfaces': {
                    'additionalProperties': {
                      'anyOf': [
                        {
                          'type': 'number',
                        },
                        {
                          'type': 'string',
                        },
                        {
                          'additionalProperties': false,
                          'properties': {
                            'host': {
                              'type': 'string',
                            },
                            'ingress': {
                              'additionalProperties': false,
                              'properties': {
                                'internal': {
                                  'type': 'boolean',
                                },
                                'path': {
                                  'type': 'string',
                                },
                                'subdomain': {
                                  'type': 'string',
                                },
                              },
                              'type': 'object',
                            },
                            'password': {
                              'type': 'string',
                            },
                            'port': {
                              'type': [
                                'number',
                                'string',
                              ],
                            },
                            'protocol': {
                              'type': 'string',
                            },
                            'url': {
                              'type': 'string',
                            },
                            'username': {
                              'type': 'string',
                            },
                          },
                          'required': [
                            'port',
                          ],
                          'type': 'object',
                        },
                      ],
                    },
                    'type': 'object',
                  },
                  'labels': {
                    'additionalProperties': {
                      'type': 'string',
                    },
                    'type': 'object',
                  },
                  'language': {
                    'deprecated': true,
                    'type': 'string',
                  },
                  'liveness_probe': {
                    'additionalProperties': false,
                    'description': 'Task run continuously to determine if each service replica is healthy',
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
                        'description':
                          'Command that runs the http check. This field is disjunctive with `path` and `port` (only one of `command` or `path`/`port` can be set).',
                      },
                      'failure_threshold': {
                        'default': 3,
                        'description':
                          'The number of times to retry a failed health check before the container is considered unhealthy',
                        'type': [
                          'number',
                          'string',
                        ],
                      },
                      'initial_delay': {
                        'default': '0s',
                        'description': 'Delays the check from running for the specified amount of time',
                        'type': 'string',
                      },
                      'interval': {
                        'default': '30s',
                        'description':
                          'The time period in seconds between each health check execution. You may specify any value between: 5s and 300s',
                        'type': 'string',
                      },
                      'path': {
                        'deprecated': true,
                        'type': 'string',
                      },
                      'port': {
                        'deprecated': true,
                        'type': [
                          'number',
                          'string',
                        ],
                      },
                      'success_threshold': {
                        'default': 1,
                        'description':
                          'The number of times to retry a health check before the container is considered healthy',
                        'type': [
                          'number',
                          'string',
                        ],
                      },
                      'timeout': {
                        'default': '5s',
                        'description':
                          'The time period to wait for a health check to succeed before it is considered a failure. You may specify any value between 2s and 60s.',
                        'type': 'string',
                      },
                    },
                    'type': 'object',
                  },
                  'memory': {
                    'type': 'string',
                  },
                  'platform': {
                    'type': 'string',
                  },
                  'replicas': {
                    'description': 'Number of replicas of the deployment to run',
                    'type': [
                      'number',
                      'string',
                    ],
                  },
                  'scaling': {
                    'additionalProperties': false,
                    'description': 'Autoscaling rules for the deployment',
                    'properties': {
                      'max_replicas': {
                        'type': [
                          'number',
                          'string',
                        ],
                      },
                      'metrics': {
                        'additionalProperties': false,
                        'description': 'Metrics to be used to trigger autoscaling',
                        'properties': {
                          'cpu': {
                            'type': [
                              'number',
                              'string',
                            ],
                          },
                          'memory': {
                            'type': 'string',
                          },
                        },
                        'type': 'object',
                      },
                      'min_replicas': {
                        'type': [
                          'number',
                          'string',
                        ],
                      },
                    },
                    'required': [
                      'min_replicas',
                      'max_replicas',
                      'metrics',
                    ],
                    'type': 'object',
                  },
                  'volumes': {
                    'additionalProperties': {
                      'additionalProperties': false,
                      'properties': {
                        'description': {
                          'type': 'string',
                        },
                        'host_path': {
                          'type': 'string',
                        },
                        'image': {
                          'type': 'string',
                        },
                        'mount_path': {
                          'type': 'string',
                        },
                        'readonly': {
                          'type': [
                            'boolean',
                            'string',
                          ],
                        },
                      },
                      'required': [
                        'mount_path',
                      ],
                      'type': 'object',
                    },
                    'type': 'object',
                  },
                },
                'required': [
                  'image',
                ],
                'type': 'object',
              },
              {
                'additionalProperties': false,
                'properties': {
                  'build': {
                    'additionalProperties': false,
                    'properties': {
                      'args': {
                        'additionalProperties': {
                          'type': 'string',
                        },
                        'type': 'object',
                      },
                      'context': {
                        'type': 'string',
                      },
                      'dockerfile': {
                        'type': 'string',
                      },
                      'target': {
                        'type': 'string',
                      },
                    },
                    'required': [
                      'context',
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
                  },
                  'cpu': {
                    'type': [
                      'number',
                      'string',
                    ],
                  },
                  'debug': {
                    'additionalProperties': false,
                    'properties': {
                      'build': {
                        'additionalProperties': false,
                        'properties': {
                          'args': {
                            'additionalProperties': {
                              'type': 'string',
                            },
                            'type': 'object',
                          },
                          'context': {
                            'type': 'string',
                          },
                          'dockerfile': {
                            'type': 'string',
                          },
                          'target': {
                            'type': 'string',
                          },
                        },
                        'type': 'object',
                      },
                      'command': {
                        'anyOf': [
                          {
                            'items': {
                              'type': 'string',
                            },
                            'type': 'array',
                          },
                          {
                            'type': 'string',
                          },
                        ],
                      },
                      'cpu': {
                        'type': [
                          'number',
                          'string',
                        ],
                      },
                      'depends_on': {
                        'items': {
                          'type': 'string',
                        },
                        'type': 'array',
                      },
                      'entrypoint': {
                        'anyOf': [
                          {
                            'items': {
                              'type': 'string',
                            },
                            'type': 'array',
                          },
                          {
                            'type': 'string',
                          },
                        ],
                      },
                      'environment': {
                        'additionalProperties': {
                          'type': [
                            'string',
                            'number',
                          ],
                        },
                        'type': 'object',
                      },
                      'image': {
                        'type': 'string',
                      },
                      'interfaces': {
                        'additionalProperties': {
                          'anyOf': [
                            {
                              'additionalProperties': false,
                              'properties': {
                                'host': {
                                  'type': 'string',
                                },
                                'ingress': {
                                  'additionalProperties': false,
                                  'properties': {
                                    'internal': {
                                      'type': 'boolean',
                                    },
                                    'path': {
                                      'type': 'string',
                                    },
                                    'subdomain': {
                                      'type': 'string',
                                    },
                                  },
                                  'type': 'object',
                                },
                                'password': {
                                  'type': 'string',
                                },
                                'port': {
                                  'type': [
                                    'number',
                                    'string',
                                  ],
                                },
                                'protocol': {
                                  'type': 'string',
                                },
                                'url': {
                                  'type': 'string',
                                },
                                'username': {
                                  'type': 'string',
                                },
                              },
                              'type': 'object',
                            },
                            {
                              'type': 'number',
                            },
                            {
                              'type': 'string',
                            },
                          ],
                        },
                        'type': 'object',
                      },
                      'labels': {
                        'additionalProperties': {
                          'type': 'string',
                        },
                        'type': 'object',
                      },
                      'language': {
                        'type': 'string',
                      },
                      'liveness_probe': {
                        'additionalProperties': false,
                        'properties': {
                          'command': {
                            'anyOf': [
                              {
                                'items': {
                                  'type': 'string',
                                },
                                'type': 'array',
                              },
                              {
                                'type': 'string',
                              },
                            ],
                          },
                          'failure_threshold': {
                            'type': [
                              'number',
                              'string',
                            ],
                          },
                          'initial_delay': {
                            'type': 'string',
                          },
                          'interval': {
                            'type': 'string',
                          },
                          'path': {
                            'type': 'string',
                          },
                          'port': {
                            'type': [
                              'number',
                              'string',
                            ],
                          },
                          'success_threshold': {
                            'type': [
                              'number',
                              'string',
                            ],
                          },
                          'timeout': {
                            'type': 'string',
                          },
                        },
                        'type': 'object',
                      },
                      'memory': {
                        'type': 'string',
                      },
                      'platform': {
                        'type': 'string',
                      },
                      'replicas': {
                        'type': [
                          'number',
                          'string',
                        ],
                      },
                      'scaling': {
                        'additionalProperties': false,
                        'properties': {
                          'max_replicas': {
                            'type': [
                              'number',
                              'string',
                            ],
                          },
                          'metrics': {
                            'additionalProperties': false,
                            'properties': {
                              'cpu': {
                                'type': [
                                  'number',
                                  'string',
                                ],
                              },
                              'memory': {
                                'type': 'string',
                              },
                            },
                            'type': 'object',
                          },
                          'min_replicas': {
                            'type': [
                              'number',
                              'string',
                            ],
                          },
                        },
                        'type': 'object',
                      },
                      'volumes': {
                        'additionalProperties': {
                          'additionalProperties': false,
                          'properties': {
                            'description': {
                              'type': 'string',
                            },
                            'host_path': {
                              'type': 'string',
                            },
                            'image': {
                              'type': 'string',
                            },
                            'mount_path': {
                              'type': 'string',
                            },
                            'readonly': {
                              'type': [
                                'boolean',
                                'string',
                              ],
                            },
                          },
                          'type': 'object',
                        },
                        'type': 'object',
                      },
                    },
                    'type': 'object',
                  },
                  'depends_on': {
                    'description': 'Specify other services that you want to wait for before starting this one',
                    'items': {
                      'type': 'string',
                    },
                    'type': 'array',
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
                      'type': [
                        'string',
                        'number',
                      ],
                    },
                    'type': 'object',
                  },
                  'interfaces': {
                    'additionalProperties': {
                      'anyOf': [
                        {
                          'type': 'number',
                        },
                        {
                          'type': 'string',
                        },
                        {
                          'additionalProperties': false,
                          'properties': {
                            'host': {
                              'type': 'string',
                            },
                            'ingress': {
                              'additionalProperties': false,
                              'properties': {
                                'internal': {
                                  'type': 'boolean',
                                },
                                'path': {
                                  'type': 'string',
                                },
                                'subdomain': {
                                  'type': 'string',
                                },
                              },
                              'type': 'object',
                            },
                            'password': {
                              'type': 'string',
                            },
                            'port': {
                              'type': [
                                'number',
                                'string',
                              ],
                            },
                            'protocol': {
                              'type': 'string',
                            },
                            'url': {
                              'type': 'string',
                            },
                            'username': {
                              'type': 'string',
                            },
                          },
                          'required': [
                            'port',
                          ],
                          'type': 'object',
                        },
                      ],
                    },
                    'type': 'object',
                  },
                  'labels': {
                    'additionalProperties': {
                      'type': 'string',
                    },
                    'type': 'object',
                  },
                  'language': {
                    'deprecated': true,
                    'type': 'string',
                  },
                  'liveness_probe': {
                    'additionalProperties': false,
                    'description': 'Task run continuously to determine if each service replica is healthy',
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
                        'description':
                          'Command that runs the http check. This field is disjunctive with `path` and `port` (only one of `command` or `path`/`port` can be set).',
                      },
                      'failure_threshold': {
                        'default': 3,
                        'description':
                          'The number of times to retry a failed health check before the container is considered unhealthy',
                        'type': [
                          'number',
                          'string',
                        ],
                      },
                      'initial_delay': {
                        'default': '0s',
                        'description': 'Delays the check from running for the specified amount of time',
                        'type': 'string',
                      },
                      'interval': {
                        'default': '30s',
                        'description':
                          'The time period in seconds between each health check execution. You may specify any value between: 5s and 300s',
                        'type': 'string',
                      },
                      'path': {
                        'deprecated': true,
                        'type': 'string',
                      },
                      'port': {
                        'deprecated': true,
                        'type': [
                          'number',
                          'string',
                        ],
                      },
                      'success_threshold': {
                        'default': 1,
                        'description':
                          'The number of times to retry a health check before the container is considered healthy',
                        'type': [
                          'number',
                          'string',
                        ],
                      },
                      'timeout': {
                        'default': '5s',
                        'description':
                          'The time period to wait for a health check to succeed before it is considered a failure. You may specify any value between 2s and 60s.',
                        'type': 'string',
                      },
                    },
                    'type': 'object',
                  },
                  'memory': {
                    'type': 'string',
                  },
                  'platform': {
                    'type': 'string',
                  },
                  'replicas': {
                    'description': 'Number of replicas of the deployment to run',
                    'type': [
                      'number',
                      'string',
                    ],
                  },
                  'scaling': {
                    'additionalProperties': false,
                    'description': 'Autoscaling rules for the deployment',
                    'properties': {
                      'max_replicas': {
                        'type': [
                          'number',
                          'string',
                        ],
                      },
                      'metrics': {
                        'additionalProperties': false,
                        'description': 'Metrics to be used to trigger autoscaling',
                        'properties': {
                          'cpu': {
                            'type': [
                              'number',
                              'string',
                            ],
                          },
                          'memory': {
                            'type': 'string',
                          },
                        },
                        'type': 'object',
                      },
                      'min_replicas': {
                        'type': [
                          'number',
                          'string',
                        ],
                      },
                    },
                    'required': [
                      'min_replicas',
                      'max_replicas',
                      'metrics',
                    ],
                    'type': 'object',
                  },
                  'volumes': {
                    'additionalProperties': {
                      'additionalProperties': false,
                      'properties': {
                        'description': {
                          'type': 'string',
                        },
                        'host_path': {
                          'type': 'string',
                        },
                        'image': {
                          'type': 'string',
                        },
                        'mount_path': {
                          'type': 'string',
                        },
                        'readonly': {
                          'type': [
                            'boolean',
                            'string',
                          ],
                        },
                      },
                      'required': [
                        'mount_path',
                      ],
                      'type': 'object',
                    },
                    'type': 'object',
                  },
                },
                'required': [
                  'build',
                ],
                'type': 'object',
              },
              {
                'additionalProperties': false,
                'properties': {
                  'build': {
                    'additionalProperties': false,
                    'properties': {
                      'args': {
                        'additionalProperties': {
                          'type': 'string',
                        },
                        'type': 'object',
                      },
                      'context': {
                        'type': 'string',
                      },
                      'dockerfile': {
                        'type': 'string',
                      },
                      'target': {
                        'type': 'string',
                      },
                    },
                    'required': [
                      'context',
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
                  },
                  'cpu': {
                    'type': [
                      'number',
                      'string',
                    ],
                  },
                  'debug': {
                    'additionalProperties': false,
                    'properties': {
                      'build': {
                        'additionalProperties': false,
                        'properties': {
                          'args': {
                            'additionalProperties': {
                              'type': 'string',
                            },
                            'type': 'object',
                          },
                          'context': {
                            'type': 'string',
                          },
                          'dockerfile': {
                            'type': 'string',
                          },
                          'target': {
                            'type': 'string',
                          },
                        },
                        'type': 'object',
                      },
                      'command': {
                        'anyOf': [
                          {
                            'items': {
                              'type': 'string',
                            },
                            'type': 'array',
                          },
                          {
                            'type': 'string',
                          },
                        ],
                      },
                      'cpu': {
                        'type': [
                          'number',
                          'string',
                        ],
                      },
                      'depends_on': {
                        'items': {
                          'type': 'string',
                        },
                        'type': 'array',
                      },
                      'entrypoint': {
                        'anyOf': [
                          {
                            'items': {
                              'type': 'string',
                            },
                            'type': 'array',
                          },
                          {
                            'type': 'string',
                          },
                        ],
                      },
                      'environment': {
                        'additionalProperties': {
                          'type': [
                            'string',
                            'number',
                          ],
                        },
                        'type': 'object',
                      },
                      'image': {
                        'type': 'string',
                      },
                      'interfaces': {
                        'additionalProperties': {
                          'anyOf': [
                            {
                              'additionalProperties': false,
                              'properties': {
                                'host': {
                                  'type': 'string',
                                },
                                'ingress': {
                                  'additionalProperties': false,
                                  'properties': {
                                    'internal': {
                                      'type': 'boolean',
                                    },
                                    'path': {
                                      'type': 'string',
                                    },
                                    'subdomain': {
                                      'type': 'string',
                                    },
                                  },
                                  'type': 'object',
                                },
                                'password': {
                                  'type': 'string',
                                },
                                'port': {
                                  'type': [
                                    'number',
                                    'string',
                                  ],
                                },
                                'protocol': {
                                  'type': 'string',
                                },
                                'url': {
                                  'type': 'string',
                                },
                                'username': {
                                  'type': 'string',
                                },
                              },
                              'type': 'object',
                            },
                            {
                              'type': 'number',
                            },
                            {
                              'type': 'string',
                            },
                          ],
                        },
                        'type': 'object',
                      },
                      'labels': {
                        'additionalProperties': {
                          'type': 'string',
                        },
                        'type': 'object',
                      },
                      'language': {
                        'type': 'string',
                      },
                      'liveness_probe': {
                        'additionalProperties': false,
                        'properties': {
                          'command': {
                            'anyOf': [
                              {
                                'items': {
                                  'type': 'string',
                                },
                                'type': 'array',
                              },
                              {
                                'type': 'string',
                              },
                            ],
                          },
                          'failure_threshold': {
                            'type': [
                              'number',
                              'string',
                            ],
                          },
                          'initial_delay': {
                            'type': 'string',
                          },
                          'interval': {
                            'type': 'string',
                          },
                          'path': {
                            'type': 'string',
                          },
                          'port': {
                            'type': [
                              'number',
                              'string',
                            ],
                          },
                          'success_threshold': {
                            'type': [
                              'number',
                              'string',
                            ],
                          },
                          'timeout': {
                            'type': 'string',
                          },
                        },
                        'type': 'object',
                      },
                      'memory': {
                        'type': 'string',
                      },
                      'platform': {
                        'type': 'string',
                      },
                      'replicas': {
                        'type': [
                          'number',
                          'string',
                        ],
                      },
                      'scaling': {
                        'additionalProperties': false,
                        'properties': {
                          'max_replicas': {
                            'type': [
                              'number',
                              'string',
                            ],
                          },
                          'metrics': {
                            'additionalProperties': false,
                            'properties': {
                              'cpu': {
                                'type': [
                                  'number',
                                  'string',
                                ],
                              },
                              'memory': {
                                'type': 'string',
                              },
                            },
                            'type': 'object',
                          },
                          'min_replicas': {
                            'type': [
                              'number',
                              'string',
                            ],
                          },
                        },
                        'type': 'object',
                      },
                      'volumes': {
                        'additionalProperties': {
                          'additionalProperties': false,
                          'properties': {
                            'description': {
                              'type': 'string',
                            },
                            'host_path': {
                              'type': 'string',
                            },
                            'image': {
                              'type': 'string',
                            },
                            'mount_path': {
                              'type': 'string',
                            },
                            'readonly': {
                              'type': [
                                'boolean',
                                'string',
                              ],
                            },
                          },
                          'type': 'object',
                        },
                        'type': 'object',
                      },
                    },
                    'type': 'object',
                  },
                  'depends_on': {
                    'description': 'Specify other services that you want to wait for before starting this one',
                    'items': {
                      'type': 'string',
                    },
                    'type': 'array',
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
                      'type': [
                        'string',
                        'number',
                      ],
                    },
                    'type': 'object',
                  },
                  'image': {
                    'type': 'string',
                  },
                  'interfaces': {
                    'additionalProperties': {
                      'anyOf': [
                        {
                          'type': 'number',
                        },
                        {
                          'type': 'string',
                        },
                        {
                          'additionalProperties': false,
                          'properties': {
                            'host': {
                              'type': 'string',
                            },
                            'ingress': {
                              'additionalProperties': false,
                              'properties': {
                                'internal': {
                                  'type': 'boolean',
                                },
                                'path': {
                                  'type': 'string',
                                },
                                'subdomain': {
                                  'type': 'string',
                                },
                              },
                              'type': 'object',
                            },
                            'password': {
                              'type': 'string',
                            },
                            'port': {
                              'type': [
                                'number',
                                'string',
                              ],
                            },
                            'protocol': {
                              'type': 'string',
                            },
                            'url': {
                              'type': 'string',
                            },
                            'username': {
                              'type': 'string',
                            },
                          },
                          'required': [
                            'port',
                          ],
                          'type': 'object',
                        },
                      ],
                    },
                    'type': 'object',
                  },
                  'labels': {
                    'additionalProperties': {
                      'type': 'string',
                    },
                    'type': 'object',
                  },
                  'language': {
                    'deprecated': true,
                    'type': 'string',
                  },
                  'liveness_probe': {
                    'additionalProperties': false,
                    'description': 'Task run continuously to determine if each service replica is healthy',
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
                        'description':
                          'Command that runs the http check. This field is disjunctive with `path` and `port` (only one of `command` or `path`/`port` can be set).',
                      },
                      'failure_threshold': {
                        'default': 3,
                        'description':
                          'The number of times to retry a failed health check before the container is considered unhealthy',
                        'type': [
                          'number',
                          'string',
                        ],
                      },
                      'initial_delay': {
                        'default': '0s',
                        'description': 'Delays the check from running for the specified amount of time',
                        'type': 'string',
                      },
                      'interval': {
                        'default': '30s',
                        'description':
                          'The time period in seconds between each health check execution. You may specify any value between: 5s and 300s',
                        'type': 'string',
                      },
                      'path': {
                        'deprecated': true,
                        'type': 'string',
                      },
                      'port': {
                        'deprecated': true,
                        'type': [
                          'number',
                          'string',
                        ],
                      },
                      'success_threshold': {
                        'default': 1,
                        'description':
                          'The number of times to retry a health check before the container is considered healthy',
                        'type': [
                          'number',
                          'string',
                        ],
                      },
                      'timeout': {
                        'default': '5s',
                        'description':
                          'The time period to wait for a health check to succeed before it is considered a failure. You may specify any value between 2s and 60s.',
                        'type': 'string',
                      },
                    },
                    'type': 'object',
                  },
                  'memory': {
                    'type': 'string',
                  },
                  'platform': {
                    'type': 'string',
                  },
                  'replicas': {
                    'description': 'Number of replicas of the deployment to run',
                    'type': [
                      'number',
                      'string',
                    ],
                  },
                  'scaling': {
                    'additionalProperties': false,
                    'description': 'Autoscaling rules for the deployment',
                    'properties': {
                      'max_replicas': {
                        'type': [
                          'number',
                          'string',
                        ],
                      },
                      'metrics': {
                        'additionalProperties': false,
                        'description': 'Metrics to be used to trigger autoscaling',
                        'properties': {
                          'cpu': {
                            'type': [
                              'number',
                              'string',
                            ],
                          },
                          'memory': {
                            'type': 'string',
                          },
                        },
                        'type': 'object',
                      },
                      'min_replicas': {
                        'type': [
                          'number',
                          'string',
                        ],
                      },
                    },
                    'required': [
                      'min_replicas',
                      'max_replicas',
                      'metrics',
                    ],
                    'type': 'object',
                  },
                  'volumes': {
                    'additionalProperties': {
                      'additionalProperties': false,
                      'properties': {
                        'description': {
                          'type': 'string',
                        },
                        'host_path': {
                          'type': 'string',
                        },
                        'image': {
                          'type': 'string',
                        },
                        'mount_path': {
                          'type': 'string',
                        },
                        'readonly': {
                          'type': [
                            'boolean',
                            'string',
                          ],
                        },
                      },
                      'required': [
                        'mount_path',
                      ],
                      'type': 'object',
                    },
                    'type': 'object',
                  },
                },
                'required': [
                  'build',
                  'image',
                ],
                'type': 'object',
              },
            ],
          },
          'description': 'A set of named services that need to be run and persisted in order to power this component.',
          'type': 'object',
        },
        'static': {
          'additionalProperties': {
            'additionalProperties': false,
            'properties': {
              'build': {
                'additionalProperties': false,
                'description':
                  'Instructions on how to build the code into static files to be put into the `directory`. Builds will be done just-in-time (JIT) for deployments to ensure that environment variables are specific to the target environment.',
                'properties': {
                  'command': {
                    'description': 'Command to run to build the code',
                    'type': 'string',
                  },
                  'context': {
                    'description': 'Folder to consider the context for the build relative to the component root',
                    'type': 'string',
                  },
                  'environment': {
                    'additionalProperties': {
                      'type': [
                        'string',
                        'number',
                        'boolean',
                      ],
                    },
                    'description': 'Environment variables to inject into the build process',
                    'type': 'object',
                  },
                },
                'required': [
                  'context',
                  'command',
                ],
                'type': 'object',
              },
              'debug': {
                'additionalProperties': false,
                'properties': {
                  'build': {
                    'additionalProperties': false,
                    'properties': {
                      'command': {
                        'type': 'string',
                      },
                      'context': {
                        'type': 'string',
                      },
                      'environment': {
                        'additionalProperties': {
                          'type': [
                            'string',
                            'number',
                            'boolean',
                          ],
                        },
                        'type': 'object',
                      },
                    },
                    'type': 'object',
                  },
                  'directory': {
                    'type': 'string',
                  },
                  'ingress': {
                    'additionalProperties': false,
                    'properties': {
                      'internal': {
                        'type': 'boolean',
                      },
                      'path': {
                        'type': 'string',
                      },
                      'subdomain': {
                        'type': 'string',
                      },
                    },
                    'type': 'object',
                  },
                },
                'type': 'object',
              },
              'directory': {
                'description': 'Directory containing the static assets to be shipped to the bucket',
                'type': 'string',
              },
              'ingress': {
                'additionalProperties': false,
                'description': 'Configure a DNS route to point to this static bucket',
                'properties': {
                  'internal': {
                    'default': false,
                    'description': 'Whether or not this bucket should be exposed internally vs externally',
                    'type': 'boolean',
                  },
                  'path': {
                    'description': 'Sub-path to listen on when re-routing traffic from the ingress rule to the bucket',
                    'type': 'string',
                  },
                  'subdomain': {
                    'description': 'Subdomain to use for the ingress rule',
                    'type': 'string',
                  },
                },
                'type': 'object',
              },
            },
            'required': [
              'directory',
            ],
            'type': 'object',
          },
          'description': 'A set of static asset buckets to create and load with content.',
          'type': 'object',
        },
        'tasks': {
          'additionalProperties': {
            'anyOf': [
              {
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
                    'type': [
                      'number',
                      'string',
                    ],
                  },
                  'debug': {
                    'additionalProperties': false,
                    'properties': {
                      'build': {
                        'additionalProperties': false,
                        'properties': {
                          'args': {
                            'additionalProperties': {
                              'type': 'string',
                            },
                            'type': 'object',
                          },
                          'context': {
                            'type': 'string',
                          },
                          'dockerfile': {
                            'type': 'string',
                          },
                          'target': {
                            'type': 'string',
                          },
                        },
                        'type': 'object',
                      },
                      'command': {
                        'anyOf': [
                          {
                            'items': {
                              'type': 'string',
                            },
                            'type': 'array',
                          },
                          {
                            'type': 'string',
                          },
                        ],
                      },
                      'cpu': {
                        'type': [
                          'number',
                          'string',
                        ],
                      },
                      'entrypoint': {
                        'anyOf': [
                          {
                            'items': {
                              'type': 'string',
                            },
                            'type': 'array',
                          },
                          {
                            'type': 'string',
                          },
                        ],
                      },
                      'environment': {
                        'additionalProperties': {
                          'type': [
                            'string',
                            'number',
                          ],
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
                      'language': {
                        'type': 'string',
                      },
                      'memory': {
                        'type': 'string',
                      },
                      'platform': {
                        'type': 'string',
                      },
                      'schedule': {
                        'type': 'string',
                      },
                      'volumes': {
                        'additionalProperties': {
                          'additionalProperties': false,
                          'properties': {
                            'description': {
                              'type': 'string',
                            },
                            'host_path': {
                              'type': 'string',
                            },
                            'image': {
                              'type': 'string',
                            },
                            'mount_path': {
                              'type': 'string',
                            },
                            'readonly': {
                              'type': [
                                'boolean',
                                'string',
                              ],
                            },
                          },
                          'type': 'object',
                        },
                        'type': 'object',
                      },
                    },
                    'type': 'object',
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
                      'type': [
                        'string',
                        'number',
                      ],
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
                  'language': {
                    'deprecated': true,
                    'type': 'string',
                  },
                  'memory': {
                    'type': 'string',
                  },
                  'platform': {
                    'type': 'string',
                  },
                  'schedule': {
                    'type': 'string',
                  },
                  'volumes': {
                    'additionalProperties': {
                      'additionalProperties': false,
                      'properties': {
                        'description': {
                          'type': 'string',
                        },
                        'host_path': {
                          'type': 'string',
                        },
                        'image': {
                          'type': 'string',
                        },
                        'mount_path': {
                          'type': 'string',
                        },
                        'readonly': {
                          'type': [
                            'boolean',
                            'string',
                          ],
                        },
                      },
                      'required': [
                        'mount_path',
                      ],
                      'type': 'object',
                    },
                    'type': 'object',
                  },
                },
                'required': [
                  'image',
                ],
                'type': 'object',
              },
              {
                'additionalProperties': false,
                'properties': {
                  'build': {
                    'additionalProperties': false,
                    'properties': {
                      'args': {
                        'additionalProperties': {
                          'type': 'string',
                        },
                        'type': 'object',
                      },
                      'context': {
                        'type': 'string',
                      },
                      'dockerfile': {
                        'type': 'string',
                      },
                      'target': {
                        'type': 'string',
                      },
                    },
                    'required': [
                      'context',
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
                  },
                  'cpu': {
                    'type': [
                      'number',
                      'string',
                    ],
                  },
                  'debug': {
                    'additionalProperties': false,
                    'properties': {
                      'build': {
                        'additionalProperties': false,
                        'properties': {
                          'args': {
                            'additionalProperties': {
                              'type': 'string',
                            },
                            'type': 'object',
                          },
                          'context': {
                            'type': 'string',
                          },
                          'dockerfile': {
                            'type': 'string',
                          },
                          'target': {
                            'type': 'string',
                          },
                        },
                        'type': 'object',
                      },
                      'command': {
                        'anyOf': [
                          {
                            'items': {
                              'type': 'string',
                            },
                            'type': 'array',
                          },
                          {
                            'type': 'string',
                          },
                        ],
                      },
                      'cpu': {
                        'type': [
                          'number',
                          'string',
                        ],
                      },
                      'entrypoint': {
                        'anyOf': [
                          {
                            'items': {
                              'type': 'string',
                            },
                            'type': 'array',
                          },
                          {
                            'type': 'string',
                          },
                        ],
                      },
                      'environment': {
                        'additionalProperties': {
                          'type': [
                            'string',
                            'number',
                          ],
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
                      'language': {
                        'type': 'string',
                      },
                      'memory': {
                        'type': 'string',
                      },
                      'platform': {
                        'type': 'string',
                      },
                      'schedule': {
                        'type': 'string',
                      },
                      'volumes': {
                        'additionalProperties': {
                          'additionalProperties': false,
                          'properties': {
                            'description': {
                              'type': 'string',
                            },
                            'host_path': {
                              'type': 'string',
                            },
                            'image': {
                              'type': 'string',
                            },
                            'mount_path': {
                              'type': 'string',
                            },
                            'readonly': {
                              'type': [
                                'boolean',
                                'string',
                              ],
                            },
                          },
                          'type': 'object',
                        },
                        'type': 'object',
                      },
                    },
                    'type': 'object',
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
                      'type': [
                        'string',
                        'number',
                      ],
                    },
                    'type': 'object',
                  },
                  'labels': {
                    'additionalProperties': {
                      'type': 'string',
                    },
                    'type': 'object',
                  },
                  'language': {
                    'deprecated': true,
                    'type': 'string',
                  },
                  'memory': {
                    'type': 'string',
                  },
                  'platform': {
                    'type': 'string',
                  },
                  'schedule': {
                    'type': 'string',
                  },
                  'volumes': {
                    'additionalProperties': {
                      'additionalProperties': false,
                      'properties': {
                        'description': {
                          'type': 'string',
                        },
                        'host_path': {
                          'type': 'string',
                        },
                        'image': {
                          'type': 'string',
                        },
                        'mount_path': {
                          'type': 'string',
                        },
                        'readonly': {
                          'type': [
                            'boolean',
                            'string',
                          ],
                        },
                      },
                      'required': [
                        'mount_path',
                      ],
                      'type': 'object',
                    },
                    'type': 'object',
                  },
                },
                'required': [
                  'build',
                ],
                'type': 'object',
              },
              {
                'additionalProperties': false,
                'properties': {
                  'build': {
                    'additionalProperties': false,
                    'properties': {
                      'args': {
                        'additionalProperties': {
                          'type': 'string',
                        },
                        'type': 'object',
                      },
                      'context': {
                        'type': 'string',
                      },
                      'dockerfile': {
                        'type': 'string',
                      },
                      'target': {
                        'type': 'string',
                      },
                    },
                    'required': [
                      'context',
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
                  },
                  'cpu': {
                    'type': [
                      'number',
                      'string',
                    ],
                  },
                  'debug': {
                    'additionalProperties': false,
                    'properties': {
                      'build': {
                        'additionalProperties': false,
                        'properties': {
                          'args': {
                            'additionalProperties': {
                              'type': 'string',
                            },
                            'type': 'object',
                          },
                          'context': {
                            'type': 'string',
                          },
                          'dockerfile': {
                            'type': 'string',
                          },
                          'target': {
                            'type': 'string',
                          },
                        },
                        'type': 'object',
                      },
                      'command': {
                        'anyOf': [
                          {
                            'items': {
                              'type': 'string',
                            },
                            'type': 'array',
                          },
                          {
                            'type': 'string',
                          },
                        ],
                      },
                      'cpu': {
                        'type': [
                          'number',
                          'string',
                        ],
                      },
                      'entrypoint': {
                        'anyOf': [
                          {
                            'items': {
                              'type': 'string',
                            },
                            'type': 'array',
                          },
                          {
                            'type': 'string',
                          },
                        ],
                      },
                      'environment': {
                        'additionalProperties': {
                          'type': [
                            'string',
                            'number',
                          ],
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
                      'language': {
                        'type': 'string',
                      },
                      'memory': {
                        'type': 'string',
                      },
                      'platform': {
                        'type': 'string',
                      },
                      'schedule': {
                        'type': 'string',
                      },
                      'volumes': {
                        'additionalProperties': {
                          'additionalProperties': false,
                          'properties': {
                            'description': {
                              'type': 'string',
                            },
                            'host_path': {
                              'type': 'string',
                            },
                            'image': {
                              'type': 'string',
                            },
                            'mount_path': {
                              'type': 'string',
                            },
                            'readonly': {
                              'type': [
                                'boolean',
                                'string',
                              ],
                            },
                          },
                          'type': 'object',
                        },
                        'type': 'object',
                      },
                    },
                    'type': 'object',
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
                      'type': [
                        'string',
                        'number',
                      ],
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
                  'language': {
                    'deprecated': true,
                    'type': 'string',
                  },
                  'memory': {
                    'type': 'string',
                  },
                  'platform': {
                    'type': 'string',
                  },
                  'schedule': {
                    'type': 'string',
                  },
                  'volumes': {
                    'additionalProperties': {
                      'additionalProperties': false,
                      'properties': {
                        'description': {
                          'type': 'string',
                        },
                        'host_path': {
                          'type': 'string',
                        },
                        'image': {
                          'type': 'string',
                        },
                        'mount_path': {
                          'type': 'string',
                        },
                        'readonly': {
                          'type': [
                            'boolean',
                            'string',
                          ],
                        },
                      },
                      'required': [
                        'mount_path',
                      ],
                      'type': 'object',
                    },
                    'type': 'object',
                  },
                },
                'required': [
                  'build',
                  'image',
                ],
                'type': 'object',
              },
            ],
          },
          'description':
            'A set of scheduled and triggerable tasks that get registered alongside the component. Tasks are great for data translation, reporting, and much more.',
          'type': 'object',
        },
        'variables': {
          'additionalProperties': {
            'anyOf': [
              {
                'type': 'string',
              },
              {
                'additionalProperties': false,
                'properties': {
                  'default': {
                    'description':
                      'The default value to apply to the parameter when one wasn\'t provided by the operator',
                    'type': [
                      'string',
                      'number',
                    ],
                  },
                  'description': {
                    'description':
                      'A human-readable description of the parameter, how it should be used, and what kinds of values it supports.',
                    'type': 'string',
                  },
                  'merge': {
                    'default': false,
                    'description': 'Whether or not to merge results from multiple sources into a single array',
                    'type': 'boolean',
                  },
                  'required': {
                    'default': false,
                    'description': 'A boolean indicating whether or not an operator is required ot provide a value',
                    'type': 'boolean',
                  },
                },
                'type': 'object',
              },
            ],
          },
          'description':
            'A dictionary of named parameters that this component uses to configure services.\n\nParameters can either be an object describing the parameter or a string shorthand that directly applies to the `default` value.\n\nThis is an alias for the `parameters` field.',
          'type': 'object',
        },
        'version': {
          'const': 'v1',
          'type': 'string',
        },
      },
      'required': [
        'version',
      ],
      'type': 'object',
    },
    {
      'additionalProperties': false,
      'properties': {
        'builds': {
          'additionalProperties': {
            'additionalProperties': false,
            'properties': {
              'args': {
                'additionalProperties': {
                  'type': 'string',
                },
                'description': 'A set of arguments to pass to the build job',
                'examples': [
                  {
                    'BUILDKIT_INLINE_CACHE': '1',
                  },
                ],
                'type': 'object',
              },
              'context': {
                'description': 'Path to the folder containing the code to build',
                'examples': [
                  './',
                ],
                'type': 'string',
              },
              'debug': {
                'additionalProperties': false,
                'description': 'Debugging options for the build step',
                'properties': {
                  'args': {
                    'additionalProperties': {
                      'type': 'string',
                    },
                    'description': 'A set of arguments to pass to the build job',
                    'examples': [
                      {
                        'BUILDKIT_INLINE_CACHE': '1',
                      },
                    ],
                    'type': 'object',
                  },
                  'context': {
                    'description': 'Path to the folder containing the code to build',
                    'examples': [
                      './',
                    ],
                    'type': 'string',
                  },
                  'description': {
                    'description': 'Description of the build artifact',
                    'examples': [
                      'Builds the source code for the application',
                    ],
                    'type': 'string',
                  },
                  'dockerfile': {
                    'default': 'Dockerfile',
                    'description': 'The path to the dockerfile defining this build step',
                    'type': 'string',
                  },
                  'image': {
                    'description':
                      'The resulting image that was created once the build is complete. This will change whenever the component is tagged as well.',
                    'examples': [
                      'my-registry.com/my-app:latest',
                    ],
                    'type': 'string',
                  },
                  'target': {
                    'description': 'The docker target to use during the build process',
                    'examples': [
                      'builder',
                    ],
                    'type': 'string',
                  },
                },
                'type': 'object',
              },
              'description': {
                'description': 'Description of the build artifact',
                'examples': [
                  'Builds the source code for the application',
                ],
                'type': 'string',
              },
              'dockerfile': {
                'default': 'Dockerfile',
                'description': 'The path to the dockerfile defining this build step',
                'type': 'string',
              },
              'image': {
                'description':
                  'The resulting image that was created once the build is complete. This will change whenever the component is tagged as well.',
                'examples': [
                  'my-registry.com/my-app:latest',
                ],
                'type': 'string',
              },
              'target': {
                'description': 'The docker target to use during the build process',
                'examples': [
                  'builder',
                ],
                'type': 'string',
              },
            },
            'required': [
              'context',
            ],
            'type': 'object',
          },
          'description': 'A set of build jobs to run to power other deployments or tasks',
          'type': 'object',
        },
        'databases': {
          'additionalProperties': {
            'additionalProperties': false,
            'properties': {
              'description': {
                'default': '',
                'description': 'A human-readable description of the use-case for the database',
                'type': 'string',
              },
              'migrate': {
                'additionalProperties': false,
                'description': 'Configuration details for how to run database migrations',
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
                    'description': 'A command to run in the container to execute the migration',
                    'examples': [
                      [
                        'npm',
                        'run',
                        'migrate',
                      ],
                    ],
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
                    'default': [
                      '',
                    ],
                    'description': 'An entrypoint to use for the docker container',
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
                    'description': 'Environment variables to set in the container',
                    'examples': [
                      {
                        'DATABASE_URL': '${{ databases.auth.url }}',
                      },
                    ],
                    'type': 'object',
                  },
                  'image': {
                    'description': 'The docker image containing the migration tooling and files',
                    'examples': [
                      '${{ builds.api.image }}',
                    ],
                    'type': 'string',
                  },
                },
                'required': [
                  'image',
                ],
                'type': 'object',
              },
              'seed': {
                'additionalProperties': false,
                'description': 'Configuration details for how to seed the database',
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
                    'description': 'A command to run in the container to execute the seeding',
                    'examples': [
                      [
                        'npm',
                        'run',
                        'seed',
                      ],
                    ],
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
                    'default': [
                      '',
                    ],
                    'description': 'An entrypoint to use for the docker container',
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
                    'description': 'Environment variables to set in the container',
                    'examples': [
                      {
                        'DATABASE_URL': '${{ databases.auth.url }}',
                      },
                    ],
                    'type': 'object',
                  },
                  'image': {
                    'description': 'The docker image containing the seeding tooling and files',
                    'examples': [
                      '${{ builds.api.image }}',
                    ],
                    'type': 'string',
                  },
                },
                'required': [
                  'image',
                ],
                'type': 'object',
              },
              'type': {
                'description': 'The type of database and version to use',
                'examples': [
                  'postgres:15',
                  'mysql:8',
                  'redis:5',
                ],
                'type': 'string',
              },
            },
            'required': [
              'type',
            ],
            'type': 'object',
          },
          'description': 'A set of databases that this component requires',
          'type': 'object',
        },
        'dependencies': {
          'additionalProperties': {
            'anyOf': [
              {
                'type': 'string',
              },
              {
                'additionalProperties': false,
                'properties': {
                  'component': {
                    'description': 'The repo the component is in',
                    'type': 'string',
                  },
                  'variables': {
                    'additionalProperties': {
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
                    'description': 'Input values to provide to the component if `merge` is turned on',
                    'examples': [
                      {
                        'allowed_return_urls': [
                          'https://architect.io',
                          '${{ ingresses.frontend.url }}',
                        ],
                      },
                    ],
                    'type': 'object',
                  },
                },
                'required': [
                  'component',
                ],
                'type': 'object',
              },
            ],
          },
          'description': 'A set of other components that this component depends on',
          'examples': [
            {
              'auth': {
                'component': 'architect/auth-component',
                'variables': {
                  'allowed_return_urls': [
                    'https://architect.io',
                    '${{ ingresses.frontend.url }}',
                  ],
                },
              },
              'payments': 'architect/payments-component',
            },
          ],
          'type': 'object',
        },
        'deployments': {
          'additionalProperties': {
            'additionalProperties': false,
            'properties': {
              'autoscaling': {
                'additionalProperties': false,
                'description': 'Configuration settings for how to automatically scale the application up and down',
                'properties': {
                  'cpu': {
                    'description': 'Maximum number of CPUs to allocate to each replica',
                    'examples': [
                      '0.5',
                      '1',
                    ],
                    'type': [
                      'number',
                      'string',
                    ],
                  },
                  'memory': {
                    'description': 'Maximum memory usage per replica before scaling up',
                    'examples': [
                      '200Mi',
                      '2Gi',
                    ],
                    'type': 'string',
                  },
                },
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
                'description': 'Command to use when the container is booted up',
                'examples': [
                  [
                    'npm',
                    'start',
                  ],
                ],
              },
              'cpu': {
                'description': 'The amount of CPU to allocate to each instance of the deployment',
                'type': [
                  'number',
                  'string',
                ],
              },
              'debug': {
                'additionalProperties': false,
                'description': 'Debugging options for the deployment',
                'properties': {
                  'autoscaling': {
                    'additionalProperties': false,
                    'description': 'Configuration settings for how to automatically scale the application up and down',
                    'properties': {
                      'cpu': {
                        'description': 'Maximum number of CPUs to allocate to each replica',
                        'examples': [
                          '0.5',
                          '1',
                        ],
                        'type': [
                          'number',
                          'string',
                        ],
                      },
                      'memory': {
                        'description': 'Maximum memory usage per replica before scaling up',
                        'examples': [
                          '200Mi',
                          '2Gi',
                        ],
                        'type': 'string',
                      },
                    },
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
                    'description': 'Command to use when the container is booted up',
                    'examples': [
                      [
                        'npm',
                        'start',
                      ],
                    ],
                  },
                  'cpu': {
                    'description': 'The amount of CPU to allocate to each instance of the deployment',
                    'type': [
                      'number',
                      'string',
                    ],
                  },
                  'description': {
                    'description': 'Human readable description of the deployment',
                    'examples': [
                      'Runs the frontend web application',
                    ],
                    'type': 'string',
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
                    'default': [
                      '',
                    ],
                    'description': 'The executable to run every time the container is booted up',
                  },
                  'environment': {
                    'additionalProperties': {
                      'type': 'string',
                    },
                    'description': 'Environment variables to pass to the service',
                    'examples': [
                      {
                        'NODE_ENV': 'production',
                      },
                      {
                        'BACKEND_URL': '${{ ingresses.backend.url }}',
                      },
                    ],
                    'type': 'object',
                  },
                  'image': {
                    'description': 'Docker image to use for the deployment',
                    'examples': [
                      '${{ builds.frontend.image }}',
                      'my-registry.com/my-app:latest',
                    ],
                    'type': 'string',
                  },
                  'labels': {
                    'additionalProperties': {
                      'type': 'string',
                    },
                    'description': 'The labels to apply to the deployment',
                    'type': 'object',
                  },
                  'memory': {
                    'description': 'The amount of memory to allocate to each instance of the deployment',
                    'type': 'string',
                  },
                  'platform': {
                    'description': 'Set platform if server is multi-platform capable',
                    'examples': [
                      'linux/amd64',
                    ],
                    'type': 'string',
                  },
                  'probes': {
                    'additionalProperties': false,
                    'description': 'Configuration details for probes that check each replicas status',
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
                        'description':
                          'Configuration settings to determine if the deployment is ready to receive traffic',
                      },
                    },
                    'type': 'object',
                  },
                  'volumes': {
                    'additionalProperties': {
                      'additionalProperties': false,
                      'properties': {
                        'host_path': {
                          'description': 'Path on the host machine to sync with the volume',
                          'examples': [
                            '/Users/batman/app/src',
                          ],
                          'type': 'string',
                        },
                        'image': {
                          'description': 'OCI image containing the contents to seed the volume with',
                          'type': 'string',
                        },
                        'mount_path': {
                          'description': 'Path inside the container to mount the volume to',
                          'examples': [
                            '/app/src',
                          ],
                          'type': 'string',
                        },
                      },
                      'required': [
                        'mount_path',
                      ],
                      'type': 'object',
                    },
                    'description': 'Volumes that should be created and attached to each replica',
                    'type': 'object',
                  },
                },
                'type': 'object',
              },
              'description': {
                'description': 'Human readable description of the deployment',
                'examples': [
                  'Runs the frontend web application',
                ],
                'type': 'string',
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
                'default': [
                  '',
                ],
                'description': 'The executable to run every time the container is booted up',
              },
              'environment': {
                'additionalProperties': {
                  'type': 'string',
                },
                'description': 'Environment variables to pass to the service',
                'examples': [
                  {
                    'NODE_ENV': 'production',
                  },
                  {
                    'BACKEND_URL': '${{ ingresses.backend.url }}',
                  },
                ],
                'type': 'object',
              },
              'image': {
                'description': 'Docker image to use for the deployment',
                'examples': [
                  '${{ builds.frontend.image }}',
                  'my-registry.com/my-app:latest',
                ],
                'type': 'string',
              },
              'labels': {
                'additionalProperties': {
                  'type': 'string',
                },
                'description': 'The labels to apply to the deployment',
                'type': 'object',
              },
              'memory': {
                'description': 'The amount of memory to allocate to each instance of the deployment',
                'type': 'string',
              },
              'platform': {
                'description': 'Set platform if server is multi-platform capable',
                'examples': [
                  'linux/amd64',
                ],
                'type': 'string',
              },
              'probes': {
                'additionalProperties': false,
                'description': 'Configuration details for probes that check each replicas status',
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
                    'description': 'Configuration settings to determine if the deployment is ready to receive traffic',
                  },
                },
                'type': 'object',
              },
              'volumes': {
                'additionalProperties': {
                  'additionalProperties': false,
                  'properties': {
                    'host_path': {
                      'description': 'Path on the host machine to sync with the volume',
                      'examples': [
                        '/Users/batman/app/src',
                      ],
                      'type': 'string',
                    },
                    'image': {
                      'description': 'OCI image containing the contents to seed the volume with',
                      'type': 'string',
                    },
                    'mount_path': {
                      'description': 'Path inside the container to mount the volume to',
                      'examples': [
                        '/app/src',
                      ],
                      'type': 'string',
                    },
                  },
                  'required': [
                    'mount_path',
                  ],
                  'type': 'object',
                },
                'description': 'Volumes that should be created and attached to each replica',
                'type': 'object',
              },
            },
            'required': [
              'image',
            ],
            'type': 'object',
          },
          'description': 'Workloads that should be deployed',
          'type': 'object',
        },
        'ingresses': {
          'additionalProperties': {
            'additionalProperties': false,
            'properties': {
              'headers': {
                'additionalProperties': {
                  'type': 'string',
                },
                'description': 'Additional headers to include in responses',
                'examples': [
                  {
                    'Access-Control-Allow-Credentials': 'true',
                    'Access-Control-Allow-Origin': '${{ variables.allowed_return_urls }}',
                  },
                ],
                'type': 'object',
              },
              'internal': {
                'default': false,
                'description': 'Whether or not the ingress rule should be attached to an internal gateway',
                'type': 'boolean',
              },
              'service': {
                'description': 'Service the ingress rule forwards traffic to',
                'examples': [
                  'backend',
                ],
                'type': 'string',
              },
            },
            'required': [
              'service',
            ],
            'type': 'object',
          },
          'description': 'Claims for external (e.g. client) access to a service',
          'type': 'object',
        },
        'services': {
          'additionalProperties': {
            'additionalProperties': false,
            'properties': {
              'deployment': {
                'description': 'Deployment the service sends requests to',
                'examples': [
                  'backend',
                ],
                'type': 'string',
              },
              'description': {
                'description': 'Description of the service',
                'examples': [
                  'Exposes the backend to other applications',
                ],
                'type': 'string',
              },
              'password': {
                'description': 'Basic auth password',
                'type': 'string',
              },
              'port': {
                'description': 'Port the service listens on',
                'examples': [
                  8080,
                ],
                'type': 'number',
              },
              'protocol': {
                'default': 'http',
                'description': 'Protocol the service listens on',
                'type': 'string',
              },
              'username': {
                'description': 'Basic auth username',
                'type': 'string',
              },
            },
            'required': [
              'deployment',
              'port',
            ],
            'type': 'object',
          },
          'description': 'Services that can receive network traffic',
          'type': 'object',
        },
        'variables': {
          'additionalProperties': {
            'additionalProperties': false,
            'properties': {
              'default': {
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
                'description': 'A default value to use if one isn\'t provided',
                'examples': [
                  'https://architect.io',
                ],
              },
              'description': {
                'description': 'A human-readable description',
                'examples': [
                  'API key used to authenticate with Stripe',
                ],
                'type': 'string',
              },
              'merge': {
                'default': false,
                'description':
                  'If true, upstream components can pass in values that will be merged together with each other and environment-provided values',
                'type': 'boolean',
              },
              'required': {
                'default': false,
                'description': 'If true, a value is required or the component won\'t run.',
                'type': 'boolean',
              },
              'sensitive': {
                'default': false,
                'description': 'Whether or not the data should be considered sensitive and stripped from logs',
                'type': 'boolean',
              },
            },
            'type': 'object',
          },
          'description': 'A set of inputs the component expects to be provided',
          'type': 'object',
        },
        'version': {
          'const': 'v2',
          'type': 'string',
        },
      },
      'required': [
        'version',
      ],
      'type': 'object',
    },
  ],
  '$schema': 'https://json-schema.org/draft/2019-09/schema',
  '$id': 'https://architect.io/.schemas/component.json',
  'type': 'object',
  'required': [
    'version',
  ],
  'discriminator': {
    'propertyName': 'version',
  },
};
