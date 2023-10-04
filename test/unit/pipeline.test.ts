import { assert, assertArrayIncludes, assertEquals, assertExists, assertObjectMatch } from "https://deno.land/std@0.202.0/assert/mod.ts";
import { describe, it } from 'std/testing/bdd.ts';
import { stub } from "std/testing/mock.ts";
import { FakeTime } from "std/testing/time.ts";
import { CloudEdge, CloudGraph, CloudNode } from "../../src/cloud-graph/index.ts";
import { CommandHelper } from "../../src/commands/base-command.ts";
import { ApplyRequest, ModuleHelpers } from '../../src/modules/index.ts';
import { Pipeline, PlanContext } from "../../src/pipeline/index.ts";
import { PipelineStep } from "../../src/pipeline/step.ts";
import ArcCtlConfig from "../../src/utils/config.ts";
import { ArcctlProviderStore } from "../../src/utils/provider-store.ts";

describe('plan datacenter pipeline', async () => {
  it('create datacenter pipeline with vpc', async () => {
    const vpc_node = new CloudNode<'module'>({
      name: 'vpc',
      inputs: {
        type: 'module'
      },
    });
  
    const after: CloudGraph = new CloudGraph({ nodes: [vpc_node], edges: [] });
    
    const pipeline = await Pipeline.plan({
      before: new Pipeline({ steps: [], edges: [] }),
      after,
      context: PlanContext.Datacenter,
    }, new CommandHelper({}).providerStore);
  
    assertEquals(pipeline.steps.length, 1);
    assertEquals(pipeline.edges.length, 0);
    assertEquals(pipeline.steps[0].name, 'vpc');
    assertEquals(pipeline.steps[0].action, 'create');
    assertEquals(pipeline.steps[0].status.state, 'pending');
    assertEquals(pipeline.steps[0].type, 'module');
  });
  
  it('create datacenter pipeline with vpc and database cluster', async () => {
    const vpc_module_name = 'vpc';
    const vpc_node = new CloudNode<'module'>({
      name: vpc_module_name,
      inputs: {
        type: 'module'
      },
    });
    const database_cluster_module_name = 'databaseCluster';
    const database_cluster_node = new CloudNode<'module'>({
      name: database_cluster_module_name,
      inputs: {
        vpc_name: `\${{ module/${vpc_module_name}.name }}`,
        type: 'module'
      }
    });

    const vpc_database_cluster_edge = new CloudEdge({ from: database_cluster_node.id, to: vpc_node.id });
  
    const after: CloudGraph = new CloudGraph({ nodes: [vpc_node, database_cluster_node], edges: [vpc_database_cluster_edge] });
    
    const pipeline = await Pipeline.plan({
      before: new Pipeline({ steps: [], edges: [] }),
      after,
      context: PlanContext.Datacenter,
    }, new CommandHelper({}).providerStore);

    assertEquals(pipeline.steps.length, 2);
    assertEquals(pipeline.edges.length, 1);

    const vpc_step = pipeline.steps.find(s => s.name === vpc_module_name);
    const database_cluster_step = pipeline.steps.find(s => s.name === database_cluster_module_name);

    assertEquals(vpc_step!.name, vpc_module_name);
    assertEquals(vpc_step!.action, 'create');
    assertEquals(vpc_step!.status.state, 'pending');
    assertEquals(vpc_step!.type, 'module'); 

    assertEquals(database_cluster_step!.name, database_cluster_module_name);
    assertEquals(database_cluster_step!.action, 'create');
    assertEquals(database_cluster_step!.status.state, 'pending');
    assertEquals(database_cluster_step!.type, 'module');
    assertEquals(database_cluster_step!.inputs!.vpc_name!, `\${{ module/${vpc_module_name}-blue.name }}`);

    assertEquals(pipeline.edges[0].from, `module/${database_cluster_module_name}-blue`);
    assertEquals(pipeline.edges[0].to, `module/${vpc_module_name}-blue`);
  });

  it('create datacenter pipeline with vpc, deployment, service, ingressRule, and gateway', async () => {
    const vpc_module_name = 'vpc';
    const vpc_node = new CloudNode<'module'>({
      name: vpc_module_name,
      inputs: {
        type: 'module'
      },
    });
    const deployment_module_name = 'deployment';
    const deployment_node = new CloudNode<'module'>({
      name: deployment_module_name,
      inputs: {
        vpc_name: `\${{ module/${vpc_module_name}.name }}`,
        type: 'module'
      }
    });
    const service_module_name = 'service';
    const service_node = new CloudNode<'module'>({
      name: service_module_name,
      inputs: {
        vpc: `\${{ module/${vpc_module_name}.name }}`,
        target_deployment_id: `\${{ module/${deployment_module_name}.id }}`,
        type: 'module'
      }
    });
    const ingress_module_name = 'ingress';
    const ingress_node = new CloudNode<'module'>({
      name: ingress_module_name,
      inputs: {
        service_id: `\${{ module/${service_module_name}.id }}`,
        type: 'module'
      }
    });
    const gateway_module_name = 'gateway';
    const gateway_node = new CloudNode<'module'>({
      name: gateway_module_name,
      inputs: {
        vpc: `\${{ module/${vpc_module_name}.name }}`,
        ingress_rule_id: `\${{ module/${ingress_module_name}.id }}`,
        type: 'module'
      }
    });

    const deployment_vpc_edge = new CloudEdge({ from: deployment_node.id, to: vpc_node.id });
    const service_vpc_edge = new CloudEdge({ from: service_node.id, to: vpc_node.id });
    const gateway_ingress_edge = new CloudEdge({ from: gateway_node.id, to: ingress_node.id });
    const ingress_service_edge = new CloudEdge({ from: ingress_node.id, to: service_node.id });
    const service_deployment_edge = new CloudEdge({ from: service_node.id, to: deployment_node.id });
  
    const after: CloudGraph = new CloudGraph({ 
      nodes: [vpc_node, deployment_node, service_node, ingress_node, gateway_node], 
      edges: [deployment_vpc_edge, service_vpc_edge, gateway_ingress_edge, ingress_service_edge, service_deployment_edge] 
    });
    
    const pipeline = await Pipeline.plan({
      before: new Pipeline({ steps: [], edges: [] }),
      after,
      context: PlanContext.Datacenter,
    }, new CommandHelper({}).providerStore);

    assertEquals(pipeline.steps.length, 5);
    assertEquals(pipeline.edges.length, 5);

    const vpc_step = pipeline.steps.find(s => s.name === vpc_module_name);
    const deployment_step = pipeline.steps.find(s => s.name === deployment_module_name);
    const service_step = pipeline.steps.find(s => s.name === service_module_name);
    const ingress_step = pipeline.steps.find(s => s.name === ingress_module_name);
    const gateway_step = pipeline.steps.find(s => s.name === gateway_module_name);

    assertEquals(vpc_step!.name, vpc_module_name);
    assertEquals(vpc_step!.action, 'create');
    assertEquals(vpc_step!.status.state, 'pending');
    assertEquals(vpc_step!.type, 'module');

    assertEquals(deployment_step!.name, deployment_module_name);
    assertEquals(deployment_step!.action, 'create');
    assertEquals(deployment_step!.status.state, 'pending');
    assertEquals(deployment_step!.type, 'module');
    assertObjectMatch(deployment_step!.inputs!, { vpc_name: `\${{ module/${vpc_module_name}-blue.name }}` });

    assertEquals(service_step!.name, service_module_name);
    assertEquals(service_step!.action, 'create');
    assertEquals(service_step!.status.state, 'pending');
    assertEquals(service_step!.type, 'module');
    assertObjectMatch(service_step!.inputs!, { vpc: `\${{ module/${vpc_module_name}-blue.name }}` });
    assertObjectMatch(service_step!.inputs!, { target_deployment_id: `\${{ module/${deployment_module_name}-blue.id }}` });

    assertEquals(ingress_step!.name, ingress_module_name);
    assertEquals(ingress_step!.action, 'create');
    assertEquals(ingress_step!.status.state, 'pending');
    assertEquals(ingress_step!.type, 'module');
    assertObjectMatch(ingress_step!.inputs!, { service_id: `\${{ module/${service_module_name}-blue.id }}` });

    assertEquals(gateway_step!.name, gateway_module_name);
    assertEquals(gateway_step!.action, 'create');
    assertEquals(gateway_step!.status.state, 'pending');
    assertEquals(gateway_step!.type, 'module');
    assertObjectMatch(gateway_step!.inputs!, { ingress_rule_id: `\${{ module/${ingress_module_name}-blue.id }}` });

    const pipeline_deployment_vpc_edge = pipeline.edges.find(e => e.from === `module/${deployment_module_name}-blue` && e.to === `module/${vpc_module_name}-blue`);
    assertExists(pipeline_deployment_vpc_edge);
    const pipeline_gateway_ingress_edge = pipeline.edges.find(e => e.from === `module/${gateway_module_name}-blue` && e.to === `module/${ingress_module_name}-blue`);
    assertExists(pipeline_gateway_ingress_edge);
    const pipeline_ingress_service_edge = pipeline.edges.find(e => e.from === `module/${ingress_module_name}-blue` && e.to === `module/${service_module_name}-blue`);
    assertExists(pipeline_ingress_service_edge);
    const pipeline_service_deployment_edge = pipeline.edges.find(e => e.from === `module/${service_module_name}-blue` && e.to === `module/${deployment_module_name}-blue`);
    assertExists(pipeline_service_deployment_edge);
    const pipeline_service_vpc_edge = pipeline.edges.find(e => e.from === `module/${service_module_name}-blue` && e.to === `module/${vpc_module_name}-blue`);
    assertExists(pipeline_service_vpc_edge);
  });

  it('create datacenter pipeline with vpc, databaseCluster, database, and databaseUser', async () => {
    const vpc_module_name = 'vpc';
    const vpc_node = new CloudNode<'module'>({
      name: vpc_module_name,
      inputs: {
        type: 'module'
      },
    });
    const database_cluster_module_name = 'databaseCluster';
    const database_cluster_node = new CloudNode<'module'>({
      name: database_cluster_module_name,
      inputs: {
        type: 'module',
        vpc_name: `\${{ module/${vpc_module_name}.name }}`
      },
    });
    const database_module_name = 'database';
    const database_node = new CloudNode<'module'>({
      name: database_module_name,
      inputs: {
        type: 'module',
        database_cluster_id: `\${{ module/${database_cluster_module_name}.id }}`
      },
    });
    const database_user_module_name = 'databaseUser';
    const database_user_node = new CloudNode<'module'>({
      name: database_user_module_name,
      inputs: {
        type: 'module',
        database_id: `\${{ module/${database_module_name}.id }}`
      },
    });

    const database_database_cluster_edge = new CloudEdge({ from: database_node.id, to: database_cluster_node.id });
    const database_cluster_vpc_edge = new CloudEdge({ from: database_cluster_node.id, to: vpc_node.id });
    const database_user_database_edge = new CloudEdge({ from: database_user_node.id, to: database_node.id });
  
    const after: CloudGraph = new CloudGraph({ 
      nodes: [vpc_node, database_cluster_node, database_node, database_user_node], 
      edges: [database_database_cluster_edge, database_cluster_vpc_edge, database_user_database_edge]
    });
    
    const pipeline = await Pipeline.plan({
      before: new Pipeline({ steps: [], edges: [] }),
      after,
      context: PlanContext.Datacenter,
    }, new CommandHelper({}).providerStore);

    assertEquals(pipeline.steps.length, 4);
    assertEquals(pipeline.edges.length, 3);

    const vpc_step = pipeline.steps.find(s => s.name === vpc_module_name);
    const database_cluster_step = pipeline.steps.find(s => s.name === database_cluster_module_name);
    const database_step = pipeline.steps.find(s => s.name === database_module_name);
    const database_user_step = pipeline.steps.find(s => s.name === database_user_module_name);

    assertEquals(vpc_step!.name, vpc_module_name);
    assertEquals(vpc_step!.action, 'create');
    assertEquals(vpc_step!.status.state, 'pending');
    assertEquals(vpc_step!.type, 'module');

    assertEquals(database_cluster_step!.name, database_cluster_module_name);
    assertEquals(database_cluster_step!.action, 'create');
    assertEquals(database_cluster_step!.status.state, 'pending');
    assertEquals(database_cluster_step!.type, 'module');
    assertObjectMatch(database_cluster_step!.inputs!, { vpc_name: `\${{ module/${vpc_module_name}-blue.name }}` });

    assertEquals(database_step!.name, database_module_name);
    assertEquals(database_step!.action, 'create');
    assertEquals(database_step!.status.state, 'pending');
    assertEquals(database_step!.type, 'module');
    assertObjectMatch(database_step!.inputs!, { database_cluster_id: `\${{ module/${database_cluster_module_name}-blue.id }}` });

    assertEquals(database_user_step!.name, database_user_module_name);
    assertEquals(database_user_step!.action, 'create'); // TODO: why are these not enums?
    assertEquals(database_user_step!.status.state, 'pending'); // TODO: why are these not enums?
    assertEquals(database_user_step!.type, 'module');
    assertObjectMatch(database_user_step!.inputs!, { database_id: `\${{ module/${database_module_name}-blue.id }}` });

    const pipeline_database_cluster_vpc_edge = pipeline.edges.find(e => e.from === `module/${database_cluster_module_name}-blue` && e.to === `module/${vpc_module_name}-blue`);
    assertExists(pipeline_database_cluster_vpc_edge);
    const pipeline_database_database_cluster_edge = pipeline.edges.find(e => e.from === `module/${database_module_name}-blue` && e.to === `module/${database_cluster_module_name}-blue`);
    assertExists(pipeline_database_database_cluster_edge);
    const pipeline_database_user_database_edge = pipeline.edges.find(e => e.from === `module/${database_user_module_name}-blue` && e.to === `module/${database_module_name}-blue`);
    assertExists(pipeline_database_user_database_edge);
  });
});

describe('apply datacenter pipeline', async() => {
  it('apply datacenter pipeline with vpc', async () => {
    const vpc_name_input = 'test-vpc';
    const vpc_step = new PipelineStep({
      name: 'vpc',
      type: 'module',
      action: 'create',
      color: 'blue',
      status: {
        state: 'pending'
      },
      image: 'sha256:cf151edf4350161cd3243f8d5270ae4f1516516b633b2a02c99bed717af2d20e',
      hash: '70e1926639496e8fe63f908333dfc8cda1b1e237cdd0675aedc5d44b569c8be1',
      inputs: {
        name: vpc_name_input,
        type: 'module'
      }
    });

    const pipeline = new Pipeline({ steps: [vpc_step], edges: [] });

    const provider_store = new ArcctlProviderStore(ArcCtlConfig.getStateBackend());
    const apply_stub = stub(ModuleHelpers, 'Apply', async () => { return { state: '', outputs: {} } });
    const applied_pipeline = await pipeline.apply({ providerStore: provider_store }).toPromise();

    assertEquals(pipeline.steps.length, 1);
    assertEquals(pipeline.edges.length, 0);

    const vpc_apply_call = apply_stub.calls[0];
    assertArrayIncludes(vpc_apply_call.args[0].inputs, [['name', vpc_name_input]]);
    assertEquals(applied_pipeline!.steps[0].status.state, 'complete');

    apply_stub.restore();
  });

  it('apply datacenter pipeline with vpc and database cluster', async () => {
    const vpc_name_input = 'test-vpc';
    const vpc_module_name = 'vpc';
    const vpc_step = new PipelineStep({
      name: vpc_module_name,
      type: 'module',
      action: 'create',
      color: 'blue',
      status: {
        state: 'pending'
      },
      image: 'sha256:cf151edf4350161cd3243f8d5270ae4f1516516b633b2a02c99bed717af2d20e',
      hash: '70e1926639496e8fe63f908333dfc8cda1b1e237cdd0675aedc5d44b569c8be1',
      inputs: {
        name: vpc_name_input,
        type: 'module'
      }
    });
    const database_cluster_name_input = 'test-database-cluster';
    const database_cluster_module_name = 'databaseCluster';
    const database_cluster_step = new PipelineStep({
      name: database_cluster_module_name,
      type: 'module',
      action: 'create',
      color: 'blue',
      status: {
        state: 'pending'
      },
      image: 'sha256:ed0b3c73b462bf14711b939520146f5c63b06297e569495c6bb4205441c251b0',
      hash: '517bbb1ee41c14803eab707b157c3796d2ad746e7e1206b7ce2a9d4ebb5fccb5',
      inputs: {
        name: database_cluster_name_input,
        vpc_name: `\${{ module/${vpc_module_name}-blue.name }}`,
        type: 'module'
      }
    });
    const database_cluster_vpc_edge = new CloudEdge({ from: database_cluster_step.id, to: vpc_step.id });

    const pipeline = new Pipeline({ steps: [database_cluster_step, vpc_step], edges: [database_cluster_vpc_edge] });

    const time = new FakeTime();
    const provider_store = new ArcctlProviderStore(ArcCtlConfig.getStateBackend());
    const apply_stub = stub(ModuleHelpers, 'Apply', async (request: ApplyRequest) => {
      time.tick(1); // used because apply times need to be compared later, and in this mock, they could otherwise be exactly the same
      let outputs = {};
      if (request.inputs.find(e => e.includes('name') && e.includes(vpc_name_input))) {
        outputs = { name: vpc_name_input };
      }
      return { state: '', outputs };
    }); 
    const applied_pipeline = await pipeline.apply({ providerStore: provider_store }).toPromise();
    
    assertEquals(pipeline.steps.length, 2);
    assertEquals(pipeline.edges.length, 1);

    const vpc_apply_call = apply_stub.calls.find(c => c.args[0].inputs.find(i => i.includes('name') && i.includes(vpc_name_input)));
    assertArrayIncludes(vpc_apply_call!.args[0].inputs, [['name', vpc_name_input]]);
    const applied_vpc_step = applied_pipeline!.steps.find(s => s.name === vpc_module_name);
    assertEquals(applied_vpc_step!.status.state, 'complete'); 
    assertEquals(applied_vpc_step!.outputs!.name!, vpc_name_input); 

    const database_cluster_apply_call = apply_stub.calls.find(c => c.args[0].inputs.find(i => i.includes('name') && i.includes(database_cluster_name_input)));
    assertArrayIncludes(database_cluster_apply_call!.args[0].inputs, [['name', database_cluster_name_input]]);
    assertArrayIncludes(database_cluster_apply_call!.args[0].inputs, [['vpc_name', vpc_name_input]]);
    const applied_database_cluster_step = applied_pipeline!.steps.find(s => s.name === database_cluster_module_name);
    assertEquals(applied_database_cluster_step!.status.state, 'complete');
    assert(applied_vpc_step!.status!.startTime! < applied_database_cluster_step!.status!.startTime!); // TODO: this shows that the vpc was applied, then the cluster, after execution. how is the order determined and tested for _before_ execution?
    
    const pipeline_database_cluster_vpc_edge = pipeline.edges.find(e => e.from === `module/${database_cluster_module_name}-blue` && e.to === `module/${vpc_module_name}-blue`);
    assertExists(pipeline_database_cluster_vpc_edge);

    apply_stub.restore();
  });

  it('apply datacenter pipeline with vpc, gateway, ingress, service, and deployment', async () => {
    const deployment_module_name = 'deployment';
    const gateway_module_name = 'gateway';
    const ingress_module_name = 'ingress';
    const service_module_name = 'service';
    const vpc_module_name = 'vpc';

    const deployment_name_input = 'test-deployment';
    const deployment_step = new PipelineStep({
      name: deployment_module_name,
      type: 'module',
      action: 'create',
      color: 'blue',
      status: {
        state: 'pending'
      },
      image: 'sha256:cf151edf4350161cd3243f8d5270ae4f1516516b633b2a02c99bed717af2d20e',
      hash: '70e1926639496e8fe63f908333dfc8cda1b1e237cdd0675aedc5d44b569c8be1',
      inputs: {
        name: deployment_name_input,
        type: 'module',
        vpc_name: `\${{ module/${vpc_module_name}-blue.name }}`
      }
    });
    const gateway_name_input = 'test-gateway';
    const gateway_step = new PipelineStep({
      name: gateway_module_name,
      type: 'module',
      action: 'create',
      color: 'blue',
      status: {
        state: 'pending'
      },
      image: 'sha256:cf151edf4350161cd3243f8d5270ae4f1516516b633b2a02c99bed717af2d20e',
      hash: '70e1926639496e8fe63f908333dfc8cda1b1e237cdd0675aedc5d44b569c8be1',
      inputs: {
        name: gateway_name_input,
        type: 'module',
        ingress_rule_id: `\${{ module/${ingress_module_name}-blue.id }}`
      }
    });
    const ingress_name_input = 'test-ingress';
    const ingress_step = new PipelineStep({
      name: ingress_module_name,
      type: 'module',
      action: 'create',
      color: 'blue',
      status: {
        state: 'pending'
      },
      image: 'sha256:cf151edf4350161cd3243f8d5270ae4f1516516b633b2a02c99bed717af2d20e',
      hash: '70e1926639496e8fe63f908333dfc8cda1b1e237cdd0675aedc5d44b569c8be1',
      inputs: {
        name: ingress_name_input,
        type: 'module',
        service_id: `\${{ module/${service_module_name}-blue.id }}`
      }
    });
    const service_name_input = 'test-service';
    const service_step = new PipelineStep({
      name: service_module_name,
      type: 'module',
      action: 'create',
      color: 'blue',
      status: {
        state: 'pending'
      },
      image: 'sha256:cf151edf4350161cd3243f8d5270ae4f1516516b633b2a02c99bed717af2d20e',
      hash: '70e1926639496e8fe63f908333dfc8cda1b1e237cdd0675aedc5d44b569c8be1',
      inputs: {
        name: service_name_input,
        type: 'module',
        vpc_name: `\${{ module/${vpc_module_name}-blue.name }}`,
        deployment_id: `\${{ module/${deployment_module_name}-blue.id }}`,
      }
    });
    const vpc_name_input = 'test-vpc';
    const vpc_step = new PipelineStep({
      name: vpc_module_name,
      type: 'module',
      action: 'create',
      color: 'blue',
      status: {
        state: 'pending'
      },
      image: 'sha256:cf151edf4350161cd3243f8d5270ae4f1516516b633b2a02c99bed717af2d20e',
      hash: '70e1926639496e8fe63f908333dfc8cda1b1e237cdd0675aedc5d44b569c8be1',
      inputs: {
        name: vpc_name_input,
        type: 'module'
      }
    });

    const deployment_vpc_edge = new CloudEdge({ from: deployment_step.id, to: vpc_step.id });
    const gateway_ingress_edge = new CloudEdge({ from: gateway_step.id, to: ingress_step.id });
    const ingress_service_edge = new CloudEdge({ from: ingress_step.id, to: service_step.id });
    const service_deployment_edge = new CloudEdge({ from: service_step.id, to: deployment_step.id });
    const service_vpc_edge = new CloudEdge({ from: service_step.id, to: vpc_step.id });

    const pipeline = new Pipeline({ 
      steps: [deployment_step, gateway_step, ingress_step, service_step, vpc_step], 
      edges: [deployment_vpc_edge, gateway_ingress_edge, ingress_service_edge, service_deployment_edge, service_vpc_edge] 
    });

    const time = new FakeTime();
    const provider_store = new ArcctlProviderStore(ArcCtlConfig.getStateBackend());
    const apply_stub = stub(ModuleHelpers, 'Apply', async (request: ApplyRequest) => {
      time.tick(1); // used because apply times need to be compared later, and in this mock, they could otherwise be exactly the same
      let outputs = {};
      if (request.inputs.find(e => e.includes('name') && e.includes(vpc_name_input))) { 
        outputs = { name: vpc_name_input };
      } else if (request.inputs.find(e => e.includes('name') && e.includes(deployment_name_input))) {
        outputs = { id: 'deployment_id' };
      } else if (request.inputs.find(e => e.includes('name') && e.includes(service_name_input))) {
        outputs = { id: 'service_id' };
      } else if (request.inputs.find(e => e.includes('name') && e.includes(ingress_name_input))) {
        outputs = { id: 'ingress_id' };
      }
      return { state: '', outputs };
    }); 
    const applied_pipeline = await pipeline.apply({ providerStore: provider_store }).toPromise();
    
    assertEquals(pipeline.steps.length, 5);
    assertEquals(pipeline.edges.length, 5);

    // TODO: tests

    apply_stub.restore();
  });

  // TODO: apply larger dc with database -> user
  
});
