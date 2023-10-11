import * as hclParser from 'hcl2-parser';
import { assertEquals, fail } from 'std/testing/asserts.ts';
import { describe, it } from 'std/testing/bdd.ts';
import { GraphEdge } from '../../../graphs/edge.ts';
import { AppGraph, AppGraphNode, InfraGraphNode } from '../../../graphs/index.ts';
import { InvalidModuleReference, InvalidOutputProperties, MissingResourceHook } from '../errors.ts';
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

      const expectedVpcNode = new InfraGraphNode({
        name: 'vpc',
        plugin: 'pulumi',
        image: 'architect-io/digitalocean-vpc:latest',
        inputs: {
          name: 'my-vpc',
          region: 'nyc1',
        },
      });

      const expectedClusterNode = new InfraGraphNode({
        name: 'cluster',
        plugin: 'pulumi',
        image: 'architect-io/digitalocean-kubernetes:latest',
        inputs: {
          name: `\${${expectedVpcNode.getId()}.name}-cluster`,
          vpc_id: `\${${expectedVpcNode.getId()}.id}`,
        },
      });

      const expectedEdge = new GraphEdge({
        from: expectedClusterNode.getId(),
        to: expectedVpcNode.getId(),
      });

      assertEquals(graph.nodes, [expectedClusterNode, expectedVpcNode]);
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

      const expectedVpcNode = new InfraGraphNode({
        image: 'architect-io/digitalocean-vpc:latest',
        inputs: {
          name: 'my-vpc',
          region: 'nyc1',
        },
        name: 'vpc',
        plugin: 'pulumi',
      });

      const expectedDatabaseNode = new InfraGraphNode({
        image: 'architect-io/digitalocean-database:latest',
        inputs: {
          type: 'postgres',
          vpc_id: `\${${expectedVpcNode.getId()}.id}`,
        },
        name: 'database',
        plugin: 'pulumi',
      });

      const expectedEdge = new GraphEdge({
        from: expectedDatabaseNode.getId(),
        to: expectedVpcNode.getId(),
      });

      assertEquals(graph.nodes, [expectedVpcNode, expectedDatabaseNode]);
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

      const databaseAppGraphNode = new AppGraphNode({
        name: 'database',
        type: 'database',
        component: 'some-component',
        inputs: {
          name: 'my-db',
          databaseType: 'postgres',
          databaseVersion: '15',
        },
      });
      const appGraph = new AppGraph({
        nodes: [databaseAppGraphNode],
      });

      const infraGraph = datacenter.getGraph(appGraph, { datacenterName: 'test', environmentName: 'test' });

      const expectedDatabaseNode = new InfraGraphNode({
        image: 'architect-io/digitalocean-database:latest',
        component: databaseAppGraphNode.component,
        appNodeId: databaseAppGraphNode.getId(),
        inputs: {
          type: 'postgres',
        },
        name: 'database',
        plugin: 'pulumi',
      });

      assertEquals(infraGraph.nodes, [expectedDatabaseNode]);
    });

    it('should extract a module for multiple matching app nodes', () => {
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

      const db1AppNode = new AppGraphNode({
        name: 'db1',
        type: 'database',
        component: 'some-component',
        inputs: {
          name: 'my-db',
          databaseType: 'postgres',
          databaseVersion: '15',
        },
      });

      const db2AppNode = new AppGraphNode({
        name: 'db2',
        type: 'database',
        component: 'some-component',
        inputs: {
          name: 'my-db',
          databaseType: 'postgres',
          databaseVersion: '15',
        },
      });

      const appGraph = new AppGraph({
        nodes: [db1AppNode, db2AppNode],
      });

      const infraGraph = datacenter.getGraph(appGraph, { datacenterName: 'test', environmentName: 'test' });

      const expectedDb1Node = new InfraGraphNode({
        image: 'architect-io/digitalocean-database:latest',
        component: db1AppNode.component,
        appNodeId: db1AppNode.getId(),
        inputs: {
          type: 'postgres',
        },
        name: 'database',
        plugin: 'pulumi',
      });

      const expectedDb2Node = new InfraGraphNode({
        image: 'architect-io/digitalocean-database:latest',
        component: db2AppNode.component,
        appNodeId: db2AppNode.getId(),
        inputs: {
          type: 'postgres',
        },
        name: 'database',
        plugin: 'pulumi',
      });

      assertEquals(infraGraph.nodes, [expectedDb1Node, expectedDb2Node]);
    });

    it('should error if necessary resource hooks are missing', () => {
      const rawDatacenterObj = hclParser.default.parseToObject(`
        environment {
          deployment {
            module "deployment" {
              source = "architect-io/kubernetes-deployment:latest"
              inputs = {
                image = node.inputs.image
                environment = node.inputs.environment
              }
            }
          }
        }
      `)[0];
      const datacenter = new DatacenterV1(rawDatacenterObj);

      const dbAppNode = new AppGraphNode({
        name: 'db',
        type: 'database',
        component: 'some-component',
        inputs: {
          name: 'my-db',
          databaseType: 'postgres',
          databaseVersion: '15',
        },
      });

      const deploymentAppNode = new AppGraphNode({
        name: 'dep',
        type: 'deployment',
        component: 'some-component',
        inputs: {
          image: 'nginx:latest',
          environment: {
            DB_URL: `\${{ ${dbAppNode.getId()}.url }}`,
          },
        },
      });

      const appGraph = new AppGraph({
        nodes: [dbAppNode, deploymentAppNode],
        edges: [
          new GraphEdge({
            from: deploymentAppNode.getId(),
            to: dbAppNode.getId(),
          }),
        ],
      });

      try {
        datacenter.getGraph(appGraph, { datacenterName: 'test', environmentName: 'test' });
        fail('Expected to throw MissingResourceHook error');
      } catch (err) {
        assertEquals(err, new MissingResourceHook(deploymentAppNode.getId(), dbAppNode.getId()));
      }
    });

    it('should connect modules for related app resources', () => {
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
                image = node.inputs.image
                environment = node.inputs.environment
              }
            }
          }
        }
      `)[0];
      const datacenter = new DatacenterV1(rawDatacenterObj);

      const dbAppNode = new AppGraphNode({
        name: 'db',
        type: 'database',
        component: 'some-component',
        inputs: {
          name: 'my-db',
          databaseType: 'postgres',
          databaseVersion: '15',
        },
      });

      const deploymentAppNode = new AppGraphNode({
        name: 'dep',
        type: 'deployment',
        component: 'some-component',
        inputs: {
          image: 'nginx:latest',
          environment: {
            DB_URL: `\${{ ${dbAppNode.getId()}.url }}`,
          },
        },
      });

      const appGraph = new AppGraph({
        nodes: [dbAppNode, deploymentAppNode],
        edges: [
          new GraphEdge({
            from: deploymentAppNode.getId(),
            to: dbAppNode.getId(),
          }),
        ],
      });

      const infraGraph = datacenter.getGraph(appGraph, { datacenterName: 'test', environmentName: 'test' });

      const expectedDbNode = new InfraGraphNode({
        image: 'architect-io/digitalocean-database:latest',
        component: dbAppNode.component,
        appNodeId: dbAppNode.getId(),
        inputs: {
          type: 'postgres',
        },
        name: 'database',
        plugin: 'pulumi',
      });

      const expectedDeploymentNode = new InfraGraphNode({
        image: 'architect-io/kubernetes-deployment:latest',
        component: deploymentAppNode.component,
        appNodeId: deploymentAppNode.getId(),
        inputs: {
          image: 'nginx:latest',
          environment: {
            DB_URL: `\${${expectedDbNode.getId()}.url}`,
          },
        },
        name: 'deployment',
        plugin: 'pulumi',
      });

      assertEquals(infraGraph.nodes, [expectedDbNode, expectedDeploymentNode]);
      assertEquals(infraGraph.edges, [
        new GraphEdge({
          from: expectedDeploymentNode.getId(),
          to: expectedDbNode.getId(),
        }),
      ]);
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

      const databaseAppGraphNode = new AppGraphNode({
        name: 'database',
        type: 'database',
        component: 'some-component',
        inputs: {
          name: 'my-db',
          databaseType: 'postgres',
          databaseVersion: '15',
        },
      });
      const appGraph = new AppGraph({
        nodes: [databaseAppGraphNode],
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
            inputs: {
              image: 'nginx:latest',
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

    it('should pass variable values to root modules', () => {
      const rawDatacenterObj = hclParser.default.parseToObject(`
        variable "region" {
          type = "string"
        }

        module "vpc" {
          source = "architect-io/digitalocean-vpc:latest"
          inputs = {
            name = "my-vpc"
            region = variable.region
          }
        }
      `)[0];
      const datacenter = new DatacenterV1(rawDatacenterObj);
      const graph = datacenter.getGraph(new AppGraph(), { datacenterName: 'test', variables: { region: 'nyc1' } });

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

    it('should pass variable values to environment modules', () => {
      const rawDatacenterObj = hclParser.default.parseToObject(`
        variable "region" {
          type = "string"
        }

        environment {
          module "vpc" {
            source = "architect-io/digitalocean-vpc:latest"
            inputs = {
              name = "my-vpc"
              region = variable.region
            }
          }
        }
      `)[0];

      const datacenter = new DatacenterV1(rawDatacenterObj);
      const graph = datacenter.getGraph(new AppGraph(), {
        datacenterName: 'test',
        environmentName: 'test',
        variables: { region: 'nyc1' },
      });

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

    it('should pass variable values to resource hook modules', () => {
      const rawDatacenterObj = hclParser.default.parseToObject(`
        variable "region" {
          type = "string"
        }

        environment {
          database {
            module "database" {
              source = "architect-io/digitalocean-database:latest"
              inputs = {
                type = "postgres"
                region = variable.region
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

      const databaseAppGraphNode = new AppGraphNode({
        name: 'database',
        type: 'database',
        component: 'some-component',
        inputs: {
          name: 'my-db',
          databaseType: 'postgres',
          databaseVersion: '15',
        },
      });
      const appGraph = new AppGraph({
        nodes: [databaseAppGraphNode],
      });

      const infraGraph = datacenter.getGraph(appGraph, {
        datacenterName: 'test',
        environmentName: 'test',
        variables: { region: 'nyc1' },
      });

      const expectedDatabaseNode = new InfraGraphNode({
        image: 'architect-io/digitalocean-database:latest',
        inputs: {
          type: 'postgres',
          region: 'nyc1',
        },
        name: 'database',
        plugin: 'pulumi',
        component: databaseAppGraphNode.component,
        appNodeId: databaseAppGraphNode.getId(),
      });

      assertEquals(infraGraph.nodes, [expectedDatabaseNode]);
    });

    it('should support var shorthand references', () => {
      const rawDatacenterObj = hclParser.default.parseToObject(`
        variable "region" {
          type = "string"
        }

        module "vpc" {
          source = "architect-io/digitalocean-vpc:latest"
          inputs = {
            name = "my-vpc"
            region = var.region
          }
        }
      `)[0];
      const datacenter = new DatacenterV1(rawDatacenterObj);
      const graph = datacenter.getGraph(new AppGraph(), { datacenterName: 'test', variables: { region: 'nyc1' } });

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

    it('should allow variables to be used as default values for each other', () => {
      const rawDatacenterObj = hclParser.default.parseToObject(`
        variable "region" {
          type = "string"
        }

        variable "namePrefix" {
          type = "string"
          default = "prefix-\${var.region}"
        }

        module "vpc" {
          source = "architect-io/digitalocean-vpc:latest"
          inputs = {
            name = "\${var.namePrefix}-vpc"
            region = "\${var.region}"
          }
        }
      `)[0];
      const datacenter = new DatacenterV1(rawDatacenterObj);
      const graph = datacenter.getGraph(new AppGraph(), { datacenterName: 'test', variables: { region: 'nyc1' } });

      const expectedVpcNode = new InfraGraphNode({
        image: 'architect-io/digitalocean-vpc:latest',
        inputs: {
          name: 'prefix-nyc1-vpc',
          region: 'nyc1',
        },
        name: 'vpc',
        plugin: 'pulumi',
      });

      assertEquals(graph.nodes, [expectedVpcNode]);
    });
  });
});
