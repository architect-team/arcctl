import * as hclParser from 'hcl2-parser';
import { assertEquals } from 'std/testing/asserts.ts';
import { describe, it } from 'std/testing/bdd.ts';
import { GraphEdge } from '../../../graphs/edge.ts';
import { AppGraph, InfraGraphNode } from '../../../graphs/index.ts';
import { DatacenterV1 } from '../index.ts';

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
        action: 'create',
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
        action: 'create',
        image: 'architect-io/digitalocean-vpc:latest',
        inputs: {
          name: 'my-vpc',
          region: 'nyc1',
        },
        name: 'vpc',
        plugin: 'pulumi',
      });

      const expectedClusterNode = new InfraGraphNode({
        action: 'create',
        image: 'architect-io/digitalocean-kubernetes:latest',
        inputs: {
          name: `\${{ ${expectedVpcNode.getId()}.name }}-cluster`,
          vpc_id: `\${{ ${expectedVpcNode.getId()}.id }}`,
        },
        name: 'cluster',
        plugin: 'pulumi',
      });

      const expectedEdge = new GraphEdge({
        from: expectedClusterNode.getId(),
        to: expectedVpcNode.getId(),
      });

      assertEquals(graph.nodes, [expectedVpcNode, expectedClusterNode]);
      assertEquals(graph.edges, [expectedEdge]);
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
        action: 'create',
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

    it('should connect environment modules to datacenter modules', () => {
    });
  });
});
