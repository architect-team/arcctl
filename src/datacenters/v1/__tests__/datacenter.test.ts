import * as hclParser from 'hcl2-parser';
import { assertEquals, fail } from 'std/testing/asserts.ts';
import { describe, it } from 'std/testing/bdd.ts';
import { GraphEdge } from '../../../graphs/edge.ts';
import { AppGraph, AppGraphNode, InfraGraphNode } from '../../../graphs/index.ts';
import { InvalidModuleReference, InvalidOutputProperties } from '../errors.ts';
import DatacenterV1 from '../index.ts';

describe('DatacenterV1', () => {
  describe('getGraph()', () => {
    it('should extract root modules', () => {
      const rawDatacenterObj = hclParser.default.parseToObject(`
        module "vpc" {
          source = "architect-io/digitalocean-vpc:latest"
          inputs = {
            name = "my-vpc"
            region = "nyc1"
          }
        }
      `)[0];
      const datacenter = new DatacenterV1(rawDatacenterObj);
      const graph = datacenter.getGraph(new AppGraph(), { datacenterName: 'test' });

      const expectedVpcNode = new InfraGraphNode({
        image: 'architect-io/digitalocean-vpc:latest',
        inputs: {
          name: 'my-vpc',
          region: 'nyc1',
        },
        name: 'vpc',
        plugin: 'pulumi',
      });

      assertEquals(graph.nodes, [expectedVpcNode]);
    });

    it('should extract edges for related modules', () => {
      const rawDatacenterObj = hclParser.default.parseToObject(`
        module "vpc" {
          source = "architect-io/digitalocean-vpc:latest"
          inputs = {
            name = "my-vpc"
            region = "nyc1"
          }
        }

        module "cluster" {
          source = "architect-io/digitalocean-kubernetes:latest"
          inputs = {
            name = "\${module.vpc.name}-cluster"
            vpc_id = module.vpc.id
          }
        }
      `)[0];
      const datacenter = new DatacenterV1(rawDatacenterObj);
      const graph = datacenter.getGraph(new AppGraph(), { datacenterName: 'test' });

      const expectedEdge = new GraphEdge({
        from: `cluster-blue`,
        to: `vpc-blue`,
      });

      assertEquals(graph.edges, [expectedEdge]);
    });

    it('should fail when referencing invalid modules', () => {
      const rawDatacenterObj = hclParser.default.parseToObject(`
        module "vpc" {
          source = "architect-io/digitalocean-vpc:latest"
          inputs = {
            name = module.region.name
            region = "nyc1"
          }
        }
      `)[0];
      const datacenter = new DatacenterV1(rawDatacenterObj);

      try {
        datacenter.getGraph(new AppGraph(), { datacenterName: 'test' });
        fail('Expected to throw InvalidModuleReference error');
      } catch (err) {
        assertEquals(err, new InvalidModuleReference('vpc', 'region'));
      }
    });

    it('should extract modules from environment spec', () => {
      const rawDatacenterObj = hclParser.default.parseToObject(`
        environment {
          module "vpc" {
            source = "architect-io/digitalocean-vpc:latest"
            inputs = {
              name = "my-vpc"
              region = "nyc1"
            }
          }
        }
      `)[0];
      const datacenter = new DatacenterV1(rawDatacenterObj);
      const graph = datacenter.getGraph(new AppGraph(), { datacenterName: 'test', environmentName: 'test' });

      const expectedVpcNode = new InfraGraphNode({
        image: 'architect-io/digitalocean-vpc:latest',
        inputs: {
          name: 'my-vpc',
          region: 'nyc1',
        },
        name: 'vpc',
        plugin: 'pulumi',
      });

      assertEquals(graph.nodes, [expectedVpcNode]);
    });

    it('should ignore modules inside environments without an environment name passed in the options', () => {
      const rawDatacenterObj = hclParser.default.parseToObject(`
        environment {
          module "vpc" {
            source = "architect-io/digitalocean-vpc:latest"
            inputs = {
              name = "my-vpc"
              region = "nyc1"
            }
          }
        }
      `)[0];
      const datacenter = new DatacenterV1(rawDatacenterObj);
      const graph = datacenter.getGraph(new AppGraph(), { datacenterName: 'test' });

      assertEquals(graph.nodes, []);
    });

    it('should extract edges from environment modules to datacenter modules', () => {
      const rawDatacenterObj = hclParser.default.parseToObject(`
        module "vpc" {
          source = "architect-io/digitalocean-vpc:latest"
          inputs = {
            name = "my-vpc"
            region = "nyc1"
          }
        }

        environment {
          module "database" {
            source = "architect-io/digitalocean-database:latest"
            inputs = {
              type = "postgres"
              vpc_id = module.vpc.id
            }
          }
        }
      `)[0];
      const datacenter = new DatacenterV1(rawDatacenterObj);
      const graph = datacenter.getGraph(new AppGraph(), { datacenterName: 'test', environmentName: 'test' });

      const expectedEdge = new GraphEdge({
        from: 'database-blue',
        to: 'vpc-blue',
      });

      assertEquals(graph.edges, [expectedEdge]);
    });

    it('should fail when datacenter modules reference environment modules', () => {
      const rawDatacenterObj = hclParser.default.parseToObject(`
        module "vpc" {
          source = "architect-io/digitalocean-vpc:latest"
          inputs = {
            name = module.database.name
            region = "nyc1"
          }
        }

        environment {
          module "database" {
            source = "architect-io/digitalocean-database:latest"
            inputs = {
              type = "postgres"
              vpc_id = module.vpc.id
            }
          }
        }
      `)[0];
      const datacenter = new DatacenterV1(rawDatacenterObj);

      try {
        datacenter.getGraph(new AppGraph(), { datacenterName: 'test', environmentName: 'test' });
        fail('Expected to throw InvalidModuleReference error');
      } catch (err) {
        assertEquals(err, new InvalidModuleReference('vpc', 'database'));
      }
    });

    it('should extract modules from resource hooks', () => {
      const rawDatacenterObj = hclParser.default.parseToObject(`
        environment {
          database {
            module "database" {
              source = "architect-io/digitalocean-database:latest"
              inputs = {
                type = "postgres"
              }
            }

            outputs = {
              protocol = "postgresql"
              host = module.database.host
              port = module.database.port
              name = module.database.name
              username = module.database.username
              password = module.database.password
              url = module.database.url
            }
          }
        }
      `)[0];
      const datacenter = new DatacenterV1(rawDatacenterObj);

      const appGraph = new AppGraph({
        nodes: [
          new AppGraphNode({
            name: 'database',
            type: 'database',
            component: 'some-component',
            environment: 'test',
            inputs: {
              name: 'my-db',
              databaseType: 'postgres',
              databaseVersion: '15',
            },
          }),
        ],
      });

      const infraGraph = datacenter.getGraph(appGraph, { datacenterName: 'test', environmentName: 'test' });

      const expectedDatabaseNode = new InfraGraphNode({
        image: 'architect-io/digitalocean-database:latest',
        inputs: {
          type: 'postgres',
        },
        name: 'database',
        plugin: 'pulumi',
      });

      assertEquals(infraGraph.nodes, [expectedDatabaseNode]);
    });

    it('should fail with missing resource outputs', () => {
      const rawDatacenterObj = hclParser.default.parseToObject(`
        environment {
          database {
            module "database" {
              source = "architect-io/digitalocean-database:latest"
              inputs = {
                type = "postgres"
              }
            }

            outputs = {
              protocol = "postgresql"
              port = module.database.port
              name = module.database.name
              username = module.database.username
              password = module.database.password
              url = module.database.url
            }
          }
        }
      `)[0];
      const datacenter = new DatacenterV1(rawDatacenterObj);

      const appGraph = new AppGraph({
        nodes: [
          new AppGraphNode({
            name: 'database',
            type: 'database',
            component: 'some-component',
            environment: 'test',
            inputs: {
              name: 'my-db',
              databaseType: 'postgres',
              databaseVersion: '15',
            },
          }),
        ],
      });

      try {
        datacenter.getGraph(appGraph, { datacenterName: 'test', environmentName: 'test' });
        fail('Expected to throw InvalidOutputProperties error');
      } catch (err) {
        assertEquals(
          err,
          new InvalidOutputProperties('database', [
            {
              instancePath: '',
              keyword: 'required',
              message: 'must have required property \'host\'',
              params: {
                missingProperty: 'host',
              },
              schemaPath: '#/definitions/DatabaseApplyOutputs/required',
            },
          ]),
        );
      }
    });

    it('should fail to connect modules across resource hooks', () => {
      const rawDatacenterObj = hclParser.default.parseToObject(`
        environment {
          database {
            module "database" {
              source = "architect-io/digitalocean-database:latest"
              inputs = {
                type = "postgres"
              }
            }

            outputs = {
              protocol = "postgresql"
              host = module.database.host
              port = module.database.port
              name = module.database.name
              username = module.database.username
              password = module.database.password
              url = module.database.url
            }
          }

          deployment {
            module "deployment" {
              source = "architect-io/kubernetes-deployment:latest"
              inputs = {
                image = "nginx:latest"
                environment = {
                  DB_URL = module.database.url
                }
              }
            }

            outputs = {
              id = module.deployment.id
            }
          }
        }
      `)[0];
      const datacenter = new DatacenterV1(rawDatacenterObj);

      const appGraph = new AppGraph({
        nodes: [
          new AppGraphNode({
            name: 'database',
            type: 'database',
            component: 'some-component',
            environment: 'test',
            inputs: {
              name: 'my-db',
              databaseType: 'postgres',
              databaseVersion: '15',
            },
          }),
          new AppGraphNode({
            name: 'deployment',
            type: 'deployment',
            component: 'some-component',
            environment: 'test',
            inputs: {
              image: 'nginx:latest',
              name: 'my-db',
            },
          }),
        ],
      });

      try {
        datacenter.getGraph(appGraph, { datacenterName: 'test', environmentName: 'test' });
        fail('Expected to throw InvalidModuleReference error');
      } catch (err) {
        assertEquals(err, new InvalidModuleReference('deployment', 'database'));
      }
    });
  });
});
