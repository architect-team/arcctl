export default {
  '$ref': '#/definitions/DatacenterSchema',
  '$schema': 'http://json-schema.org/draft-07/schema#',
  'definitions': {
    'DatacenterSchema': {
      'additionalProperties': false,
      'properties': {
        'environment': {
          'description':
            'Rules dictating what resources should be created in each environment hosted by the datacenter',
          'items': {
            'additionalProperties': false,
            'properties': {
              'cronjob': {
                'items': {
                  'additionalProperties': false,
                  'properties': {
                    'module': {
                      'additionalProperties': {
                        'items': {
                          'additionalProperties': false,
                          'properties': {
                            'build': {
                              'description': 'The path to a module that will be built during the build step.',
                              'examples': [
                                './my-module',
                              ],
                              'type': 'string',
                            },
                            'environment': {
                              'additionalProperties': {
                                'type': 'string',
                              },
                              'description':
                                'Environment variables that should be provided to the container executing the module',
                              'examples': [
                                {
                                  'MY_ENV_VAR': 'my-value',
                                },
                              ],
                              'type': 'object',
                            },
                            'inputs': {
                              'anyOf': [
                                {
                                  'additionalProperties': {},
                                  'type': 'object',
                                },
                                {
                                  'type': 'string',
                                },
                              ],
                              'description': 'Input values for the module.',
                              'examples': [
                                {
                                  'image': 'nginx:latest',
                                  'port': 8080,
                                },
                              ],
                            },
                            'plugin': {
                              'default': 'pulumi',
                              'description': 'The plugin used to build the module. Defaults to pulumi.',
                              'enum': [
                                'pulumi',
                                'opentofu',
                              ],
                              'examples': [
                                'opentofu',
                              ],
                              'type': 'string',
                            },
                            'source': {
                              'description': 'The image source of the module.',
                              'examples': [
                                'my-registry.com/my-image:latest',
                              ],
                              'type': 'string',
                            },
                            'volume': {
                              'description': 'Volumes that should be mounted to the container executing the module',
                              'items': {
                                'additionalProperties': false,
                                'properties': {
                                  'host_path': {
                                    'description': 'The path on the host machine to mount to the container',
                                    'examples': [
                                      '/Users/batman/my-volume',
                                    ],
                                    'type': 'string',
                                  },
                                  'mount_path': {
                                    'description': 'The path in the container to mount the volume to',
                                    'examples': [
                                      '/app/my-volume',
                                    ],
                                    'type': 'string',
                                  },
                                },
                                'required': [
                                  'host_path',
                                  'mount_path',
                                ],
                                'type': 'object',
                              },
                              'type': 'array',
                            },
                            'when': {
                              'description':
                                'A condition that restricts when the module should be created. Must resolve to a boolean.',
                              'examples': [
                                'node.type == \'database\' && node.inputs.databaseType == \'postgres\'',
                                'contains(environment.nodes.*.inputs.databaseType, \'postgres\')',
                              ],
                              'type': 'string',
                            },
                          },
                          'required': [
                            'inputs',
                          ],
                          'type': 'object',
                        },
                        'type': 'array',
                      },
                      'description': 'Modules that will be created once per matching application resource',
                      'type': 'object',
                    },
                    'outputs': {
                      'additionalProperties': {},
                      'description': 'A map of output values to be passed to upstream application resources',
                      'examples': [
                        {
                          'host': '${module.database.host}',
                          'id': '${module.database.id}',
                          'password': '${module.database.password}',
                          'port': '${module.database.port}',
                          'username': '${module.database.username}',
                        },
                      ],
                      'type': 'object',
                    },
                    'when': {
                      'description':
                        'A condition that restricts when the hook should be active. Must resolve to a boolean.',
                      'examples': [
                        'node.type == \'database\' && node.inputs.databaseType == \'postgres\'',
                        'contains(environment.nodes.*.inputs.databaseType, \'postgres\')',
                      ],
                      'type': 'string',
                    },
                  },
                  'type': 'object',
                },
                'type': 'array',
              },
              'database': {
                'items': {
                  'additionalProperties': false,
                  'properties': {
                    'module': {
                      'additionalProperties': {
                        'items': {
                          'additionalProperties': false,
                          'properties': {
                            'build': {
                              'description': 'The path to a module that will be built during the build step.',
                              'examples': [
                                './my-module',
                              ],
                              'type': 'string',
                            },
                            'environment': {
                              'additionalProperties': {
                                'type': 'string',
                              },
                              'description':
                                'Environment variables that should be provided to the container executing the module',
                              'examples': [
                                {
                                  'MY_ENV_VAR': 'my-value',
                                },
                              ],
                              'type': 'object',
                            },
                            'inputs': {
                              'anyOf': [
                                {
                                  'additionalProperties': {},
                                  'type': 'object',
                                },
                                {
                                  'type': 'string',
                                },
                              ],
                              'description': 'Input values for the module.',
                              'examples': [
                                {
                                  'image': 'nginx:latest',
                                  'port': 8080,
                                },
                              ],
                            },
                            'plugin': {
                              'default': 'pulumi',
                              'description': 'The plugin used to build the module. Defaults to pulumi.',
                              'enum': [
                                'pulumi',
                                'opentofu',
                              ],
                              'examples': [
                                'opentofu',
                              ],
                              'type': 'string',
                            },
                            'source': {
                              'description': 'The image source of the module.',
                              'examples': [
                                'my-registry.com/my-image:latest',
                              ],
                              'type': 'string',
                            },
                            'volume': {
                              'description': 'Volumes that should be mounted to the container executing the module',
                              'items': {
                                'additionalProperties': false,
                                'properties': {
                                  'host_path': {
                                    'description': 'The path on the host machine to mount to the container',
                                    'examples': [
                                      '/Users/batman/my-volume',
                                    ],
                                    'type': 'string',
                                  },
                                  'mount_path': {
                                    'description': 'The path in the container to mount the volume to',
                                    'examples': [
                                      '/app/my-volume',
                                    ],
                                    'type': 'string',
                                  },
                                },
                                'required': [
                                  'host_path',
                                  'mount_path',
                                ],
                                'type': 'object',
                              },
                              'type': 'array',
                            },
                            'when': {
                              'description':
                                'A condition that restricts when the module should be created. Must resolve to a boolean.',
                              'examples': [
                                'node.type == \'database\' && node.inputs.databaseType == \'postgres\'',
                                'contains(environment.nodes.*.inputs.databaseType, \'postgres\')',
                              ],
                              'type': 'string',
                            },
                          },
                          'required': [
                            'inputs',
                          ],
                          'type': 'object',
                        },
                        'type': 'array',
                      },
                      'description': 'Modules that will be created once per matching application resource',
                      'type': 'object',
                    },
                    'outputs': {
                      'additionalProperties': false,
                      'description': 'A map of output values to be passed to upstream application resources',
                      'examples': [
                        {
                          'host': '${module.database.host}',
                          'id': '${module.database.id}',
                          'password': '${module.database.password}',
                          'port': '${module.database.port}',
                          'username': '${module.database.username}',
                        },
                      ],
                      'properties': {
                        'certificate': {
                          'description': 'SSL certificate used to authenticate with the database',
                          'type': 'string',
                        },
                        'database': {
                          'description': 'Name of the new database schema',
                          'examples': [
                            'my-schema',
                          ],
                          'type': 'string',
                        },
                        'host': {
                          'description': 'Host address of the underlying database',
                          'examples': [
                            'my-database.example.com',
                          ],
                          'type': 'string',
                        },
                        'password': {
                          'description': 'Passowrd used to authenticate with the schema',
                          'examples': [
                            'pass',
                          ],
                          'type': 'string',
                        },
                        'port': {
                          'description': 'Port the underlying database listens on',
                          'examples': [
                            5432,
                          ],
                          'type': [
                            'string',
                            'number',
                          ],
                        },
                        'protocol': {
                          'description': 'Protocol of the underlying database',
                          'examples': [
                            'postgresql',
                          ],
                          'type': 'string',
                        },
                        'url': {
                          'description': 'Full connection string for the database',
                          'examples': [
                            'postgresql://user:pass@my-database.example.com:5432/my-schema',
                          ],
                          'type': 'string',
                        },
                        'username': {
                          'description': 'Username used to authenticate with the schema',
                          'examples': [
                            'user',
                          ],
                          'type': 'string',
                        },
                      },
                      'required': [
                        'protocol',
                        'host',
                        'port',
                        'database',
                        'url',
                        'username',
                        'password',
                      ],
                      'type': 'object',
                    },
                    'when': {
                      'description':
                        'A condition that restricts when the hook should be active. Must resolve to a boolean.',
                      'examples': [
                        'node.type == \'database\' && node.inputs.databaseType == \'postgres\'',
                        'contains(environment.nodes.*.inputs.databaseType, \'postgres\')',
                      ],
                      'type': 'string',
                    },
                  },
                  'type': 'object',
                },
                'type': 'array',
              },
              'databaseUser': {
                'items': {
                  'additionalProperties': false,
                  'properties': {
                    'module': {
                      'additionalProperties': {
                        'items': {
                          'additionalProperties': false,
                          'properties': {
                            'build': {
                              'description': 'The path to a module that will be built during the build step.',
                              'examples': [
                                './my-module',
                              ],
                              'type': 'string',
                            },
                            'environment': {
                              'additionalProperties': {
                                'type': 'string',
                              },
                              'description':
                                'Environment variables that should be provided to the container executing the module',
                              'examples': [
                                {
                                  'MY_ENV_VAR': 'my-value',
                                },
                              ],
                              'type': 'object',
                            },
                            'inputs': {
                              'anyOf': [
                                {
                                  'additionalProperties': {},
                                  'type': 'object',
                                },
                                {
                                  'type': 'string',
                                },
                              ],
                              'description': 'Input values for the module.',
                              'examples': [
                                {
                                  'image': 'nginx:latest',
                                  'port': 8080,
                                },
                              ],
                            },
                            'plugin': {
                              'default': 'pulumi',
                              'description': 'The plugin used to build the module. Defaults to pulumi.',
                              'enum': [
                                'pulumi',
                                'opentofu',
                              ],
                              'examples': [
                                'opentofu',
                              ],
                              'type': 'string',
                            },
                            'source': {
                              'description': 'The image source of the module.',
                              'examples': [
                                'my-registry.com/my-image:latest',
                              ],
                              'type': 'string',
                            },
                            'volume': {
                              'description': 'Volumes that should be mounted to the container executing the module',
                              'items': {
                                'additionalProperties': false,
                                'properties': {
                                  'host_path': {
                                    'description': 'The path on the host machine to mount to the container',
                                    'examples': [
                                      '/Users/batman/my-volume',
                                    ],
                                    'type': 'string',
                                  },
                                  'mount_path': {
                                    'description': 'The path in the container to mount the volume to',
                                    'examples': [
                                      '/app/my-volume',
                                    ],
                                    'type': 'string',
                                  },
                                },
                                'required': [
                                  'host_path',
                                  'mount_path',
                                ],
                                'type': 'object',
                              },
                              'type': 'array',
                            },
                            'when': {
                              'description':
                                'A condition that restricts when the module should be created. Must resolve to a boolean.',
                              'examples': [
                                'node.type == \'database\' && node.inputs.databaseType == \'postgres\'',
                                'contains(environment.nodes.*.inputs.databaseType, \'postgres\')',
                              ],
                              'type': 'string',
                            },
                          },
                          'required': [
                            'inputs',
                          ],
                          'type': 'object',
                        },
                        'type': 'array',
                      },
                      'description': 'Modules that will be created once per matching application resource',
                      'type': 'object',
                    },
                    'outputs': {
                      'additionalProperties': false,
                      'description': 'A map of output values to be passed to upstream application resources',
                      'examples': [
                        {
                          'host': '${module.database.host}',
                          'id': '${module.database.id}',
                          'password': '${module.database.password}',
                          'port': '${module.database.port}',
                          'username': '${module.database.username}',
                        },
                      ],
                      'properties': {
                        'certificate': {
                          'description': 'The certificate used to connect to the database',
                          'type': 'string',
                        },
                        'database': {
                          'description': 'The name of the database to connect to',
                          'examples': [
                            'database',
                          ],
                          'type': 'string',
                        },
                        'host': {
                          'description': 'The host the database listens on',
                          'examples': [
                            'rds.amazonwebservices.com/abc123',
                          ],
                          'type': 'string',
                        },
                        'password': {
                          'description': 'Password used to authenticate with the database',
                          'examples': [
                            'password',
                          ],
                          'type': 'string',
                        },
                        'port': {
                          'description': 'The port the database listens on',
                          'examples': [
                            5432,
                          ],
                          'type': [
                            'number',
                            'string',
                          ],
                        },
                        'protocol': {
                          'description': 'The protocol the database responds to',
                          'examples': [
                            'postgresql',
                          ],
                          'type': 'string',
                        },
                        'url': {
                          'description': 'Fully resolvable URL used to connect to the database',
                          'examples': [
                            'postgresql://admin:password@rds.amazonwebservices.com:5432/database',
                          ],
                          'type': 'string',
                        },
                        'username': {
                          'description': 'Username used to authenticate with the database',
                          'examples': [
                            'admin',
                          ],
                          'type': 'string',
                        },
                      },
                      'required': [
                        'protocol',
                        'host',
                        'port',
                        'database',
                        'username',
                        'password',
                        'url',
                      ],
                      'type': 'object',
                    },
                    'when': {
                      'description':
                        'A condition that restricts when the hook should be active. Must resolve to a boolean.',
                      'examples': [
                        'node.type == \'database\' && node.inputs.databaseType == \'postgres\'',
                        'contains(environment.nodes.*.inputs.databaseType, \'postgres\')',
                      ],
                      'type': 'string',
                    },
                  },
                  'type': 'object',
                },
                'type': 'array',
              },
              'deployment': {
                'items': {
                  'additionalProperties': false,
                  'properties': {
                    'module': {
                      'additionalProperties': {
                        'items': {
                          'additionalProperties': false,
                          'properties': {
                            'build': {
                              'description': 'The path to a module that will be built during the build step.',
                              'examples': [
                                './my-module',
                              ],
                              'type': 'string',
                            },
                            'environment': {
                              'additionalProperties': {
                                'type': 'string',
                              },
                              'description':
                                'Environment variables that should be provided to the container executing the module',
                              'examples': [
                                {
                                  'MY_ENV_VAR': 'my-value',
                                },
                              ],
                              'type': 'object',
                            },
                            'inputs': {
                              'anyOf': [
                                {
                                  'additionalProperties': {},
                                  'type': 'object',
                                },
                                {
                                  'type': 'string',
                                },
                              ],
                              'description': 'Input values for the module.',
                              'examples': [
                                {
                                  'image': 'nginx:latest',
                                  'port': 8080,
                                },
                              ],
                            },
                            'plugin': {
                              'default': 'pulumi',
                              'description': 'The plugin used to build the module. Defaults to pulumi.',
                              'enum': [
                                'pulumi',
                                'opentofu',
                              ],
                              'examples': [
                                'opentofu',
                              ],
                              'type': 'string',
                            },
                            'source': {
                              'description': 'The image source of the module.',
                              'examples': [
                                'my-registry.com/my-image:latest',
                              ],
                              'type': 'string',
                            },
                            'volume': {
                              'description': 'Volumes that should be mounted to the container executing the module',
                              'items': {
                                'additionalProperties': false,
                                'properties': {
                                  'host_path': {
                                    'description': 'The path on the host machine to mount to the container',
                                    'examples': [
                                      '/Users/batman/my-volume',
                                    ],
                                    'type': 'string',
                                  },
                                  'mount_path': {
                                    'description': 'The path in the container to mount the volume to',
                                    'examples': [
                                      '/app/my-volume',
                                    ],
                                    'type': 'string',
                                  },
                                },
                                'required': [
                                  'host_path',
                                  'mount_path',
                                ],
                                'type': 'object',
                              },
                              'type': 'array',
                            },
                            'when': {
                              'description':
                                'A condition that restricts when the module should be created. Must resolve to a boolean.',
                              'examples': [
                                'node.type == \'database\' && node.inputs.databaseType == \'postgres\'',
                                'contains(environment.nodes.*.inputs.databaseType, \'postgres\')',
                              ],
                              'type': 'string',
                            },
                          },
                          'required': [
                            'inputs',
                          ],
                          'type': 'object',
                        },
                        'type': 'array',
                      },
                      'description': 'Modules that will be created once per matching application resource',
                      'type': 'object',
                    },
                    'outputs': {
                      'additionalProperties': false,
                      'description': 'A map of output values to be passed to upstream application resources',
                      'examples': [
                        {
                          'host': '${module.database.host}',
                          'id': '${module.database.id}',
                          'password': '${module.database.password}',
                          'port': '${module.database.port}',
                          'username': '${module.database.username}',
                        },
                      ],
                      'properties': {
                        'labels': {
                          'additionalProperties': {
                            'type': 'string',
                          },
                          'description': 'A set of labels that were used to annotate the cloud resource',
                          'examples': [
                            {
                              'app.kubernetes.io/name': 'my-app',
                            },
                          ],
                          'type': 'object',
                        },
                      },
                      'type': 'object',
                    },
                    'when': {
                      'description':
                        'A condition that restricts when the hook should be active. Must resolve to a boolean.',
                      'examples': [
                        'node.type == \'database\' && node.inputs.databaseType == \'postgres\'',
                        'contains(environment.nodes.*.inputs.databaseType, \'postgres\')',
                      ],
                      'type': 'string',
                    },
                  },
                  'type': 'object',
                },
                'type': 'array',
              },
              'dockerBuild': {
                'items': {
                  'additionalProperties': false,
                  'properties': {
                    'module': {
                      'additionalProperties': {
                        'items': {
                          'additionalProperties': false,
                          'properties': {
                            'build': {
                              'description': 'The path to a module that will be built during the build step.',
                              'examples': [
                                './my-module',
                              ],
                              'type': 'string',
                            },
                            'environment': {
                              'additionalProperties': {
                                'type': 'string',
                              },
                              'description':
                                'Environment variables that should be provided to the container executing the module',
                              'examples': [
                                {
                                  'MY_ENV_VAR': 'my-value',
                                },
                              ],
                              'type': 'object',
                            },
                            'inputs': {
                              'anyOf': [
                                {
                                  'additionalProperties': {},
                                  'type': 'object',
                                },
                                {
                                  'type': 'string',
                                },
                              ],
                              'description': 'Input values for the module.',
                              'examples': [
                                {
                                  'image': 'nginx:latest',
                                  'port': 8080,
                                },
                              ],
                            },
                            'plugin': {
                              'default': 'pulumi',
                              'description': 'The plugin used to build the module. Defaults to pulumi.',
                              'enum': [
                                'pulumi',
                                'opentofu',
                              ],
                              'examples': [
                                'opentofu',
                              ],
                              'type': 'string',
                            },
                            'source': {
                              'description': 'The image source of the module.',
                              'examples': [
                                'my-registry.com/my-image:latest',
                              ],
                              'type': 'string',
                            },
                            'volume': {
                              'description': 'Volumes that should be mounted to the container executing the module',
                              'items': {
                                'additionalProperties': false,
                                'properties': {
                                  'host_path': {
                                    'description': 'The path on the host machine to mount to the container',
                                    'examples': [
                                      '/Users/batman/my-volume',
                                    ],
                                    'type': 'string',
                                  },
                                  'mount_path': {
                                    'description': 'The path in the container to mount the volume to',
                                    'examples': [
                                      '/app/my-volume',
                                    ],
                                    'type': 'string',
                                  },
                                },
                                'required': [
                                  'host_path',
                                  'mount_path',
                                ],
                                'type': 'object',
                              },
                              'type': 'array',
                            },
                            'when': {
                              'description':
                                'A condition that restricts when the module should be created. Must resolve to a boolean.',
                              'examples': [
                                'node.type == \'database\' && node.inputs.databaseType == \'postgres\'',
                                'contains(environment.nodes.*.inputs.databaseType, \'postgres\')',
                              ],
                              'type': 'string',
                            },
                          },
                          'required': [
                            'inputs',
                          ],
                          'type': 'object',
                        },
                        'type': 'array',
                      },
                      'description': 'Modules that will be created once per matching application resource',
                      'type': 'object',
                    },
                    'outputs': {
                      'additionalProperties': false,
                      'description': 'A map of output values to be passed to upstream application resources',
                      'examples': [
                        {
                          'host': '${module.database.host}',
                          'id': '${module.database.id}',
                          'password': '${module.database.password}',
                          'port': '${module.database.port}',
                          'username': '${module.database.username}',
                        },
                      ],
                      'properties': {
                        'image': {
                          'description': 'The resulting image address of the built artifact',
                          'examples': [
                            'registry.architect.io/my-component:latest',
                          ],
                          'type': 'string',
                        },
                      },
                      'required': [
                        'image',
                      ],
                      'type': 'object',
                    },
                    'when': {
                      'description':
                        'A condition that restricts when the hook should be active. Must resolve to a boolean.',
                      'examples': [
                        'node.type == \'database\' && node.inputs.databaseType == \'postgres\'',
                        'contains(environment.nodes.*.inputs.databaseType, \'postgres\')',
                      ],
                      'type': 'string',
                    },
                  },
                  'type': 'object',
                },
                'type': 'array',
              },
              'ingress': {
                'items': {
                  'additionalProperties': false,
                  'properties': {
                    'module': {
                      'additionalProperties': {
                        'items': {
                          'additionalProperties': false,
                          'properties': {
                            'build': {
                              'description': 'The path to a module that will be built during the build step.',
                              'examples': [
                                './my-module',
                              ],
                              'type': 'string',
                            },
                            'environment': {
                              'additionalProperties': {
                                'type': 'string',
                              },
                              'description':
                                'Environment variables that should be provided to the container executing the module',
                              'examples': [
                                {
                                  'MY_ENV_VAR': 'my-value',
                                },
                              ],
                              'type': 'object',
                            },
                            'inputs': {
                              'anyOf': [
                                {
                                  'additionalProperties': {},
                                  'type': 'object',
                                },
                                {
                                  'type': 'string',
                                },
                              ],
                              'description': 'Input values for the module.',
                              'examples': [
                                {
                                  'image': 'nginx:latest',
                                  'port': 8080,
                                },
                              ],
                            },
                            'plugin': {
                              'default': 'pulumi',
                              'description': 'The plugin used to build the module. Defaults to pulumi.',
                              'enum': [
                                'pulumi',
                                'opentofu',
                              ],
                              'examples': [
                                'opentofu',
                              ],
                              'type': 'string',
                            },
                            'source': {
                              'description': 'The image source of the module.',
                              'examples': [
                                'my-registry.com/my-image:latest',
                              ],
                              'type': 'string',
                            },
                            'volume': {
                              'description': 'Volumes that should be mounted to the container executing the module',
                              'items': {
                                'additionalProperties': false,
                                'properties': {
                                  'host_path': {
                                    'description': 'The path on the host machine to mount to the container',
                                    'examples': [
                                      '/Users/batman/my-volume',
                                    ],
                                    'type': 'string',
                                  },
                                  'mount_path': {
                                    'description': 'The path in the container to mount the volume to',
                                    'examples': [
                                      '/app/my-volume',
                                    ],
                                    'type': 'string',
                                  },
                                },
                                'required': [
                                  'host_path',
                                  'mount_path',
                                ],
                                'type': 'object',
                              },
                              'type': 'array',
                            },
                            'when': {
                              'description':
                                'A condition that restricts when the module should be created. Must resolve to a boolean.',
                              'examples': [
                                'node.type == \'database\' && node.inputs.databaseType == \'postgres\'',
                                'contains(environment.nodes.*.inputs.databaseType, \'postgres\')',
                              ],
                              'type': 'string',
                            },
                          },
                          'required': [
                            'inputs',
                          ],
                          'type': 'object',
                        },
                        'type': 'array',
                      },
                      'description': 'Modules that will be created once per matching application resource',
                      'type': 'object',
                    },
                    'outputs': {
                      'additionalProperties': false,
                      'description': 'A map of output values to be passed to upstream application resources',
                      'examples': [
                        {
                          'host': '${module.database.host}',
                          'id': '${module.database.id}',
                          'password': '${module.database.password}',
                          'port': '${module.database.port}',
                          'username': '${module.database.username}',
                        },
                      ],
                      'properties': {
                        'dns_zone': {
                          'description': 'DNS zone the ingress rule responds to',
                          'examples': [
                            'example.com',
                          ],
                          'type': 'string',
                        },
                        'host': {
                          'description': 'Host the ingress rule responds to',
                          'examples': [
                            'api.example.com',
                          ],
                          'type': 'string',
                        },
                        'password': {
                          'description': 'Password for basic auth',
                          'examples': [
                            'password',
                          ],
                          'type': 'string',
                        },
                        'path': {
                          'description': 'Path the ingress rule responds to',
                          'examples': [
                            '/path',
                          ],
                          'type': 'string',
                        },
                        'port': {
                          'description': 'Port the ingress rule responds to',
                          'examples': [
                            80,
                          ],
                          'type': [
                            'string',
                            'number',
                          ],
                        },
                        'protocol': {
                          'description': 'Protocol the ingress rule responds to',
                          'examples': [
                            'http',
                          ],
                          'type': 'string',
                        },
                        'subdomain': {
                          'description': 'Subdomain the ingress rule responds to',
                          'examples': [
                            'api',
                          ],
                          'type': 'string',
                        },
                        'url': {
                          'description': 'URL the ingress rule responds to',
                          'examples': [
                            'http://admin:password@api.example.com/path',
                          ],
                          'type': 'string',
                        },
                        'username': {
                          'description': 'Username for basic auth',
                          'examples': [
                            'admin',
                          ],
                          'type': 'string',
                        },
                      },
                      'required': [
                        'protocol',
                        'host',
                        'port',
                        'url',
                        'path',
                        'subdomain',
                        'dns_zone',
                      ],
                      'type': 'object',
                    },
                    'when': {
                      'description':
                        'A condition that restricts when the hook should be active. Must resolve to a boolean.',
                      'examples': [
                        'node.type == \'database\' && node.inputs.databaseType == \'postgres\'',
                        'contains(environment.nodes.*.inputs.databaseType, \'postgres\')',
                      ],
                      'type': 'string',
                    },
                  },
                  'type': 'object',
                },
                'type': 'array',
              },
              'module': {
                'additionalProperties': {
                  'items': {
                    'additionalProperties': false,
                    'properties': {
                      'build': {
                        'description': 'The path to a module that will be built during the build step.',
                        'examples': [
                          './my-module',
                        ],
                        'type': 'string',
                      },
                      'environment': {
                        'additionalProperties': {
                          'type': 'string',
                        },
                        'description':
                          'Environment variables that should be provided to the container executing the module',
                        'examples': [
                          {
                            'MY_ENV_VAR': 'my-value',
                          },
                        ],
                        'type': 'object',
                      },
                      'inputs': {
                        'anyOf': [
                          {
                            'additionalProperties': {},
                            'type': 'object',
                          },
                          {
                            'type': 'string',
                          },
                        ],
                        'description': 'Input values for the module.',
                        'examples': [
                          {
                            'image': 'nginx:latest',
                            'port': 8080,
                          },
                        ],
                      },
                      'plugin': {
                        'default': 'pulumi',
                        'description': 'The plugin used to build the module. Defaults to pulumi.',
                        'enum': [
                          'pulumi',
                          'opentofu',
                        ],
                        'examples': [
                          'opentofu',
                        ],
                        'type': 'string',
                      },
                      'source': {
                        'description': 'The image source of the module.',
                        'examples': [
                          'my-registry.com/my-image:latest',
                        ],
                        'type': 'string',
                      },
                      'volume': {
                        'description': 'Volumes that should be mounted to the container executing the module',
                        'items': {
                          'additionalProperties': false,
                          'properties': {
                            'host_path': {
                              'description': 'The path on the host machine to mount to the container',
                              'examples': [
                                '/Users/batman/my-volume',
                              ],
                              'type': 'string',
                            },
                            'mount_path': {
                              'description': 'The path in the container to mount the volume to',
                              'examples': [
                                '/app/my-volume',
                              ],
                              'type': 'string',
                            },
                          },
                          'required': [
                            'host_path',
                            'mount_path',
                          ],
                          'type': 'object',
                        },
                        'type': 'array',
                      },
                      'when': {
                        'description':
                          'A condition that restricts when the module should be created. Must resolve to a boolean.',
                        'examples': [
                          'node.type == \'database\' && node.inputs.databaseType == \'postgres\'',
                          'contains(environment.nodes.*.inputs.databaseType, \'postgres\')',
                        ],
                        'type': 'string',
                      },
                    },
                    'required': [
                      'inputs',
                    ],
                    'type': 'object',
                  },
                  'type': 'array',
                },
                'description': 'Modules that will be created once per environment',
                'type': 'object',
              },
              'secret': {
                'items': {
                  'additionalProperties': false,
                  'properties': {
                    'module': {
                      'additionalProperties': {
                        'items': {
                          'additionalProperties': false,
                          'properties': {
                            'build': {
                              'description': 'The path to a module that will be built during the build step.',
                              'examples': [
                                './my-module',
                              ],
                              'type': 'string',
                            },
                            'environment': {
                              'additionalProperties': {
                                'type': 'string',
                              },
                              'description':
                                'Environment variables that should be provided to the container executing the module',
                              'examples': [
                                {
                                  'MY_ENV_VAR': 'my-value',
                                },
                              ],
                              'type': 'object',
                            },
                            'inputs': {
                              'anyOf': [
                                {
                                  'additionalProperties': {},
                                  'type': 'object',
                                },
                                {
                                  'type': 'string',
                                },
                              ],
                              'description': 'Input values for the module.',
                              'examples': [
                                {
                                  'image': 'nginx:latest',
                                  'port': 8080,
                                },
                              ],
                            },
                            'plugin': {
                              'default': 'pulumi',
                              'description': 'The plugin used to build the module. Defaults to pulumi.',
                              'enum': [
                                'pulumi',
                                'opentofu',
                              ],
                              'examples': [
                                'opentofu',
                              ],
                              'type': 'string',
                            },
                            'source': {
                              'description': 'The image source of the module.',
                              'examples': [
                                'my-registry.com/my-image:latest',
                              ],
                              'type': 'string',
                            },
                            'volume': {
                              'description': 'Volumes that should be mounted to the container executing the module',
                              'items': {
                                'additionalProperties': false,
                                'properties': {
                                  'host_path': {
                                    'description': 'The path on the host machine to mount to the container',
                                    'examples': [
                                      '/Users/batman/my-volume',
                                    ],
                                    'type': 'string',
                                  },
                                  'mount_path': {
                                    'description': 'The path in the container to mount the volume to',
                                    'examples': [
                                      '/app/my-volume',
                                    ],
                                    'type': 'string',
                                  },
                                },
                                'required': [
                                  'host_path',
                                  'mount_path',
                                ],
                                'type': 'object',
                              },
                              'type': 'array',
                            },
                            'when': {
                              'description':
                                'A condition that restricts when the module should be created. Must resolve to a boolean.',
                              'examples': [
                                'node.type == \'database\' && node.inputs.databaseType == \'postgres\'',
                                'contains(environment.nodes.*.inputs.databaseType, \'postgres\')',
                              ],
                              'type': 'string',
                            },
                          },
                          'required': [
                            'inputs',
                          ],
                          'type': 'object',
                        },
                        'type': 'array',
                      },
                      'description': 'Modules that will be created once per matching application resource',
                      'type': 'object',
                    },
                    'outputs': {
                      'additionalProperties': false,
                      'description': 'A map of output values to be passed to upstream application resources',
                      'examples': [
                        {
                          'host': '${module.database.host}',
                          'id': '${module.database.id}',
                          'password': '${module.database.password}',
                          'port': '${module.database.port}',
                          'username': '${module.database.username}',
                        },
                      ],
                      'properties': {
                        'data': {
                          'description': 'The contents of the secret',
                          'examples': [
                            '...',
                          ],
                          'type': 'string',
                        },
                      },
                      'required': [
                        'data',
                      ],
                      'type': 'object',
                    },
                    'when': {
                      'description':
                        'A condition that restricts when the hook should be active. Must resolve to a boolean.',
                      'examples': [
                        'node.type == \'database\' && node.inputs.databaseType == \'postgres\'',
                        'contains(environment.nodes.*.inputs.databaseType, \'postgres\')',
                      ],
                      'type': 'string',
                    },
                  },
                  'type': 'object',
                },
                'type': 'array',
              },
              'service': {
                'items': {
                  'additionalProperties': false,
                  'properties': {
                    'module': {
                      'additionalProperties': {
                        'items': {
                          'additionalProperties': false,
                          'properties': {
                            'build': {
                              'description': 'The path to a module that will be built during the build step.',
                              'examples': [
                                './my-module',
                              ],
                              'type': 'string',
                            },
                            'environment': {
                              'additionalProperties': {
                                'type': 'string',
                              },
                              'description':
                                'Environment variables that should be provided to the container executing the module',
                              'examples': [
                                {
                                  'MY_ENV_VAR': 'my-value',
                                },
                              ],
                              'type': 'object',
                            },
                            'inputs': {
                              'anyOf': [
                                {
                                  'additionalProperties': {},
                                  'type': 'object',
                                },
                                {
                                  'type': 'string',
                                },
                              ],
                              'description': 'Input values for the module.',
                              'examples': [
                                {
                                  'image': 'nginx:latest',
                                  'port': 8080,
                                },
                              ],
                            },
                            'plugin': {
                              'default': 'pulumi',
                              'description': 'The plugin used to build the module. Defaults to pulumi.',
                              'enum': [
                                'pulumi',
                                'opentofu',
                              ],
                              'examples': [
                                'opentofu',
                              ],
                              'type': 'string',
                            },
                            'source': {
                              'description': 'The image source of the module.',
                              'examples': [
                                'my-registry.com/my-image:latest',
                              ],
                              'type': 'string',
                            },
                            'volume': {
                              'description': 'Volumes that should be mounted to the container executing the module',
                              'items': {
                                'additionalProperties': false,
                                'properties': {
                                  'host_path': {
                                    'description': 'The path on the host machine to mount to the container',
                                    'examples': [
                                      '/Users/batman/my-volume',
                                    ],
                                    'type': 'string',
                                  },
                                  'mount_path': {
                                    'description': 'The path in the container to mount the volume to',
                                    'examples': [
                                      '/app/my-volume',
                                    ],
                                    'type': 'string',
                                  },
                                },
                                'required': [
                                  'host_path',
                                  'mount_path',
                                ],
                                'type': 'object',
                              },
                              'type': 'array',
                            },
                            'when': {
                              'description':
                                'A condition that restricts when the module should be created. Must resolve to a boolean.',
                              'examples': [
                                'node.type == \'database\' && node.inputs.databaseType == \'postgres\'',
                                'contains(environment.nodes.*.inputs.databaseType, \'postgres\')',
                              ],
                              'type': 'string',
                            },
                          },
                          'required': [
                            'inputs',
                          ],
                          'type': 'object',
                        },
                        'type': 'array',
                      },
                      'description': 'Modules that will be created once per matching application resource',
                      'type': 'object',
                    },
                    'outputs': {
                      'additionalProperties': false,
                      'description': 'A map of output values to be passed to upstream application resources',
                      'examples': [
                        {
                          'host': '${module.database.host}',
                          'id': '${module.database.id}',
                          'password': '${module.database.password}',
                          'port': '${module.database.port}',
                          'username': '${module.database.username}',
                        },
                      ],
                      'properties': {
                        'host': {
                          'description': 'Host the service listens on',
                          'examples': [
                            'my-service',
                          ],
                          'type': 'string',
                        },
                        'name': {
                          'description': 'Name of the service',
                          'examples': [
                            'my-service',
                          ],
                          'type': 'string',
                        },
                        'port': {
                          'description': 'Port the service listens on',
                          'examples': [
                            80,
                          ],
                          'type': [
                            'number',
                            'string',
                          ],
                        },
                        'protocol': {
                          'description': 'Protocol the service listens on',
                          'examples': [
                            'http',
                          ],
                          'type': 'string',
                        },
                        'target_port': {
                          'description': 'The port the service forwards traffic to',
                          'examples': [
                            8080,
                          ],
                          'type': [
                            'number',
                            'string',
                          ],
                        },
                        'url': {
                          'description': 'Fully resolvable URL of the service',
                          'examples': [
                            'http://my-service:80',
                          ],
                          'type': 'string',
                        },
                      },
                      'required': [
                        'name',
                        'target_port',
                        'protocol',
                        'host',
                        'port',
                        'url',
                      ],
                      'type': 'object',
                    },
                    'when': {
                      'description':
                        'A condition that restricts when the hook should be active. Must resolve to a boolean.',
                      'examples': [
                        'node.type == \'database\' && node.inputs.databaseType == \'postgres\'',
                        'contains(environment.nodes.*.inputs.databaseType, \'postgres\')',
                      ],
                      'type': 'string',
                    },
                  },
                  'type': 'object',
                },
                'type': 'array',
              },
              'volume': {
                'items': {
                  'additionalProperties': false,
                  'properties': {
                    'module': {
                      'additionalProperties': {
                        'items': {
                          'additionalProperties': false,
                          'properties': {
                            'build': {
                              'description': 'The path to a module that will be built during the build step.',
                              'examples': [
                                './my-module',
                              ],
                              'type': 'string',
                            },
                            'environment': {
                              'additionalProperties': {
                                'type': 'string',
                              },
                              'description':
                                'Environment variables that should be provided to the container executing the module',
                              'examples': [
                                {
                                  'MY_ENV_VAR': 'my-value',
                                },
                              ],
                              'type': 'object',
                            },
                            'inputs': {
                              'anyOf': [
                                {
                                  'additionalProperties': {},
                                  'type': 'object',
                                },
                                {
                                  'type': 'string',
                                },
                              ],
                              'description': 'Input values for the module.',
                              'examples': [
                                {
                                  'image': 'nginx:latest',
                                  'port': 8080,
                                },
                              ],
                            },
                            'plugin': {
                              'default': 'pulumi',
                              'description': 'The plugin used to build the module. Defaults to pulumi.',
                              'enum': [
                                'pulumi',
                                'opentofu',
                              ],
                              'examples': [
                                'opentofu',
                              ],
                              'type': 'string',
                            },
                            'source': {
                              'description': 'The image source of the module.',
                              'examples': [
                                'my-registry.com/my-image:latest',
                              ],
                              'type': 'string',
                            },
                            'volume': {
                              'description': 'Volumes that should be mounted to the container executing the module',
                              'items': {
                                'additionalProperties': false,
                                'properties': {
                                  'host_path': {
                                    'description': 'The path on the host machine to mount to the container',
                                    'examples': [
                                      '/Users/batman/my-volume',
                                    ],
                                    'type': 'string',
                                  },
                                  'mount_path': {
                                    'description': 'The path in the container to mount the volume to',
                                    'examples': [
                                      '/app/my-volume',
                                    ],
                                    'type': 'string',
                                  },
                                },
                                'required': [
                                  'host_path',
                                  'mount_path',
                                ],
                                'type': 'object',
                              },
                              'type': 'array',
                            },
                            'when': {
                              'description':
                                'A condition that restricts when the module should be created. Must resolve to a boolean.',
                              'examples': [
                                'node.type == \'database\' && node.inputs.databaseType == \'postgres\'',
                                'contains(environment.nodes.*.inputs.databaseType, \'postgres\')',
                              ],
                              'type': 'string',
                            },
                          },
                          'required': [
                            'inputs',
                          ],
                          'type': 'object',
                        },
                        'type': 'array',
                      },
                      'description': 'Modules that will be created once per matching application resource',
                      'type': 'object',
                    },
                    'outputs': {
                      'additionalProperties': {},
                      'description': 'A map of output values to be passed to upstream application resources',
                      'examples': [
                        {
                          'host': '${module.database.host}',
                          'id': '${module.database.id}',
                          'password': '${module.database.password}',
                          'port': '${module.database.port}',
                          'username': '${module.database.username}',
                        },
                      ],
                      'type': 'object',
                    },
                    'when': {
                      'description':
                        'A condition that restricts when the hook should be active. Must resolve to a boolean.',
                      'examples': [
                        'node.type == \'database\' && node.inputs.databaseType == \'postgres\'',
                        'contains(environment.nodes.*.inputs.databaseType, \'postgres\')',
                      ],
                      'type': 'string',
                    },
                  },
                  'type': 'object',
                },
                'type': 'array',
              },
            },
            'type': 'object',
          },
          'type': 'array',
        },
        'module': {
          'additionalProperties': {
            'items': {
              'additionalProperties': false,
              'properties': {
                'build': {
                  'description': 'The path to a module that will be built during the build step.',
                  'examples': [
                    './my-module',
                  ],
                  'type': 'string',
                },
                'environment': {
                  'additionalProperties': {
                    'type': 'string',
                  },
                  'description': 'Environment variables that should be provided to the container executing the module',
                  'examples': [
                    {
                      'MY_ENV_VAR': 'my-value',
                    },
                  ],
                  'type': 'object',
                },
                'inputs': {
                  'anyOf': [
                    {
                      'additionalProperties': {},
                      'type': 'object',
                    },
                    {
                      'type': 'string',
                    },
                  ],
                  'description': 'Input values for the module.',
                  'examples': [
                    {
                      'image': 'nginx:latest',
                      'port': 8080,
                    },
                  ],
                },
                'plugin': {
                  'default': 'pulumi',
                  'description': 'The plugin used to build the module. Defaults to pulumi.',
                  'enum': [
                    'pulumi',
                    'opentofu',
                  ],
                  'examples': [
                    'opentofu',
                  ],
                  'type': 'string',
                },
                'source': {
                  'description': 'The image source of the module.',
                  'examples': [
                    'my-registry.com/my-image:latest',
                  ],
                  'type': 'string',
                },
                'volume': {
                  'description': 'Volumes that should be mounted to the container executing the module',
                  'items': {
                    'additionalProperties': false,
                    'properties': {
                      'host_path': {
                        'description': 'The path on the host machine to mount to the container',
                        'examples': [
                          '/Users/batman/my-volume',
                        ],
                        'type': 'string',
                      },
                      'mount_path': {
                        'description': 'The path in the container to mount the volume to',
                        'examples': [
                          '/app/my-volume',
                        ],
                        'type': 'string',
                      },
                    },
                    'required': [
                      'host_path',
                      'mount_path',
                    ],
                    'type': 'object',
                  },
                  'type': 'array',
                },
                'when': {
                  'description':
                    'A condition that restricts when the module should be created. Must resolve to a boolean.',
                  'examples': [
                    'node.type == \'database\' && node.inputs.databaseType == \'postgres\'',
                    'contains(environment.nodes.*.inputs.databaseType, \'postgres\')',
                  ],
                  'type': 'string',
                },
              },
              'required': [
                'inputs',
              ],
              'type': 'object',
            },
            'type': 'array',
          },
          'description': 'Modules that will be created once per datacenter',
          'type': 'object',
        },
        'variable': {
          'additionalProperties': {
            'items': {
              'additionalProperties': false,
              'properties': {
                'default': {
                  'description': 'The default value of the variable',
                  'examples': [
                    'my-value',
                  ],
                  'type': 'string',
                },
                'description': {
                  'description': 'A human-readable description of the variable',
                  'examples': [
                    'An example description',
                  ],
                  'type': 'string',
                },
                'type': {
                  'description': 'The type of the variable',
                  'enum': [
                    'string',
                    'number',
                    'boolean',
                  ],
                  'examples': [
                    'string',
                  ],
                  'type': 'string',
                },
              },
              'required': [
                'type',
              ],
              'type': 'object',
            },
            'type': 'array',
          },
          'description': 'Variables necessary for the datacenter to run',
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
  },
  '$id': 'https://architect.io/.schemas/datacenter.json',
};
