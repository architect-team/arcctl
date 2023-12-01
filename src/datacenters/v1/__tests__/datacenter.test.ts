import hclParser from 'hcl2-json-parser';
import { assert, assertArrayIncludes, assertEquals, assertFalse, fail } from 'std/testing/asserts.ts';
import { describe, it } from 'std/testing/bdd.ts';
import { GraphEdge } from '../../../graphs/edge.ts';
import { AppGraph, AppGraphNode, InfraGraphNode } from '../../../graphs/index.ts';
import {
  InvalidModuleReference,
  InvalidOutputProperties,
  MissingResourceHook,
  ModuleReferencesNotAllowedInWhenClause,
} from '../errors.ts';
import DatacenterV1 from '../index.ts';

describe('DatacenterV1', () => {
  describe('getGraph()', () => {
    it('should extract root modules', async () => {
      const rawDatacenterObj = await hclParser.parseToObject(`
        module "vpc" {
          source = "architect-io/digitalocean-vpc:latest"
          inputs = {
            name = "my-vpc"
            region = "nyc1"
          }
        }
      `);
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

    it('should extract edges for related modules', async () => {
      const rawDatacenterObj = await hclParser.parseToObject(`
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
      `);
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

    it('should fail when referencing invalid modules', async () => {
      const rawDatacenterObj = await hclParser.parseToObject(`
        module "vpc" {
          source = "architect-io/digitalocean-vpc:latest"
          inputs = {
            name = module.region.name
            region = "nyc1"
          }
        }
      `);
      const datacenter = new DatacenterV1(rawDatacenterObj);

      try {
        datacenter.getGraph(new AppGraph(), { datacenterName: 'test' });
        fail('Expected to throw InvalidModuleReference error');
      } catch (err) {
        assertEquals(err, new InvalidModuleReference('vpc', 'region'));
      }
    });

    it('should extract modules from environment spec', async () => {
      const rawDatacenterObj = await hclParser.parseToObject(`
        environment {
          module "vpc" {
            source = "architect-io/digitalocean-vpc:latest"
            inputs = {
              name = "my-vpc"
              region = "nyc1"
            }
          }
        }
      `);
      const datacenter = new DatacenterV1(rawDatacenterObj);
      const graph = datacenter.getGraph(new AppGraph(), { datacenterName: 'test', environmentName: 'test' });

      const expectedVpcNode = new InfraGraphNode({
        image: 'architect-io/digitalocean-vpc:latest',
        inputs: {
          name: 'my-vpc',
          region: 'nyc1',
        },
        name: 'vpc',
        environment: 'test',
        plugin: 'pulumi',
      });

      assertEquals(graph.nodes, [expectedVpcNode]);
    });

    it('should ignore modules inside environments without an environment name passed in the options', async () => {
      const rawDatacenterObj = await hclParser.parseToObject(`
        environment {
          module "vpc" {
            source = "architect-io/digitalocean-vpc:latest"
            inputs = {
              name = "my-vpc"
              region = "nyc1"
            }
          }
        }
      `);
      const datacenter = new DatacenterV1(rawDatacenterObj);
      const graph = datacenter.getGraph(new AppGraph(), { datacenterName: 'test' });

      assertEquals(graph.nodes, []);
    });

    it('should extract edges from environment modules to datacenter modules', async () => {
      const rawDatacenterObj = await hclParser.parseToObject(`
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
      `);
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
        environment: 'test',
        plugin: 'pulumi',
      });

      const expectedEdge = new GraphEdge({
        from: expectedDatabaseNode.getId(),
        to: expectedVpcNode.getId(),
      });

      assertEquals(graph.nodes, [expectedVpcNode, expectedDatabaseNode]);
      assertEquals(graph.edges, [expectedEdge]);
    });

    it('should fail when datacenter modules reference environment modules', async () => {
      const rawDatacenterObj = await hclParser.parseToObject(`
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
      `);
      const datacenter = new DatacenterV1(rawDatacenterObj);

      try {
        datacenter.getGraph(new AppGraph(), { datacenterName: 'test', environmentName: 'test' });
        fail('Expected to throw InvalidModuleReference error');
      } catch (err) {
        assertEquals(err, new InvalidModuleReference('vpc', 'database'));
      }
    });

    it('should extract modules from resource hooks', async () => {
      const rawDatacenterObj = await hclParser.parseToObject(`
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
              database = module.database.name
              username = module.database.username
              password = module.database.password
              url = module.database.url
            }
          }
        }
      `);
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
        environment: 'test',
        appNodeId: databaseAppGraphNode.getId(),
        inputs: {
          type: 'postgres',
        },
        name: 'database',
        plugin: 'pulumi',
      });

      assertEquals(infraGraph.nodes, [expectedDatabaseNode]);
    });

    it('should extract a module for multiple matching app nodes', async () => {
      const rawDatacenterObj = await hclParser.parseToObject(`
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
              database = module.database.name
              username = module.database.username
              password = module.database.password
              url = module.database.url
            }
          }
        }
      `);
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
        environment: 'test',
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
        environment: 'test',
        appNodeId: db2AppNode.getId(),
        inputs: {
          type: 'postgres',
        },
        name: 'database',
        plugin: 'pulumi',
      });

      assertEquals(infraGraph.nodes, [expectedDb1Node, expectedDb2Node]);
    });

    it('should error if necessary resource hooks are missing', async () => {
      const rawDatacenterObj = await hclParser.parseToObject(`
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
      `);
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
          name: 'some-component--dep',
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

    it('should connect modules for related app resources', async () => {
      const rawDatacenterObj = await hclParser.parseToObject(`
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
              database = module.database.name
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
      `);
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
          name: 'some-component--dep',
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
        environment: 'test',
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
        environment: 'test',
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

    it('should fail with missing resource outputs', async () => {
      const rawDatacenterObj = await hclParser.parseToObject(`
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
      `);
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

    it('should fail to connect modules across resource hooks', async () => {
      const rawDatacenterObj = await hclParser.parseToObject(`
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
              database = module.database.name
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
      `);
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
              name: 'some-component--deployment',
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

    it('should pass variable values to root modules', async () => {
      const rawDatacenterObj = await hclParser.parseToObject(`
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
      `);
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

    it('should pass variable values to environment modules', async () => {
      const rawDatacenterObj = await hclParser.parseToObject(`
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
      `);

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
        environment: 'test',
        plugin: 'pulumi',
      });

      assertEquals(graph.nodes, [expectedVpcNode]);
    });

    it('should pass variable values to resource hook modules', async () => {
      const rawDatacenterObj = await hclParser.parseToObject(`
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
              database = module.database.name
              username = module.database.username
              password = module.database.password
              url = module.database.url
            }
          }
        }
      `);

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
        environment: 'test',
        component: databaseAppGraphNode.component,
        appNodeId: databaseAppGraphNode.getId(),
      });

      assertEquals(infraGraph.nodes, [expectedDatabaseNode]);
    });

    it('should support var shorthand references', async () => {
      const rawDatacenterObj = await hclParser.parseToObject(`
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
      `);
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

    it('should allow variables to be used as default values for each other', async () => {
      const rawDatacenterObj = await hclParser.parseToObject(`
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
      `);
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

    it('should resolve operators inside resource hook when clauses', async () => {
      const rawDatacenterObj = await hclParser.parseToObject(`
        environment {
          database {
            when = node.inputs.databaseType == "postgres"

            module "database" {
              source = "test:latest"
              inputs = {
                type = "postgres"
              }
            }

            outputs = {
              host = module.database.host
              port = module.database.port
              database = module.database.name
              username = module.database.username
              password = module.database.password
              url = module.database.url
              protocol = "postgresql"
            }
          }
        }
      `);
      const datacenter = new DatacenterV1(rawDatacenterObj);

      const databaseNode = new AppGraphNode({
        type: 'database',
        name: 'database',
        component: 'some-component',
        inputs: {
          name: 'my-db',
          databaseType: 'postgres',
          databaseVersion: '15',
        },
      });

      const appGraph = new AppGraph({
        nodes: [databaseNode],
      });

      const graph = datacenter.getGraph(appGraph, {
        datacenterName: 'test',
        environmentName: 'test',
        variables: { region: 'nyc1' },
      });

      const expectedDatabaseModule = new InfraGraphNode({
        image: 'test:latest',
        inputs: {
          type: 'postgres',
        },
        name: 'database',
        environment: 'test',
        appNodeId: databaseNode.getId(),
        component: databaseNode.component,
        plugin: 'pulumi',
      });

      assertEquals(graph.nodes, [expectedDatabaseModule]);
    });

    it('should error when referencing a module in a when clause', async () => {
      const rawDatacenterObj = await hclParser.parseToObject(`
        environment {
          module "database" {
            source = "test:latest"
            inputs = {
              type = "postgres"
            }
          }

          database {
            when = node.inputs.databaseType == "postgres" && module.database.protocol == "postgresql"

            outputs = {
              host = module.database.host
              port = module.database.port
              name = module.database.name
              username = module.database.username
              password = module.database.password
              url = module.database.url
              protocol = "postgresql"
            }
          }
        }
      `);
      const datacenter = new DatacenterV1(rawDatacenterObj);

      const databaseNode = new AppGraphNode({
        type: 'database',
        name: 'database',
        component: 'some-component',
        inputs: {
          name: 'my-db',
          databaseType: 'postgres',
          databaseVersion: '15',
        },
      });

      const appGraph = new AppGraph({
        nodes: [databaseNode],
      });

      try {
        datacenter.getGraph(appGraph, {
          datacenterName: 'test',
          environmentName: 'test',
          variables: { region: 'nyc1' },
        });
        fail('Expected to throw ModuleReferencesNotAllowedInWhenClause error');
      } catch (err) {
        assertEquals(err, new ModuleReferencesNotAllowedInWhenClause());
      }
    });

    it('should support conditional modules', async () => {
      const rawDatacenterObj = await hclParser.parseToObject(`
        environment {
          module "database" {
            when = contains(environment.nodes.*.inputs.databaseType, "postgres")
            source = "architect-io/digitalocean-database:latest"
            inputs = {
              type = "postgres"
            }
          }

          module "redis" {
            when = contains(environment.nodes.*.inputs.databaseType, "redis")
            source = "architect-io/digitalocean-cache:latest"
            inputs = {
              type = "redis"
            }
          }
        }
      `);
      const datacenter = new DatacenterV1(rawDatacenterObj);

      const databaseNode = new AppGraphNode({
        type: 'database',
        name: 'database',
        component: 'some-component',
        inputs: {
          name: 'my-db',
          databaseType: 'postgres',
          databaseVersion: '15',
        },
      });

      const appGraph = new AppGraph({
        nodes: [databaseNode],
      });

      const graph = datacenter.getGraph(appGraph, {
        datacenterName: 'test',
        environmentName: 'test',
        variables: { region: 'nyc1' },
      });

      const expectedDatabaseModule = new InfraGraphNode({
        image: 'architect-io/digitalocean-database:latest',
        environment: 'test',
        inputs: {
          type: 'postgres',
        },
        name: 'database',
        plugin: 'pulumi',
      });

      assertEquals(graph.nodes, [expectedDatabaseModule]);
    });

    it('should support outputs without modules', async () => {
      const rawDatacenterObj = await hclParser.parseToObject(`
        environment {
          deployment {
            module "deployment" {
              source = "architect-io/kubernetes-deployment:latest"
              inputs = node.inputs
            }
          }

          ingress {
            outputs = {
              protocol = "\${node.inputs.protocol || "http"}"
              host = "\${node.inputs.service.host}.127.0.0.1.nip.io"
              port = 80
              url = "\${node.inputs.protocol || "http"}://\${node.inputs.service.host}.127.0.0.1.nip.io\${node.inputs.path || "/"}"
              path = "\${node.inputs.path || "/"}"
              subdomain = node.inputs.service.host
              dns_zone = "127.0.0.1.nip.io"
            }
          }
        }
      `);
      const datacenter = new DatacenterV1(rawDatacenterObj);

      const ingressNode = new AppGraphNode({
        type: 'ingress',
        name: 'ingress',
        component: 'component',
        inputs: {
          service: {
            name: 'my-service',
            host: 'my-service',
            port: '8080',
            protocol: 'http',
          },
          port: 8080,
          protocol: 'http',
          path: '/',
          internal: false,
        },
      });

      const deploymentNode = new AppGraphNode({
        type: 'deployment',
        name: 'deployment',
        component: 'component',
        inputs: {
          name: 'component--deployment',
          image: 'nginx:latest',
          environment: {
            URL: `\${{ ${ingressNode.getId()}.url }}`,
          },
        },
      });

      const appGraph = new AppGraph({
        nodes: [ingressNode, deploymentNode],
        edges: [
          new GraphEdge({
            from: deploymentNode.getId(),
            to: ingressNode.getId(),
          }),
        ],
      });

      const infraGraph = datacenter.getGraph(appGraph, {
        datacenterName: 'test',
        environmentName: 'test',
      });

      const expectedDeploymentNode = new InfraGraphNode({
        image: 'architect-io/kubernetes-deployment:latest',
        component: deploymentNode.component,
        environment: 'test',
        appNodeId: deploymentNode.getId(),
        inputs: {
          name: `${deploymentNode.component}--${deploymentNode.name}`,
          image: 'nginx:latest',
          environment: {
            URL: `http://my-service.127.0.0.1.nip.io/`,
          },
        },
        name: 'deployment',
        plugin: 'pulumi',
      });

      assertEquals(infraGraph.nodes, [expectedDeploymentNode]);
    });

    it('should support hooks matching mulitple nodes', async () => {
      const rawDatacenterObj = await hclParser.parseToObject(`
        environment {
          database {
            module "database" {
              source = "architect-io/postgres:latest"
              inputs = {
                name = node.inputs.name
                component = node.component
                environment = environment.name
              }
            }

            outputs = {
              protocol = "postgresql"
              host = "host.docker.internal"
              port = 5432
              username = "postgres"
              password = "password"
              database = module.database.name
              url = "postgresql://postgres:password@host.docker.internal:5432/\${module.database.name}"
            }
          }
        }
      `);
      const datacenter = new DatacenterV1(rawDatacenterObj);

      const database1Node = new AppGraphNode({
        type: 'database',
        name: 'database1',
        component: 'component/first',
        inputs: {
          databaseType: 'postgres',
          databaseVersion: '15',
          name: 'first',
        },
      });

      const database2Node = new AppGraphNode({
        type: 'database',
        name: 'database2',
        component: 'component/second',
        inputs: {
          databaseType: 'postgres',
          databaseVersion: '15',
          name: 'second',
        },
      });

      const appGraph = new AppGraph({
        nodes: [database1Node, database2Node],
      });

      const infraGraph = datacenter.getGraph(appGraph, {
        datacenterName: 'test',
        environmentName: 'test',
      });

      const expectedInfraNode1 = new InfraGraphNode({
        image: 'architect-io/postgres:latest',
        component: database1Node.component,
        environment: 'test',
        appNodeId: database1Node.getId(),
        inputs: {
          name: 'first',
          component: 'component/first',
          environment: 'test',
        },
        name: 'database',
        plugin: 'pulumi',
      });

      const expectedInfraNode2 = new InfraGraphNode({
        image: 'architect-io/postgres:latest',
        component: database2Node.component,
        environment: 'test',
        appNodeId: database2Node.getId(),
        inputs: {
          name: 'second',
          component: 'component/second',
          environment: 'test',
        },
        name: 'database',
        plugin: 'pulumi',
      });

      assertEquals(infraGraph.nodes, [expectedInfraNode1, expectedInfraNode2]);
    });

    it('should support app graph references in outputs', async () => {
      const rawDatacenterObj = await hclParser.parseToObject(`
        environment {
          deployment {
            module "deployment" {
              source = "architect-io/kubernetes-deployment:latest"
              inputs = node.inputs
            }
          }

          service {
            outputs = {
              protocol = "http"
              name = "host"
              host = "host"
              target_port = 8080
              port = 80
              url = "http://host"
            }
          }

          ingress {
            outputs = {
              protocol = "\${node.inputs.protocol || "http"}"
              host = "\${node.inputs.service.host}.127.0.0.1.nip.io"
              port = 80
              url = "\${node.inputs.protocol || "http"}://\${node.inputs.service.host}.127.0.0.1.nip.io\${node.inputs.path || "/"}"
              path = "\${node.inputs.path || "/"}"
              subdomain = node.inputs.service.host
              dns_zone = "127.0.0.1.nip.io"
            }
          }
        }
      `);
      const datacenter = new DatacenterV1(rawDatacenterObj);

      const serviceNode = new AppGraphNode({
        type: 'service',
        name: 'service',
        component: 'component',
        inputs: {
          port: 8080,
          deployment: 'deployment',
        },
      });

      const ingressNode = new AppGraphNode({
        type: 'ingress',
        name: 'ingress',
        component: 'component',
        inputs: {
          service: {
            name: `\${{ ${serviceNode.getId()}.name }}`,
            host: `\${{ ${serviceNode.getId()}.host }}`,
            port: `\${{ ${serviceNode.getId()}.port }}`,
            protocol: `\${{ ${serviceNode.getId()}.protocol }}`,
          },
          port: `\${{ ${serviceNode.getId()}.port }}`,
          protocol: `\${{ ${serviceNode.getId()}.protocol }}`,
          path: '/',
          internal: false,
        },
      });

      const deploymentNode = new AppGraphNode({
        type: 'deployment',
        name: 'deployment',
        component: 'component',
        inputs: {
          name: 'component--deployment',
          image: 'nginx:latest',
          environment: {
            URL: `\${{ ${ingressNode.getId()}.url }}`,
          },
        },
      });

      const appGraph = new AppGraph({
        nodes: [ingressNode, serviceNode, deploymentNode],
        edges: [
          new GraphEdge({
            from: ingressNode.getId(),
            to: serviceNode.getId(),
          }),
          new GraphEdge({
            from: deploymentNode.getId(),
            to: ingressNode.getId(),
          }),
        ],
      });

      const infraGraph = datacenter.getGraph(appGraph, {
        datacenterName: 'test',
        environmentName: 'test',
      });

      const expectedDeploymentNode = new InfraGraphNode({
        image: 'architect-io/kubernetes-deployment:latest',
        component: deploymentNode.component,
        environment: 'test',
        appNodeId: deploymentNode.getId(),
        inputs: {
          name: `${deploymentNode.component}--${deploymentNode.name}`,
          image: 'nginx:latest',
          environment: {
            URL: `http://host.127.0.0.1.nip.io/`,
          },
        },
        name: 'deployment',
        plugin: 'pulumi',
      });

      assertEquals(infraGraph.nodes, [expectedDeploymentNode]);
    });

    it('should support variables inside merge function', async () => {
      const rawDatacenterObj = await hclParser.parseToObject(`
        variable "dns_zone" {
          description = "DNS zone"
        }

        environment {
          ingress {
            module "ingressRule" {
              source = "architect-io/kubernetes-ingress-rule:latest"
              inputs = merge(node.inputs, {
                dns_zone = variable.dns_zone
              })
            }

            outputs = {
              protocol = "http"
              host = "subdomain.127.0.0.1.nip.io"
              port = 80
              url = "http://subdomain.127.0.0.1.nip.io"
              path = "/"
              subdomain = "subdomain"
              dns_zone = "127.0.0.1.nip.io"
            }
          }
        }
      `);
      const datacenter = new DatacenterV1(rawDatacenterObj);

      const ingressNode = new AppGraphNode({
        type: 'ingress',
        name: 'ingress',
        component: 'component',
        inputs: {
          service: {
            name: 'host',
            host: `host`,
            port: `port`,
            protocol: `protocol`,
          },
          port: 'port',
          protocol: `protocol`,
          path: '/',
          internal: false,
        },
      });

      const appGraph = new AppGraph({
        nodes: [ingressNode],
      });

      const infraGraph = datacenter.getGraph(appGraph, {
        datacenterName: 'test',
        environmentName: 'test',
        variables: {
          dns_zone: 'architect.io',
        },
      });

      const expectedIngressNode = new InfraGraphNode({
        image: 'architect-io/kubernetes-ingress-rule:latest',
        appNodeId: 'component/ingress/ingress',
        environment: 'test',
        name: 'ingressRule',
        plugin: 'pulumi',
        inputs: {
          dns_zone: 'architect.io',
          internal: false,
          path: '/',
          port: 'port',
          protocol: 'protocol',
          service: {
            name: 'host',
            host: 'host',
            port: 'port',
            protocol: 'protocol',
          },
        },
        component: 'component',
      });

      assertEquals(infraGraph.nodes, [expectedIngressNode]);
    });

    it('should extract ttl and return whether its expired', async () => {
      const rawDatacenterObj = await hclParser.parseToObject(`
        module "vpc" {
          source = "architect-io/digitalocean-vpc:latest"
          inputs = {}
          ttl = 10 * 60
        }

        module "cluster" {
          source = "architect-io/digitalocean-kubernetes:latest"
          inputs = {}
        }
      `);
      const datacenter = new DatacenterV1(rawDatacenterObj);
      const graph = datacenter.getGraph(new AppGraph(), { datacenterName: 'test' });

      const nodeWithTTL = new InfraGraphNode({
        name: 'vpc',
        plugin: 'pulumi',
        image: 'architect-io/digitalocean-vpc:latest',
        inputs: {},
        ttl: 600,
      });

      const nodeWithoutTTL = new InfraGraphNode({
        name: 'cluster',
        plugin: 'pulumi',
        image: 'architect-io/digitalocean-kubernetes:latest',
        inputs: {},
      });

      const finishedElevenMinsAgo = new InfraGraphNode({
        // These dont matter
        name: 'cluster',
        plugin: 'pulumi',
        image: 'architect-io/digitalocean-kubernetes:latest',
        inputs: {},
        status: {
          state: 'complete',
          lastUpdated: Date.now() - (11 * 60 * 1000),
        },
      });
      const finishedOneMinuteAgo = new InfraGraphNode({
        // These dont matter
        name: 'cluster',
        plugin: 'pulumi',
        image: 'architect-io/digitalocean-kubernetes:latest',
        inputs: {},
        status: {
          state: 'complete',
          lastUpdated: Date.now() - (60 * 1000),
        },
      });

      assertArrayIncludes(graph.nodes, [nodeWithTTL, nodeWithoutTTL]);

      // No TTL is defined, always should be false
      assertFalse(nodeWithoutTTL.isTTLExpired(finishedOneMinuteAgo));
      assertFalse(nodeWithoutTTL.isTTLExpired(finishedElevenMinsAgo));

      // TTL is 10 minutes, expired when previous node comparing to finished 11 mins ago.
      assert(nodeWithTTL.isTTLExpired(finishedElevenMinsAgo));
      assertFalse(nodeWithTTL.isTTLExpired(finishedOneMinuteAgo));
    });
  });
});
