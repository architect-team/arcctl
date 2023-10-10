import { assert, assertArrayIncludes, assertEquals, assertExists, assertObjectMatch } from 'https://deno.land/std@0.202.0/assert/mod.ts';
import { describe, it } from 'std/testing/bdd.ts';
import { stub } from 'std/testing/mock.ts';
import { FakeTime } from 'std/testing/time.ts';
import { CloudEdge, CloudGraph, CloudNode } from '../../src/cloud-graph/index.ts';
import { CommandHelper } from '../../src/commands/base-command.ts';
import { ApplyRequest, ModuleHelpers } from '../../src/modules/index.ts';
import { Pipeline, PlanContext } from '../../src/pipeline/index.ts';
import { PipelineStep } from '../../src/pipeline/step.ts';
import ArcCtlConfig from '../../src/utils/config.ts';
import { ArcctlProviderStore } from '../../src/utils/provider-store.ts';

describe('plan apply datacenter pipeline', async () => {
  it('plan create datacenter pipeline with vpc', async () => {
    const vpc_node = new CloudNode<'module'>({
      name: 'vpc',
      plugin: 'pulumi',
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
  
  it('plan create datacenter pipeline with vpc and database cluster', async () => {
    const vpc_module_name = 'vpc';
    const vpc_node = new CloudNode<'module'>({
      name: vpc_module_name,
      plugin: 'pulumi',
      inputs: {
        type: 'module'
      },
    });
    const database_cluster_module_name = 'databaseCluster';
    const database_cluster_node = new CloudNode<'module'>({
      name: database_cluster_module_name,
      plugin: 'pulumi',
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

  it('plan create datacenter pipeline with vpc, deployment, service, ingressRule, and gateway', async () => {
    const vpc_module_name = 'vpc';
    const vpc_node = new CloudNode<'module'>({
      name: vpc_module_name,
      plugin: 'pulumi',
      inputs: {
        type: 'module'
      },
    });
    const deployment_module_name = 'deployment';
    const deployment_node = new CloudNode<'module'>({
      name: deployment_module_name,
      plugin: 'pulumi',
      inputs: {
        vpc_name: `\${{ module/${vpc_module_name}.name }}`,
        type: 'module'
      }
    });
    const service_module_name = 'service';
    const service_node = new CloudNode<'module'>({
      name: service_module_name,
      plugin: 'pulumi',
      inputs: {
        vpc: `\${{ module/${vpc_module_name}.name }}`,
        target_deployment_id: `\${{ module/${deployment_module_name}.id }}`,
        type: 'module'
      }
    });
    const ingress_module_name = 'ingress';
    const ingress_node = new CloudNode<'module'>({
      name: ingress_module_name,
      plugin: 'pulumi',
      inputs: {
        service_id: `\${{ module/${service_module_name}.id }}`,
        type: 'module'
      }
    });
    const gateway_module_name = 'gateway';
    const gateway_node = new CloudNode<'module'>({
      name: gateway_module_name,
      plugin: 'pulumi',
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

  it('plan create datacenter pipeline with vpc, databaseCluster, database, and databaseUser', async () => {
    const vpc_module_name = 'vpc';
    const vpc_node = new CloudNode<'module'>({
      name: vpc_module_name,
      plugin: 'pulumi',
      inputs: {
        type: 'module'
      },
    });
    const database_cluster_module_name = 'databaseCluster';
    const database_cluster_node = new CloudNode<'module'>({
      name: database_cluster_module_name,
      plugin: 'pulumi',
      inputs: {
        type: 'module',
        vpc_name: `\${{ module/${vpc_module_name}.name }}`
      },
    });
    const database_module_name = 'database';
    const database_node = new CloudNode<'module'>({
      name: database_module_name,
      plugin: 'pulumi',
      inputs: {
        type: 'module',
        database_cluster_id: `\${{ module/${database_cluster_module_name}.id }}`
      },
    });
    const database_user_module_name = 'databaseUser';
    const database_user_node = new CloudNode<'module'>({
      name: database_user_module_name,
      plugin: 'pulumi',
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
      plugin: 'pulumi',
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
      plugin: 'pulumi',
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
      plugin: 'pulumi',
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
    assert(applied_vpc_step!.status!.startTime! < applied_database_cluster_step!.status!.startTime!);
    
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

    const deployment_id = 'deployment_id';
    const service_id = 'service_id';
    const ingress_rule_id = 'ingress_rule_id';

    const deployment_name_input = 'test-deployment';
    const deployment_step = new PipelineStep({
      name: deployment_module_name,
      type: 'module',
      plugin: 'pulumi',
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
      plugin: 'pulumi',
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
      plugin: 'pulumi',
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
      plugin: 'pulumi',
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
      plugin: 'pulumi',
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
        outputs = { id: deployment_id };
      } else if (request.inputs.find(e => e.includes('name') && e.includes(service_name_input))) {
        outputs = { id: service_id };
      } else if (request.inputs.find(e => e.includes('name') && e.includes(ingress_name_input))) {
        outputs = { id: ingress_rule_id };
      }
      return { state: '', outputs };
    }); 
    const applied_pipeline = await pipeline.apply({ providerStore: provider_store }).toPromise();
    
    assertEquals(pipeline.steps.length, 5);
    assertEquals(pipeline.edges.length, 5);

    const vpc_apply_call = apply_stub.calls.find(c => c.args[0].inputs.find(i => i.includes('name') && i.includes(vpc_name_input)));
    assertArrayIncludes(vpc_apply_call!.args[0].inputs, [['name', vpc_name_input]]);
    const applied_vpc_step = applied_pipeline!.steps.find(s => s.name === vpc_module_name);
    assertEquals(applied_vpc_step!.status.state, 'complete'); 
    assertEquals(applied_vpc_step!.outputs!.name!, vpc_name_input); 

    const deployment_apply_call = apply_stub.calls.find(c => c.args[0].inputs.find(i => i.includes('name') && i.includes(deployment_name_input)));
    assertArrayIncludes(deployment_apply_call!.args[0].inputs, [['name', deployment_name_input]]);
    assertArrayIncludes(deployment_apply_call!.args[0].inputs, [['vpc_name', vpc_name_input]]);
    const applied_deployment_step = applied_pipeline!.steps.find(s => s.name === deployment_module_name);
    assertEquals(applied_deployment_step!.status.state, 'complete');
    assert(applied_vpc_step!.status!.startTime! < applied_deployment_step!.status!.startTime!);

    const service_apply_call = apply_stub.calls.find(c => c.args[0].inputs.find(i => i.includes('name') && i.includes(service_name_input)));
    assertArrayIncludes(service_apply_call!.args[0].inputs, [['name', service_name_input]]);
    assertArrayIncludes(service_apply_call!.args[0].inputs, [['vpc_name', vpc_name_input]]);
    assertArrayIncludes(service_apply_call!.args[0].inputs, [['deployment_id', deployment_id]]);
    const applied_service_step = applied_pipeline!.steps.find(s => s.name === service_module_name);
    assertEquals(applied_service_step!.status.state, 'complete');
    assert(applied_deployment_step!.status!.startTime! < applied_service_step!.status!.startTime!);

    const ingress_apply_call = apply_stub.calls.find(c => c.args[0].inputs.find(i => i.includes('name') && i.includes(ingress_name_input)));
    assertArrayIncludes(ingress_apply_call!.args[0].inputs, [['name', ingress_name_input]]);
    assertArrayIncludes(ingress_apply_call!.args[0].inputs, [['service_id', service_id]]);
    const applied_ingress_step = applied_pipeline!.steps.find(s => s.name === ingress_module_name);
    assertEquals(applied_ingress_step!.status.state, 'complete');
    assert(applied_service_step!.status!.startTime! < applied_ingress_step!.status!.startTime!);

    const gateway_apply_call = apply_stub.calls.find(c => c.args[0].inputs.find(i => i.includes('name') && i.includes(gateway_name_input)));
    assertArrayIncludes(gateway_apply_call!.args[0].inputs, [['name', gateway_name_input]]);
    assertArrayIncludes(gateway_apply_call!.args[0].inputs, [['ingress_rule_id', ingress_rule_id]]);
    const applied_gateway_step = applied_pipeline!.steps.find(s => s.name === gateway_module_name);
    assertEquals(applied_gateway_step!.status.state, 'complete');
    assert(applied_ingress_step!.status!.startTime! < applied_gateway_step!.status!.startTime!);

    const pipeline_deployment_vpc_edge = pipeline.edges.find(e => e.from === `module/${deployment_module_name}-blue` && e.to === `module/${vpc_module_name}-blue`);
    assertExists(pipeline_deployment_vpc_edge);
    const pipeline_service_vpc_edge = pipeline.edges.find(e => e.from === `module/${service_module_name}-blue` && e.to === `module/${vpc_module_name}-blue`);
    assertExists(pipeline_service_vpc_edge);
    const pipeline_service_deployment_edge = pipeline.edges.find(e => e.from === `module/${service_module_name}-blue` && e.to === `module/${deployment_module_name}-blue`);
    assertExists(pipeline_service_deployment_edge);
    const pipeline_ingress_service_edge = pipeline.edges.find(e => e.from === `module/${ingress_module_name}-blue` && e.to === `module/${service_module_name}-blue`);
    assertExists(pipeline_ingress_service_edge);
    const pipeline_gateway_ingress_edge = pipeline.edges.find(e => e.from === `module/${gateway_module_name}-blue` && e.to === `module/${ingress_module_name}-blue`);
    assertExists(pipeline_gateway_ingress_edge);

    apply_stub.restore();
  });

  it('apply datacenter pipeline with vpc, database cluster, database, and database user', async () => {
    const database_cluster_module_name = 'databaseCluster';
    const database_module_name = 'database';
    const database_user_module_name = 'ingress';
    const vpc_module_name = 'vpc';
    const database_cluster_id = 'database_cluster_id';
    const database_id = 'database_id';

    const database_name_input = 'test-database';
    const database_step = new PipelineStep({
      name: database_module_name,
      type: 'module',
      plugin: 'pulumi',
      action: 'create',
      color: 'blue',
      status: {
        state: 'pending'
      },
      image: 'sha256:cf151edf4350161cd3243f8d5270ae4f1516516b633b2a02c99bed717af2d20e',
      hash: '70e1926639496e8fe63f908333dfc8cda1b1e237cdd0675aedc5d44b569c8be1',
      inputs: {
        name: database_name_input,
        database_cluster_id: `\${{ module/${database_cluster_module_name}-blue.id }}`,
        type: 'module',
      }
    });
    const database_cluster_name_input = 'test-database-cluster';
    const database_cluster_step = new PipelineStep({
      name: database_cluster_module_name,
      type: 'module',
      plugin: 'pulumi',
      action: 'create',
      color: 'blue',
      status: {
        state: 'pending'
      },
      image: 'sha256:cf151edf4350161cd3243f8d5270ae4f1516516b633b2a02c99bed717af2d20e',
      hash: '70e1926639496e8fe63f908333dfc8cda1b1e237cdd0675aedc5d44b569c8be1',
      inputs: {
        name: database_cluster_name_input,
        vpc_name: `\${{ module/${vpc_module_name}-blue.name }}`,
        type: 'module',
      }
    });
    const database_user_name_input = 'test-database-user';
    const database_user_step = new PipelineStep({
      name: database_user_module_name,
      type: 'module',
      plugin: 'pulumi',
      action: 'create',
      color: 'blue',
      status: {
        state: 'pending'
      },
      image: 'sha256:cf151edf4350161cd3243f8d5270ae4f1516516b633b2a02c99bed717af2d20e',
      hash: '70e1926639496e8fe63f908333dfc8cda1b1e237cdd0675aedc5d44b569c8be1',
      inputs: {
        name: database_user_name_input,
        database_id: `\${{ module/${database_module_name}-blue.id }}`,
        type: 'module',
      }
    });
    const vpc_name_input = 'test-vpc';
    const vpc_step = new PipelineStep({
      name: vpc_module_name,
      type: 'module',
      plugin: 'pulumi',
      action: 'create',
      color: 'blue',
      status: {
        state: 'pending'
      },
      image: 'sha256:cf151edf4350161cd3243f8d5270ae4f1516516b633b2a02c99bed717af2d20e',
      hash: '70e1926639496e8fe63f908333dfc8cda1b1e237cdd0675aedc5d44b569c8be1',
      inputs: {
        name: vpc_name_input,
        type: 'module',
      }
    });
    
    const database_database_cluster_edge = new CloudEdge({ from: database_step.id, to: database_cluster_step.id });
    const database_cluster_vpc_edge = new CloudEdge({ from: database_cluster_step.id, to: vpc_step.id });
    const database_user_database_edge = new CloudEdge({ from: database_user_step.id, to: database_step.id });

    const pipeline = new Pipeline({ 
      steps: [database_step, database_cluster_step, database_user_step, vpc_step], 
      edges: [database_database_cluster_edge, database_cluster_vpc_edge, database_user_database_edge] 
    });

    const time = new FakeTime();
    const provider_store = new ArcctlProviderStore(ArcCtlConfig.getStateBackend());
    const apply_stub = stub(ModuleHelpers, 'Apply', async (request: ApplyRequest) => {
      time.tick(1); // used because apply times need to be compared later, and in this mock, they could otherwise be exactly the same
      let outputs = {};
      if (request.inputs.find(e => e.includes('name') && e.includes(vpc_name_input))) { 
        outputs = { name: vpc_name_input };
      } else if (request.inputs.find(e => e.includes('name') && e.includes(database_cluster_name_input))) {
        outputs = { id: database_cluster_id };
      } else if (request.inputs.find(e => e.includes('name') && e.includes(database_name_input))) {
        outputs = { id: database_id };
      }
      return { state: '', outputs };
    }); 
    const applied_pipeline = await pipeline.apply({ providerStore: provider_store }).toPromise();

    assertEquals(pipeline.steps.length, 4);
    assertEquals(pipeline.edges.length, 3);

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
    assert(applied_vpc_step!.status!.startTime! < applied_database_cluster_step!.status!.startTime!);

    const database_apply_call = apply_stub.calls.find(c => c.args[0].inputs.find(i => i.includes('name') && i.includes(database_name_input)));
    assertArrayIncludes(database_apply_call!.args[0].inputs, [['name', database_name_input]]);
    assertArrayIncludes(database_apply_call!.args[0].inputs, [['database_cluster_id', database_cluster_id]]);
    const applied_database_step = applied_pipeline!.steps.find(s => s.name === database_module_name);
    assertEquals(applied_database_step!.status.state, 'complete');
    assert(applied_database_cluster_step!.status!.startTime! < applied_database_step!.status!.startTime!);

    const database_user_apply_call = apply_stub.calls.find(c => c.args[0].inputs.find(i => i.includes('name') && i.includes(database_user_name_input)));
    assertArrayIncludes(database_user_apply_call!.args[0].inputs, [['name', database_user_name_input]]);
    assertArrayIncludes(database_user_apply_call!.args[0].inputs, [['database_id', database_id]]);
    const applied_database_user_step = applied_pipeline!.steps.find(s => s.name === database_user_module_name);
    assertEquals(applied_database_user_step!.status.state, 'complete');
    assert(applied_database_step!.status!.startTime! < applied_database_user_step!.status!.startTime!);

    const pipeline_database_database_cluster_edge = pipeline.edges.find(e => e.from === `module/${database_module_name}-blue` && e.to === `module/${database_cluster_module_name}-blue`);
    assertExists(pipeline_database_database_cluster_edge);
    const pipeline_database_cluster_vpc_edge = pipeline.edges.find(e => e.from === `module/${database_cluster_module_name}-blue` && e.to === `module/${vpc_module_name}-blue`);
    assertExists(pipeline_database_cluster_vpc_edge);
    const pipeline_database_user_database_edge = pipeline.edges.find(e => e.from === `module/${database_user_module_name}-blue` && e.to === `module/${database_module_name}-blue`);
    assertExists(pipeline_database_user_database_edge);

    apply_stub.restore();
  });
});

describe('plan destroy datacenter pipeline', async() => {
  it('plan destroy datacenter pipeline with vpc', async () => {
    const vpc_name_input = 'test-vpc';
    const vpc_step = new PipelineStep({
      name: 'vpc',
      type: 'module',
      plugin: 'pulumi',
      action: 'create',
      color: 'blue',
      status: {
        state: 'complete',
        startTime: 1696606035928,
        endTime: 1696606206622
      },
      image: 'sha256:cf151edf4350161cd3243f8d5270ae4f1516516b633b2a02c99bed717af2d20e',
      hash: '6d6bdff23019d7163793fc5c54fd7763f177716c409e90f7b6290854c4a5f4f9',
      state: '',
      inputs: {
        type: 'module',
        name: vpc_name_input
      },
      outputs: {
        id: 'vpc_id',
        name: vpc_name_input
      },
    });

    const before = new Pipeline({ steps: [vpc_step], edges: [] });

    const pipeline = await Pipeline.plan({
      before,
      after: new CloudGraph(),
      context: PlanContext.Datacenter,
    }, new CommandHelper({}).providerStore);

    assertEquals(pipeline.steps.length, 1);
    assertEquals(pipeline.edges.length, 0);
    assertEquals(pipeline.steps[0].name, 'vpc');
    assertEquals(pipeline.steps[0].action, 'delete');
    assertEquals(pipeline.steps[0].status.state, 'pending');
    assertEquals(pipeline.steps[0].type, 'module');
  });

  it('plan destroy datacenter with vpc and database cluster', async () => {
    const vpc_name_input = 'test-vpc';
    const vpc_module_name = 'vpc';
    const vpc_step = new PipelineStep({
      name: vpc_module_name,
      type: 'module',
      plugin: 'pulumi',
      action: 'create',
      color: 'blue',
      status: {
        state: 'complete',
        startTime: 1696606035928, // TODO: set dates to be chronological, but not hardcoded
        endTime: 1696606206622
      },
      image: 'sha256:cf151edf4350161cd3243f8d5270ae4f1516516b633b2a02c99bed717af2d20e',
      hash: '6d6bdff23019d7163793fc5c54fd7763f177716c409e90f7b6290854c4a5f4f9',
      state: '',
      inputs: {
        type: 'module',
        name: vpc_name_input
      },
      outputs: {
        id: 'vpc_id',
        name: vpc_name_input
      },
    });
    const database_cluster_name_input = 'test-database-cluster';
    const database_cluster_module_name = 'databaseCluster';
    const database_cluster_step = new PipelineStep({
      name: database_cluster_module_name,
      type: 'module',
      plugin: 'pulumi',
      action: 'create',
      color: 'blue',
      status: {
        state: 'complete',
        startTime: 1696609625476,
        endTime: 1696610196270
      },
      image: 'sha256:5456139ada942fa8e108587e99a6116eb666da3f5e2fecf930238f09f720e52e',
      hash: '922078fa4d4d754535e579dc43833e1469280da7c5b8fedd14bbe8ce21f3bad7',
      state: '',
      inputs: {
        type: 'module',
        name: database_cluster_name_input,
        vpc_name: vpc_name_input
      },
      outputs: {
        id: 'database_cluster_id',
        name: database_cluster_name_input
      },
    });

    const database_cluster_vpc_edge = new CloudEdge({ from: database_cluster_step.id, to: vpc_step.id });
  
    const before = new Pipeline({ steps: [database_cluster_step, vpc_step], edges: [database_cluster_vpc_edge] });

    const pipeline = await Pipeline.plan({
      before,
      after: new CloudGraph(),
      context: PlanContext.Datacenter,
    }, new CommandHelper({}).providerStore);

    assertEquals(pipeline.steps.length, 2);
    assertEquals(pipeline.edges.length, 1);

    const vpc_step_after = pipeline.steps.find(s => s.name === vpc_module_name);
    const database_cluster_step_after = pipeline.steps.find(s => s.name === database_cluster_module_name);

    // TODO: test step outputs
    assertEquals(vpc_step_after!.name, vpc_module_name);
    assertEquals(vpc_step_after!.action, 'delete');
    assertEquals(vpc_step_after!.status.state, 'pending');
    assertEquals(vpc_step_after!.type, 'module'); 

    assertEquals(database_cluster_step_after!.name, database_cluster_module_name);
    assertEquals(database_cluster_step_after!.action, 'delete');
    assertEquals(database_cluster_step_after!.status.state, 'pending');
    assertEquals(database_cluster_step_after!.type, 'module');
    assertEquals(database_cluster_step_after!.inputs!.vpc_name!, vpc_name_input);
    assertEquals(database_cluster_step_after!.inputs!.name!, database_cluster_name_input);

    assertEquals(pipeline.edges[0].from, `module/${vpc_module_name}-blue`);
    assertEquals(pipeline.edges[0].to, `module/${database_cluster_module_name}-blue`);
  });

  it('plan destroy datacenter pipeline with vpc, deployment, service, ingressRule, and gateway', async () => {
    const vpc_name_input = 'test-vpc';
    const deployment_id = 'deployment_id';
    const ingress_rule_id = 'ingress_rule_id';
    const service_id = 'service_id';
    const vpc_id = 'vpc_id';

    const deployment_name_input = 'test-deployment';
    const deployment_module_name = 'deployment';
    const deployment_step = new PipelineStep({
      name: deployment_module_name,
      type: 'module',
      action: 'create',
      color: 'blue',
      status: {
        state: 'complete',
        startTime: 1696616543691,
        endTime: 1696616591157
      },
      image: 'sha256:979ca9e78fab1f965298e5f31d35c11f35acc3284583f76043bbb220def69a08',
      hash: '9cb4fcaad01a372e77aea16d47342319238b789e02115ea0277a83e8de54a05d',
      state: '',
      inputs: {
        type: 'module',
        name: deployment_name_input,
        vpc_name: vpc_name_input,
      },
      outputs: {
        id: deployment_id,
        name: deployment_name_input
      },
      plugin: 'pulumi'
    });
    const gateway_name_input = 'test-gateway';
    const gateway_module_name = 'gateway';
    const gateway_step = new PipelineStep({
      name: gateway_module_name,
      type: 'module',
      action: 'create',
      color: 'blue',
      status: {
        state: 'complete',
        startTime: 1696616669310,
        endTime: 1696616727419
      },
      image: 'sha256:4fca404c7389547aa5ec3ad5f7722c2f61da66d3891df23866728df7dbe70154',
      hash: 'bad2f0ab1e688ab4d26b06e1614d745d6ed73dc175f98441daf15b9d932c138f',
      state: '',
      inputs: {
        type: 'module',
        ingress_rule_id: ingress_rule_id,
        name: gateway_name_input
      },
      outputs: {
        id: 'gateway_id',
        name: gateway_name_input
      },
      plugin: 'pulumi'
    });
    const ingress_rule_name_input = 'test-ingress-rule';
    const ingress_rule_module_name = 'ingress';
    const ingress_rule_step = new PipelineStep({
      name: ingress_rule_module_name,
      type: 'module',
      action: 'create',
      color: 'blue',
      status: {
        state: 'complete',
        startTime: 1696616641599,
        endTime: 1696616669310
      },
      image: 'sha256:e7532173eaf6d4016becd25208e47a46bd6ee7dd5e5ca97b17f5c40c7a0e7558',
      hash: '4da928dacdb712456655a209d7c762e76837c58b46eecd4b5901351007c7353f',
      state: '',
      inputs: {
        type: 'module',
        name: ingress_rule_name_input,
        service_id: service_id
      },
      outputs: {
        name: ingress_rule_name_input,
        id: ingress_rule_id
      },
      plugin: 'pulumi'
    });
    const service_name_input = 'test-service-name';
    const service_module_name = 'service';
    const service_step = new PipelineStep({
      name: service_module_name,
      type: 'module',
      action: 'create',
      color: 'blue',
      status: {
        state: 'complete',
        startTime: 1696616591157,
        endTime: 1696616641599
      },
      image: 'sha256:7dc361925c983f975aa558ea6e8909bc74c8d7b3cdb3a29532191aa0f4c2ad0a',
      hash: 'd65a6ffa053bf2b0c6bc43ea534ed95e79e9f759b379244fafb2482addd272c2',
      state: '',
      inputs: {
        type: 'module',
        name: service_name_input,
        vpc_name: vpc_name_input,
        deployment_id: deployment_id,
      },
      outputs: {
        id: service_id,
        name: service_name_input,
      },
      plugin: 'pulumi'
    });
    const vpc_module_name = 'vpc';
    const vpc_step = new PipelineStep({
      name: vpc_module_name,
      type: 'module',
      plugin: 'pulumi',
      action: 'create',
      color: 'blue',
      status: {
        state: 'complete',
        startTime: 1696606035928,
        endTime: 1696606206622
      },
      image: 'sha256:cf151edf4350161cd3243f8d5270ae4f1516516b633b2a02c99bed717af2d20e',
      hash: '6d6bdff23019d7163793fc5c54fd7763f177716c409e90f7b6290854c4a5f4f9',
      state: '',
      inputs: {
        type: 'module',
        name: vpc_name_input
      },
      outputs: {
        id: vpc_id,
        name: vpc_name_input
      },
    });

    const deployment_vpc_edge = new CloudEdge({ from: deployment_step.id, to: vpc_step.id });
    const gateway_ingress_edge = new CloudEdge({ from: gateway_step.id, to: ingress_rule_step.id });
    const ingress_service_edge = new CloudEdge({ from: ingress_rule_step.id, to: service_step.id });
    const service_deployment_edge = new CloudEdge({ from: service_step.id, to: deployment_step.id });
    const service_vpc_edge = new CloudEdge({ from: service_step.id, to: vpc_step.id });
  
    const before = new Pipeline({ 
      steps: [deployment_step, gateway_step, ingress_rule_step, service_step, vpc_step], 
      edges: [deployment_vpc_edge, gateway_ingress_edge, ingress_service_edge, service_deployment_edge, service_vpc_edge] 
    });

    const pipeline = await Pipeline.plan({
      before,
      after: new CloudGraph(),
      context: PlanContext.Datacenter,
    }, new CommandHelper({}).providerStore);

    assertEquals(pipeline.steps.length, 5);
    assertEquals(pipeline.edges.length, 5);

    const deployment_step_after = pipeline.steps.find(s => s.name === deployment_module_name);
    const gateway_step_after = pipeline.steps.find(s => s.name === gateway_module_name);
    const ingress_rule_step_after = pipeline.steps.find(s => s.name === ingress_rule_module_name);
    const service_step_after = pipeline.steps.find(s => s.name === service_module_name);
    const vpc_step_after = pipeline.steps.find(s => s.name === vpc_module_name);

    assertEquals(deployment_step_after!.name, deployment_module_name);
    assertEquals(deployment_step_after!.action, 'delete');
    assertEquals(deployment_step_after!.status.state, 'pending');
    assertEquals(deployment_step_after!.type, 'module'); 
    assertEquals(deployment_step_after!.inputs!.name, deployment_name_input); // TODO: test step outputs
    assertEquals(deployment_step_after!.inputs!.vpc_name, vpc_name_input);

    assertEquals(gateway_step_after!.name, gateway_module_name);
    assertEquals(gateway_step_after!.action, 'delete');
    assertEquals(gateway_step_after!.status.state, 'pending');
    assertEquals(gateway_step_after!.type, 'module'); 
    assertEquals(gateway_step_after!.inputs!.name, gateway_name_input);
    assertEquals(gateway_step_after!.inputs!.ingress_rule_id, ingress_rule_id);

    assertEquals(ingress_rule_step_after!.name, ingress_rule_module_name);
    assertEquals(ingress_rule_step_after!.action, 'delete');
    assertEquals(ingress_rule_step_after!.status.state, 'pending');
    assertEquals(ingress_rule_step_after!.type, 'module'); 
    assertEquals(ingress_rule_step_after!.inputs!.name, ingress_rule_name_input);
    assertEquals(ingress_rule_step_after!.inputs!.service_id, service_id);

    assertEquals(service_step_after!.name, service_module_name);
    assertEquals(service_step_after!.action, 'delete');
    assertEquals(service_step_after!.status.state, 'pending');
    assertEquals(service_step_after!.type, 'module'); 
    assertEquals(service_step_after!.inputs!.name, service_name_input);
    assertEquals(service_step_after!.inputs!.vpc_name, vpc_name_input);
    assertEquals(service_step_after!.inputs!.deployment_id, deployment_id);

    assertEquals(vpc_step_after!.name, vpc_module_name);
    assertEquals(vpc_step_after!.action, 'delete');
    assertEquals(vpc_step_after!.status.state, 'pending');
    assertEquals(vpc_step_after!.type, 'module'); 
    assertEquals(vpc_step_after!.inputs!.name, vpc_name_input);

    const pipeline_deployment_service_edge = pipeline.edges.find(e => e.from === `module/${deployment_module_name}-blue` && e.to === `module/${service_module_name}-blue`);
    assertExists(pipeline_deployment_service_edge);
    const pipeline_ingress_rule_gateway_edge = pipeline.edges.find(e => e.from === `module/${ingress_rule_module_name}-blue` && e.to === `module/${gateway_module_name}-blue`);
    assertExists(pipeline_ingress_rule_gateway_edge);
    const pipeline_service_ingress_rule_edge = pipeline.edges.find(e => e.from === `module/${service_module_name}-blue` && e.to === `module/${ingress_rule_module_name}-blue`);
    assertExists(pipeline_service_ingress_rule_edge);
    const pipeline_vpc_deployment_edge = pipeline.edges.find(e => e.from === `module/${vpc_module_name}-blue` && e.to === `module/${deployment_module_name}-blue`);
    assertExists(pipeline_vpc_deployment_edge);
    const pipeline_vpc_service_edge = pipeline.edges.find(e => e.from === `module/${vpc_module_name}-blue` && e.to === `module/${service_module_name}-blue`);
    assertExists(pipeline_vpc_service_edge);
  });

  it('plan destroy datacenter pipeline with vpc, databaseCluster, database, and databaseUser', async () => {
    const vpc_name_input = 'test-vpc';
    const database_cluster_id = 'database_cluster_id';
    const database_id = 'database_id';
    const database_user_id = 'database_user_id';
    const vpc_id = 'vpc_id';

    const database_name_input = 'test-database';
    const database_module_name = 'database';
    const database_step = new PipelineStep({
      name: database_module_name,
      type: 'module',
      action: 'create',
      color: 'blue',
      status: {
        state: 'complete',
        startTime: 1696623952835,
        endTime: 1696623994419
      },
      image: 'sha256:2ebe7046306323490b95c48131853d232045f45d877623f9d3ec5230f74f98ae',
      hash: '460a1c6e478bf9ba70ee021a8a8f4795f0a042888c6648abb982bf162fa2b82d',
      state: '',
      inputs: {
        type: 'module',
        name: database_name_input,
        database_cluster_id: database_cluster_id,
      },
      outputs: {
        id: database_id,
        name: database_name_input
      },
      plugin: 'pulumi'
    });
    const database_cluster_name_input = 'test-database-cluster';
    const database_cluster_module_name = 'databaseCluster'
    const database_cluster_step = new PipelineStep({
      name: database_cluster_module_name,
      type: 'module',
      action: 'create',
      color: 'blue',
      status: {
        state: 'complete',
        startTime: 1696623288075,
        endTime: 1696623952835
      },
      image: 'sha256:16bea4a7c85a71a1ba4587077e252f10ffdd10dab6805d4df62e056b9caca0b2',
      hash: '7c87f0f8f6b62a0f10f8b35fad90443cd4f5f3415abbc8573a89b5bbd8b99e5e',
      state: '',
      inputs: {
        type: 'module',
        name: database_cluster_name_input,
        vpc_name: vpc_name_input
      },
      outputs: {
        id: database_cluster_id,
        name: database_cluster_name_input
      },
      plugin: 'pulumi'
    });
    const database_user_name_input = 'test-database-user';
    const database_user_module_name = 'databaseUser'
    const database_user_step = new PipelineStep({
      name: database_user_module_name,
      type: 'module',
      action: 'create',
      color: 'blue',
      status: {
        state: 'complete',
        startTime: 1696623994419,
        endTime: 1696624014977
      },
      image: 'sha256:08e723d13d49835bbef1716a9026a6a0e252195a8a9f6dd32d4828978b1f9185',
      hash: '93a585d37035f68c46c3a7f082c7e82c1565cfa533c1bba3ec6ed0fa311e49f8',
      state: '',
      inputs: {
        type: 'module',
        name: database_user_name_input,
        database_id: database_id,
      },
      outputs: {
        id: database_user_id,
        name: database_user_name_input
      },
      plugin: 'pulumi'
    });
    const vpc_module_name = 'vpc'
    const vpc_step = new PipelineStep({
      name: vpc_module_name,
      type: 'module',
      action: 'create',
      color: 'blue',
      status: {
        state: 'complete',
        startTime: 1696623103596,
        endTime: 1696623288074
      },
      image: 'sha256:cf151edf4350161cd3243f8d5270ae4f1516516b633b2a02c99bed717af2d20e',
      hash: '23973d474f2fd78b7539466773deda3523571b80e92a550e310747467efae357',
      state: '',
      inputs: {
        type: 'module',
        name: vpc_name_input
      },
      outputs: {
        id: vpc_id,
        name: vpc_name_input,
      },
      plugin: 'pulumi'
    });

    const database_database_cluster_edge = new CloudEdge({ from: database_step.id, to: database_cluster_step.id });
    const datbase_cluster_vpc_edge = new CloudEdge({ from: database_cluster_step.id, to: vpc_step.id });
    const database_user_database_edge = new CloudEdge({ from: database_user_step.id, to: database_step.id });
  
    const before = new Pipeline({ 
      steps: [database_step, database_cluster_step, database_user_step, vpc_step], 
      edges: [database_database_cluster_edge, datbase_cluster_vpc_edge, database_user_database_edge] 
    });

    const pipeline = await Pipeline.plan({
      before,
      after: new CloudGraph(),
      context: PlanContext.Datacenter,
    }, new CommandHelper({}).providerStore);

    assertEquals(pipeline.steps.length, 4);
    assertEquals(pipeline.edges.length, 3);

    const database_cluster_step_after = pipeline.steps.find(s => s.name === database_cluster_module_name);
    const database_step_after = pipeline.steps.find(s => s.name === database_module_name);
    const database_user_step_after = pipeline.steps.find(s => s.name === database_user_module_name);
    const vpc_step_after = pipeline.steps.find(s => s.name === vpc_module_name);

    assertEquals(database_cluster_step_after!.name, database_cluster_module_name);
    assertEquals(database_cluster_step_after!.action, 'delete');
    assertEquals(database_cluster_step_after!.status.state, 'pending');
    assertEquals(database_cluster_step_after!.type, 'module'); 
    assertEquals(database_cluster_step_after!.inputs!.name, database_cluster_name_input); // TODO: test step outputs
    assertEquals(database_cluster_step_after!.inputs!.vpc_name, vpc_name_input);

    assertEquals(database_step_after!.name, database_module_name);
    assertEquals(database_step_after!.action, 'delete');
    assertEquals(database_step_after!.status.state, 'pending');
    assertEquals(database_step_after!.type, 'module'); 
    assertEquals(database_step_after!.inputs!.name, database_name_input); // TODO: test step outputs
    assertEquals(database_step_after!.inputs!.database_cluster_id, database_cluster_id);

    assertEquals(database_user_step_after!.name, database_user_module_name);
    assertEquals(database_user_step_after!.action, 'delete');
    assertEquals(database_user_step_after!.status.state, 'pending');
    assertEquals(database_user_step_after!.type, 'module'); 
    assertEquals(database_user_step_after!.inputs!.name, database_user_name_input); // TODO: test step outputs
    assertEquals(database_user_step_after!.inputs!.database_id, database_id);

    assertEquals(vpc_step_after!.name, vpc_module_name);
    assertEquals(vpc_step_after!.action, 'delete');
    assertEquals(vpc_step_after!.status.state, 'pending');
    assertEquals(vpc_step_after!.type, 'module'); 
    assertEquals(vpc_step_after!.inputs!.name, vpc_name_input); // TODO: test step outputs

    const database_database_user_service_edge = pipeline.edges.find(e => e.from === `module/${database_module_name}-blue` && e.to === `module/${database_user_module_name}-blue`);
    assertExists(database_database_user_service_edge);
    const database_cluster_database_gateway_edge = pipeline.edges.find(e => e.from === `module/${database_cluster_module_name}-blue` && e.to === `module/${database_module_name}-blue`);
    assertExists(database_cluster_database_gateway_edge);
    const vpc_database_cluster_edge = pipeline.edges.find(e => e.from === `module/${vpc_module_name}-blue` && e.to === `module/${database_cluster_module_name}-blue`);
    assertExists(vpc_database_cluster_edge);
  });
});

describe('destroy datacenter pipeline', async() => {
  it('destroy datacenter pipeline with vpc', async () => {
    const vpc_name_input = 'test-vpc';
    const vpc_step = new PipelineStep({
      name: 'vpc',
      type: 'module',
      plugin: 'pulumi',
      action: 'delete',
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

  it('destroy datacenter pipeline with vpc and database cluster', async () => {
    const vpc_name_input = 'test-vpc';
    const database_cluster_id = 'database_cluster_id';
    const vpc_id = 'vpc_id';

    const database_cluster_name_input = 'test-database-cluster';
    const database_cluster_module_name = 'databaseCluster';
    const database_cluster_step = new PipelineStep({
      name: database_cluster_module_name,
      type: 'module',
      action: 'delete',
      color: 'blue',
      status: {
        state: 'pending'
      },
      image: 'sha256:fc4d07fb9cb0b7d16383cad10277493596472bacbafcc4ca77fcc6c73085eaf5',
      hash: '7c87f0f8f6b62a0f10f8b35fad90443cd4f5f3415abbc8573a89b5bbd8b99e5e',
      state: '',
      inputs: {
        type: 'module',
        name: database_cluster_name_input,
        vpc_name: vpc_name_input
      },
      outputs: {
        id: database_cluster_id,
        name: database_cluster_name_input
      },
      plugin: 'pulumi'
    });
    const vpc_module_name = 'vpc';
    const vpc_step = new PipelineStep({
      name: vpc_module_name,
      type: 'module',
      action: 'delete',
      color: 'blue',
      status: {
        state: 'pending'
      },
      image: 'sha256:a1fcf59df924bfd9fc1b56d05978c2596692139b105487af6c15f693e1f9b0da',
      hash: '996e9be1b4f6067ca2cbf15abb0979be596a98e08510cc510e637363e740269b',
      state: '',
      inputs: {
        type: 'module',
        name: vpc_name_input
      },
      outputs: {
        id: vpc_id, 
        name: vpc_name_input
      },
      plugin: 'pulumi'
    });

    const vpc_database_cluster_edge = new CloudEdge({ from: vpc_step.id, to: database_cluster_step.id });

    const pipeline = new Pipeline({ 
      steps: [database_cluster_step, vpc_step], 
      edges: [vpc_database_cluster_edge] 
    });

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

    const database_cluster_apply_call = apply_stub.calls.find(c => c.args[0].inputs.find(i => i.includes('name') && i.includes(database_cluster_name_input)));
    assertArrayIncludes(database_cluster_apply_call!.args[0].inputs, [['name', database_cluster_name_input]]);
    assertArrayIncludes(database_cluster_apply_call!.args[0].inputs, [['vpc_name', vpc_name_input]]);
    const applied_database_cluster_step = applied_pipeline!.steps.find(s => s.name === database_cluster_module_name);
    assertEquals(applied_database_cluster_step!.status.state, 'complete');

    const vpc_apply_call = apply_stub.calls.find(c => c.args[0].inputs.find(i => i.includes('name') && i.includes(vpc_name_input)));
    assertArrayIncludes(vpc_apply_call!.args[0].inputs, [['name', vpc_name_input]]);
    const applied_vpc_step = applied_pipeline!.steps.find(s => s.name === vpc_module_name);
    assertEquals(applied_vpc_step!.status.state, 'complete'); 
    assertEquals(applied_vpc_step!.outputs!.name!, vpc_name_input);
    assert(applied_vpc_step!.status!.startTime! > applied_database_cluster_step!.status!.startTime!);

    const pipeline_database_database_cluster_edge = pipeline.edges.find(e => e.from === `module/${vpc_module_name}-blue` && e.to === `module/${database_cluster_module_name}-blue`);
    assertExists(pipeline_database_database_cluster_edge);

    apply_stub.restore();
  });

  it('destroy datacenter pipeline with vpc, gateway, ingress, service, and deployment', async () => {
    const vpc_name_input = 'test-vpc';
    const gateway_id = 'gateway_id';
    const ingress_rule_id = 'ingress_rule_id';
    const service_id = 'service_id';
    const deployment_id = 'deployment_id';
    const vpc_id = 'vpc_id';

    const deployment_name_input = 'test-deployment';
    const deployment_module_name = 'deployment';
    const deployment_step = new PipelineStep({
      name: deployment_module_name,
      type: 'module',
      action: 'delete',
      color: 'blue',
      status: {
        state: 'pending'
      },
      image: 'sha256:6fb4fd23616b2cb932341b0acb1215ee5efa8430075632070fc839d0e26e2972',
      hash: '9cb4fcaad01a372e77aea16d47342319238b789e02115ea0277a83e8de54a05d',
      state: '',
      inputs: {
        type: 'module',
        vpc_name: vpc_name_input,
        name: deployment_name_input
      },
      outputs: {
        id: deployment_id,
        name: deployment_name_input
      },
      plugin: 'pulumi'
    });
    const gateway_name_input = 'test-gateway';
    const gateway_module_name = 'gateway';
    const gateway_step = new PipelineStep({
      name: gateway_module_name,
      type: 'module',
      action: 'delete',
      color: 'blue',
      status: {
        state: 'pending'
      },
      image: 'sha256:8eb5f976dde81f5ea7626baf348bb8f6c96c43d7e7e997ccb313fde5f2a1fdbb',
      hash: 'bad2f0ab1e688ab4d26b06e1614d745d6ed73dc175f98441daf15b9d932c138f',
      state: '',
      inputs: {
        type: 'module',
        ingress_rule_id: ingress_rule_id,
        name: gateway_name_input
      },
      outputs: {
        id: gateway_id,
        name: gateway_name_input
      },
      plugin: 'pulumi'
    });
    const ingress_name_input = 'test-ingress';
    const ingress_module_name = 'ingress';
    const ingress_step = new PipelineStep({
      name: ingress_module_name,
      type: 'module',
      action: 'delete',
      color: 'blue',
      status: {
        state: 'pending'
      },
      image: 'sha256:2e773e46dc0230c2d9d85d2086099e950923d93ac60296c28937711702557c8c',
      hash: '4da928dacdb712456655a209d7c762e76837c58b46eecd4b5901351007c7353f',
      state: '',
      inputs: {
        type: 'module',
        name: ingress_name_input,
        service_id: service_id
      },
      outputs: {
        id: ingress_rule_id,
        name: ingress_name_input
      },
      plugin: 'pulumi'
    });
    const service_name_input = 'test-service';
    const service_module_name = 'service';
    const service_step = new PipelineStep({
      name: service_module_name,
      type: 'module',
      action: 'delete',
      color: 'blue',
      status: {
        state: 'pending'
      },
      image: 'sha256:8780ad1d0183deecaadb990648b28b3014b932fe08801a1a3f05053aa8873533',
      hash: 'd65a6ffa053bf2b0c6bc43ea534ed95e79e9f759b379244fafb2482addd272c2',
      state: '',
      inputs: {
        type: 'module',
        name: service_name_input,
        deployment_id: deployment_id,
        vpc_name: vpc_name_input
      },
      outputs: {
        id: service_id,
        name: service_name_input,
      },
      plugin: 'pulumi'
    });
    const vpc_module_name = 'vpc';
    const vpc_step = new PipelineStep({
      name: vpc_module_name,
      type: 'module',
      action: 'delete',
      color: 'blue',
      status: {
        state: 'pending'
      },
      image: 'sha256:a1fcf59df924bfd9fc1b56d05978c2596692139b105487af6c15f693e1f9b0da',
      hash: '26b4842743714800d56a1bd2ffde719044bddb6998ffd7fbbd19bd65a0fd5642',
      state: '',
      inputs: {
        type: 'module',
        name: vpc_name_input
      },
      outputs: {
        id: vpc_id,
        name: vpc_name_input,
      },
      plugin: 'pulumi'
    });

    const deployment_service_edge = new CloudEdge({ from: deployment_step.id, to: service_step.id });
    const ingress_gateway_edge = new CloudEdge({ from: ingress_step.id, to: gateway_step.id });
    const service_ingress_edge = new CloudEdge({ from: service_step.id, to: ingress_step.id });
    const vpc_deployment_edge = new CloudEdge({ from: vpc_step.id, to: deployment_step.id });
    const vpc_service_cluster_edge = new CloudEdge({ from: vpc_step.id, to: service_step.id });

    const pipeline = new Pipeline({ 
      steps: [deployment_step, gateway_step, ingress_step, service_step, vpc_step], 
      edges: [deployment_service_edge, ingress_gateway_edge, service_ingress_edge, vpc_deployment_edge, vpc_service_cluster_edge] 
    });

    const time = new FakeTime();
    const provider_store = new ArcctlProviderStore(ArcCtlConfig.getStateBackend());
    const apply_stub = stub(ModuleHelpers, 'Apply', async (request: ApplyRequest) => {
      time.tick(1); // used because apply times need to be compared later, and in this mock, they could otherwise be exactly the same
      let outputs = {};
      if (request.inputs.find(e => e.includes('name') && e.includes(vpc_name_input))) { 
        outputs = { name: vpc_name_input }; // TODO: create separate output rather than reusing the input?
      } else if (request.inputs.find(e => e.includes('name') && e.includes(deployment_name_input))) { 
        outputs = { id: deployment_id };
      } else if (request.inputs.find(e => e.includes('name') && e.includes(gateway_name_input))) { 
        outputs = { id: gateway_id };
      } else if (request.inputs.find(e => e.includes('name') && e.includes(ingress_name_input))) { 
        outputs = { id: ingress_rule_id };
      } else if (request.inputs.find(e => e.includes('name') && e.includes(service_name_input))) { 
        outputs = { id: service_id };
      }
      return { state: '', outputs };
    }); 
    const applied_pipeline = await pipeline.apply({ providerStore: provider_store }).toPromise();

    assertEquals(pipeline.steps.length, 5);
    assertEquals(pipeline.edges.length, 5); 

    const deployment_apply_call = apply_stub.calls.find(c => c.args[0].inputs.find(i => i.includes('name') && i.includes(deployment_name_input)));
    assertArrayIncludes(deployment_apply_call!.args[0].inputs, [['name', deployment_name_input]]);
    assertArrayIncludes(deployment_apply_call!.args[0].inputs, [['vpc_name', vpc_name_input]]);
    const applied_deployment_step = applied_pipeline!.steps.find(s => s.name === deployment_module_name);
    assertEquals(applied_deployment_step!.status.state, 'complete');

    const service_apply_call = apply_stub.calls.find(c => c.args[0].inputs.find(i => i.includes('name') && i.includes(service_name_input)));
    assertArrayIncludes(service_apply_call!.args[0].inputs, [['name', service_name_input]]);
    assertArrayIncludes(service_apply_call!.args[0].inputs, [['vpc_name', vpc_name_input]]);
    assertArrayIncludes(service_apply_call!.args[0].inputs, [['deployment_id', deployment_id]]);
    const applied_service_step = applied_pipeline!.steps.find(s => s.name === service_module_name);
    assertEquals(applied_service_step!.status.state, 'complete');
    // assert(applied_service_step!.status!.startTime! > applied_deployment_step!.status!.startTime!); // TODO: find out why this is broken

    const ingress_apply_call = apply_stub.calls.find(c => c.args[0].inputs.find(i => i.includes('name') && i.includes(ingress_name_input)));
    assertArrayIncludes(ingress_apply_call!.args[0].inputs, [['name', ingress_name_input]]);
    assertArrayIncludes(ingress_apply_call!.args[0].inputs, [['service_id', service_id]]);
    const applied_ingress_step = applied_pipeline!.steps.find(s => s.name === ingress_module_name);
    assertEquals(applied_ingress_step!.status.state, 'complete');
    // assert(applied_ingress_step!.status!.startTime! > applied_service_step!.status!.startTime!); // TODO: find out why this is broken
    
    const gateway_apply_call = apply_stub.calls.find(c => c.args[0].inputs.find(i => i.includes('name') && i.includes(gateway_name_input)));
    assertArrayIncludes(gateway_apply_call!.args[0].inputs, [['name', gateway_name_input]]);
    assertArrayIncludes(gateway_apply_call!.args[0].inputs, [['ingress_rule_id', ingress_rule_id]]);
    const applied_gateway_step = applied_pipeline!.steps.find(s => s.name === gateway_module_name);
    assertEquals(applied_gateway_step!.status.state, 'complete');
    // assert(applied_gateway_step!.status!.startTime! > applied_ingress_step!.status!.startTime!); // TODO: find out why this is broken

    const vpc_apply_call = apply_stub.calls.find(c => c.args[0].inputs.find(i => i.includes('name') && i.includes(vpc_name_input)));
    assertArrayIncludes(vpc_apply_call!.args[0].inputs, [['name', vpc_name_input]]);
    const applied_vpc_step = applied_pipeline!.steps.find(s => s.name === vpc_module_name);
    assertEquals(applied_vpc_step!.status.state, 'complete'); 
    assertEquals(applied_vpc_step!.outputs!.name!, vpc_name_input);
    assert(applied_vpc_step!.status!.startTime! > applied_deployment_step!.status!.startTime!);
    assert(applied_vpc_step!.status!.startTime! > applied_service_step!.status!.startTime!);

    const pipeline_deployment_service_edge = pipeline.edges.find(e => e.from === `module/${deployment_module_name}-blue` && e.to === `module/${service_module_name}-blue`);
    assertExists(pipeline_deployment_service_edge);
    const pipeline_ingress_gateway_edge = pipeline.edges.find(e => e.from === `module/${ingress_module_name}-blue` && e.to === `module/${gateway_module_name}-blue`);
    assertExists(pipeline_ingress_gateway_edge);
    const pipeline_service_ingress_edge = pipeline.edges.find(e => e.from === `module/${service_module_name}-blue` && e.to === `module/${ingress_module_name}-blue`);
    assertExists(pipeline_service_ingress_edge);
    const pipeline_vpc_deployment_edge = pipeline.edges.find(e => e.from === `module/${vpc_module_name}-blue` && e.to === `module/${deployment_module_name}-blue`);
    assertExists(pipeline_vpc_deployment_edge);
    const pipeline_vpc_service_edge = pipeline.edges.find(e => e.from === `module/${vpc_module_name}-blue` && e.to === `module/${service_module_name}-blue`);
    assertExists(pipeline_vpc_service_edge);

    apply_stub.restore();
  });

  it('destroy datacenter pipeline with vpc, database cluster, database, and database user', async () => {
    const vpc_name_input = 'test-vpc';
    const database_cluster_id = 'database_cluster_id';
    const database_id = 'database_id';
    const database_user_id = 'database_user_id';
    const vpc_id = 'vpc_id';

    const database_module_name = 'database';
    const database_name_input = 'test-database';
    const database_step = new PipelineStep({
      name: database_module_name,
      type: 'module',
      action: 'delete',
      color: 'blue',
      status: {
        state: 'pending'
      },
      image: 'sha256:2704d475e05a17d5fec70a31faf91adf76fc12e8d9a6046cd009d40c7f2c3159',
      hash: '460a1c6e478bf9ba70ee021a8a8f4795f0a042888c6648abb982bf162fa2b82d',
      state: '',
      inputs: {
        type: 'module',
        database_cluster_id: database_cluster_id,
        name: database_name_input
      },
      outputs: {
        id: database_id,
        name: database_name_input
      },
      plugin: 'pulumi'
    });
    const database_cluster_module_name = 'databaseCluster';
    const database_cluster_name_input = 'test-database-cluster';
    const database_cluster_step = new PipelineStep({
      name: database_cluster_module_name,
      type: 'module',
      action: 'delete',
      color: 'blue',
      status: {
        state: 'pending'
      },
      image: 'sha256:fc4d07fb9cb0b7d16383cad10277493596472bacbafcc4ca77fcc6c73085eaf5',
      hash: '7c87f0f8f6b62a0f10f8b35fad90443cd4f5f3415abbc8573a89b5bbd8b99e5e',
      state: '',
      inputs: {
        type: 'module',
        name: database_cluster_name_input,
        vpc_name: vpc_name_input
      },
      outputs: {
        id: database_cluster_id, 
        name: database_cluster_name_input
      },
      plugin: 'pulumi'
    });
    const database_user_module_name = 'databaseUser';
    const database_user_name_input = 'test-database-user';
    const database_user_step = new PipelineStep({
      name: database_user_module_name,
      type: 'module',
      action: 'delete',
      color: 'blue',
      status: {
        state: 'pending'
      },
      image: 'sha256:90438cc35683fd7cbeb2f0384171f5cba3c0ea5286267122d7b2548c44b54b61',
      hash: '93a585d37035f68c46c3a7f082c7e82c1565cfa533c1bba3ec6ed0fa311e49f8',
      state: '',
      inputs: {
        type: 'module',
        database_id: database_id,
        name: database_user_name_input
      },
      outputs: {
        id: database_user_id,
        name: database_user_name_input
      },
      plugin: 'pulumi'
    });
    const vpc_module_name = 'vpc';
    const vpc_step = new PipelineStep({
      name: vpc_module_name,
      type: 'module',
      action: 'delete',
      color: 'blue',
      status: {
        state: 'pending'
      },
      image: 'sha256:a1fcf59df924bfd9fc1b56d05978c2596692139b105487af6c15f693e1f9b0da',
      hash: '26b4842743714800d56a1bd2ffde719044bddb6998ffd7fbbd19bd65a0fd5642',
      state: '',
      inputs: {
        type: 'module',
        name: vpc_name_input
      },
      outputs: {
        id: vpc_id, 
        name: vpc_name_input,
      },
      plugin: 'pulumi'
    });

    const database_database_user_edge = new CloudEdge({ from: database_step.id, to: database_user_step.id });
    const database_cluster_database_edge = new CloudEdge({ from: database_cluster_step.id, to: database_step.id });
    const vpc_database_cluster_edge = new CloudEdge({ from: vpc_step.id, to: database_cluster_step.id });

    const pipeline = new Pipeline({ 
      steps: [database_step, database_cluster_step, database_user_step, vpc_step], 
      edges: [database_database_user_edge, database_cluster_database_edge, vpc_database_cluster_edge] 
    });

    const time = new FakeTime();
    const provider_store = new ArcctlProviderStore(ArcCtlConfig.getStateBackend());
    const apply_stub = stub(ModuleHelpers, 'Apply', async (request: ApplyRequest) => {
      time.tick(1); // used because apply times need to be compared later, and in this mock, they could otherwise be exactly the same
      let outputs = {};
      if (request.inputs.find(e => e.includes('name') && e.includes(vpc_name_input))) { 
        outputs = { name: vpc_name_input };
      } else if (request.inputs.find(e => e.includes('name') && e.includes(database_cluster_name_input))) {
        outputs = { id: database_cluster_id };
      } else if (request.inputs.find(e => e.includes('name') && e.includes(database_name_input))) {
        outputs = { id: database_id };
      }
      return { state: '', outputs };
    }); 
    const applied_pipeline = await pipeline.apply({ providerStore: provider_store }).toPromise();

    assertEquals(pipeline.steps.length, 4);
    assertEquals(pipeline.edges.length, 3); 

    const database_user_apply_call = apply_stub.calls.find(c => c.args[0].inputs.find(i => i.includes('name') && i.includes(database_user_name_input)));
    assertArrayIncludes(database_user_apply_call!.args[0].inputs, [['name', database_user_name_input]]);
    assertArrayIncludes(database_user_apply_call!.args[0].inputs, [['database_id', database_id]]);
    const applied_database_user_step = applied_pipeline!.steps.find(s => s.name === database_user_module_name);
    assertEquals(applied_database_user_step!.status.state, 'complete');

    const database_apply_call = apply_stub.calls.find(c => c.args[0].inputs.find(i => i.includes('name') && i.includes(database_name_input)));
    assertArrayIncludes(database_apply_call!.args[0].inputs, [['name', database_name_input]]);
    assertArrayIncludes(database_apply_call!.args[0].inputs, [['database_cluster_id', database_cluster_id]]);
    const applied_database_step = applied_pipeline!.steps.find(s => s.name === database_module_name);
    assertEquals(applied_database_step!.status.state, 'complete');
    assert(applied_database_step!.status!.startTime! > applied_database_user_step!.status!.startTime!);

    const database_cluster_apply_call = apply_stub.calls.find(c => c.args[0].inputs.find(i => i.includes('name') && i.includes(database_cluster_name_input)));
    assertArrayIncludes(database_cluster_apply_call!.args[0].inputs, [['name', database_cluster_name_input]]);
    assertArrayIncludes(database_cluster_apply_call!.args[0].inputs, [['vpc_name', vpc_name_input]]);
    const applied_database_cluster_step = applied_pipeline!.steps.find(s => s.name === database_cluster_module_name);
    assertEquals(applied_database_cluster_step!.status.state, 'complete');
    assert(applied_database_cluster_step!.status!.startTime! > applied_database_step!.status!.startTime!);

    const vpc_apply_call = apply_stub.calls.find(c => c.args[0].inputs.find(i => i.includes('name') && i.includes(vpc_name_input)));
    assertArrayIncludes(vpc_apply_call!.args[0].inputs, [['name', vpc_name_input]]);
    const applied_vpc_step = applied_pipeline!.steps.find(s => s.name === vpc_module_name);
    assertEquals(applied_vpc_step!.status.state, 'complete'); 
    assertEquals(applied_vpc_step!.outputs!.name!, vpc_name_input);
    assert(applied_vpc_step!.status!.startTime! > applied_database_cluster_step!.status!.startTime!);

    const pipeline_database_database_user_edge = pipeline.edges.find(e => e.from === `module/${database_module_name}-blue` && e.to === `module/${database_user_module_name}-blue`);
    assertExists(pipeline_database_database_user_edge);
    const pipeline_database_cluster_database_edge = pipeline.edges.find(e => e.from === `module/${database_cluster_module_name}-blue` && e.to === `module/${database_module_name}-blue`);
    assertExists(pipeline_database_cluster_database_edge);
    const pipeline_vpc_database_cluster_edge = pipeline.edges.find(e => e.from === `module/${vpc_module_name}-blue` && e.to === `module/${database_cluster_module_name}-blue`);
    assertExists(pipeline_vpc_database_cluster_edge);

    apply_stub.restore();
  });
});

// TODO: apply/destroy integration tests while testing state saving
