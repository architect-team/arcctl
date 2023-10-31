import hclParser from 'hcl2-json-parser';
import { assertArrayIncludes, assertInstanceOf, fail } from 'std/testing/asserts.ts';
import { describe, it } from 'std/testing/bdd.ts';
import { parseDatacenter } from '../parser.ts';
import DatacenterV1 from '../v1/index.ts';

describe('Datacenter parser', () => {
  it('should parse default schema', async () => {
    const raw_obj = await hclParser.parseToObject(`
      module "vpc" {
        build = "./vpc"
        inputs = {
          name = "test"
        }
      }
    `);
    const datacenter_obj = await parseDatacenter(raw_obj);
    assertInstanceOf(datacenter_obj, DatacenterV1);
  });

  it('should parse specific schema', async () => {
    const raw_obj = await hclParser.parseToObject(`
      version = "v1"

      module "vpc" {
        build = "./vpc"
        inputs = {
          name = "test"
        }
      }
    `);
    const datacenter_obj = await parseDatacenter(raw_obj);
    assertInstanceOf(datacenter_obj, DatacenterV1);
  });

  it('should fail to parse schema with bad field', async () => {
    const raw_obj = await hclParser.parseToObject(`
      module "vpc" {
        build = "./vpc"
        bad_key = "test"
        inputs = {
          name = "test"
        }
      }
    `);
    try {
      await parseDatacenter(raw_obj);
      fail('Expected to fail with json schema error');
    } catch (errs) {
      assertArrayIncludes(errs, [
        {
          instancePath: '/module/vpc/0',
          keyword: 'additionalProperties',
          schemaPath:
            '#/definitions/DatacenterSchema/properties/module/additionalProperties/items/additionalProperties',
          params: { additionalProperty: 'bad_key' },
          message: 'must NOT have additional properties',
        },
      ]);
      return;
    }
  });

  it('should run tmp test', async () => {
    const config = `
    variable "secretsDir" {
      description = "Directory to store secrets in"
      type = "string"
    }

    module "traefikRegistry" {
      build = "./volume"
      inputs = {
        name = "\${datacenter.name}-traefik-registry"
      }
    }

    module "traefik" {
      build = "./deployment"
      inputs = {
        name = "\${datacenter.name}-gateway"
        image = "traefik:v2.10"
        volume_mounts = [{
          mount_path = "/etc/traefik"
          volume = module.traefikRegistry.volume
        }]
        command = [
          "--providers.file.directory=/etc/traefik",
          "--providers.file.watch=true",
          "--api.insecure=true",
          "--api.dashboard=true"
        ]
        exposed_ports = [{
          port = 80
          target_port = 80
        }, {
          port = 8080
          target_port = 8080
        }]
      }
    }

    environment {
      module "postgres" {
        when = contains(environment.databases.*.databaseType, "postgres")
        build = "./deployment"
        inputs = {
          name = "\${environment.name}-postgres"
          image = "postgres"
          exposed_ports = [{
            target_port = 5432
          }]
          environment = {
            POSTGRES_USER = "postgres"
            POSTGRES_PASSWORD = "password"
          }
        }
      }

      module "mysql" {
        when = contains(environment.databases.*.databaseType, "mysql")
        build = "./deployment"
        inputs = {
          name = "\${environment.name}-mysql"
          image = "mysql"
          exposed_ports = [{
            target_port = 3306
          }]
          environment = {
            MYSQL_ROOT_PASSWORD = "password"
          }
        }
      }

      database {
        when = node.inputs.databaseType == "postgres"

        module "database" {
          build = "./postgres-db"
          inputs = {
            name = "\${node.component}_\${node.name}"
            host = module.postgres.host
            port = module.postgres.ports[0]
            username = "user"
            password = "password"
          }
        }

        outputs = {
          host = module.postgres.host
          port = module.postgres.ports[0]
          username = module.database.username
          password = module.database.password
          name = module.database.name
        }
      }

      database {
        when = node.inputs.databaseType == "mysql"

        module "database" {
          build = "./mysql-db"
          inputs = {
            name = "\${node.component}_\${node.name}"
            host = module.mysql.host
            port = module.mysql.ports[0]
            username = "root"
            password = "password"
          }
        }

        outputs = {
          host = module.postgres.host
          port = module.postgres.ports[0]
          username = module.database.username
          password = module.database.password
          name = module.database.name
        }
      }

      deployment {
        module "deployment" {
          build = "./deployment"
          inputs = node.inputs
        }

        outputs = {
          host = module.deployment.host
          port = module.deployment.ports[0]
        }
      }

      service {
        module "service" {
          build = "./service"
          inputs = node.inputs
        }

        outputs = {
          host = module.service.host
          port = module.service.port
        }
      }

      ingressRule {
        module "ingressRule" {
          build = "./ingressRule"
          inputs = node.inputs
        }

        outputs = {
          protocol = module.ingressRule.protocol
          host = module.ingressRule.host
          port = module.ingressRule.port
          path = module.ingressRule.path
        }
      }

      secret {
        module "secret" {
          build = "./secret"
          inputs = node.inputs
        }

        outputs = {
          name = module.secret.name
          value = module.secret.value
        }
      }
    }`;
    const raw_obj = await hclParser.parseToObject(config);
  });
});
