export default {
  '$ref': '#/definitions/EnvironmentSchema',
  '$schema': 'https://json-schema.org/draft/2019-09/schema',
  'definitions': {
    'EnvironmentSchema': {
      'additionalProperties': false,
      'properties': {
        'components': {
          'additionalProperties': {
            'additionalProperties': false,
            'properties': {
              'deployments': {
                'additionalProperties': {
                  'additionalProperties': false,
                  'properties': {
                    'autoscaling': {
                      'additionalProperties': false,
                      'description': 'Autoscaling rules for the deployment within the environment',
                      'properties': {
                        'max_replicas': {
                          'default': 1,
                          'description': 'Maximum number of replicas to maintain',
                          'type': 'number',
                        },
                        'min_replicas': {
                          'default': 1,
                          'description': 'Minimum number of replicas to maintain',
                          'type': 'number',
                        },
                      },
                      'type': 'object',
                    },
                    'enabled': {
                      'description': 'Set to false to make sure the deployment doesn\'t run in this environment',
                      'type': 'boolean',
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
                      'description': 'Values for environment variables in the deployment',
                      'type': 'object',
                    },
                    'replicas': {
                      'description': 'Number of replicas of the deployment to maintain',
                      'type': 'number',
                    },
                  },
                  'type': 'object',
                },
                'description': 'Configuration for each service in the component',
                'type': 'object',
              },
              'ingresses': {
                'additionalProperties': {
                  'additionalProperties': false,
                  'properties': {
                    'internal': {
                      'description':
                        'Set to true to make the ingress only available from a private gateway (no public IP)',
                      'type': 'boolean',
                    },
                    'path': {
                      'description': 'A path that the ingress listens on',
                      'type': 'string',
                    },
                    'subdomain': {
                      'description': 'A subdomain that the ingress listens on',
                      'type': 'string',
                    },
                    'tls': {
                      'additionalProperties': false,
                      'description': 'Custom TLS configuration for the ingress rule',
                      'properties': {
                        'ca': {
                          'type': 'string',
                        },
                        'crt': {
                          'type': 'string',
                        },
                        'key': {
                          'type': 'string',
                        },
                      },
                      'required': [
                        'crt',
                        'key',
                      ],
                      'type': 'object',
                    },
                  },
                  'type': 'object',
                },
                'type': 'object',
              },
              'services': {
                'additionalProperties': {
                  'additionalProperties': false,
                  'properties': {
                    'host': {
                      'description':
                        'Existing hostname that should act as the interface host instead of creating a new one',
                      'type': 'string',
                    },
                    'port': {
                      'description':
                        'Existing port that should act as the interface port instead of registering a new one',
                      'type': 'number',
                    },
                  },
                  'type': 'object',
                },
                'type': 'object',
              },
              'source': {
                'description':
                  'The source of the component to deploy. Can either be a docker registry repository or a reference to the local filesystem prefixed with `file:`',
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
                'description': 'Values for variables the component expects',
                'type': 'object',
              },
            },
            'type': 'object',
          },
          'description': 'Configuration settings for the components that may be deployed inside this environment',
          'type': 'object',
        },
        'locals': {
          'additionalProperties': {
            'type': 'string',
          },
          'description': 'Local variables that can be used to parameterize the environment',
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
  '$id': 'https://architect.io/.schemas/environment.json',
};