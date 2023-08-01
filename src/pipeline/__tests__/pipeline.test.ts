import { assertArrayIncludes, assertEquals } from 'std/testing/asserts.ts';
import { describe, it } from 'std/testing/bdd.ts';
import { EmptyProviderStore } from '../../@providers/index.ts';
import { SupportedProviders } from '../../@providers/supported-providers.ts';
import { CloudEdge, CloudGraph, CloudNode } from '../../cloud-graph/index.ts';
import { Pipeline } from '../pipeline.ts';
import { PipelineStep } from '../step.ts';

describe('Pipeline', () => {
  it('should add edges', () => {
    const pipeline = new Pipeline();
    pipeline.insertEdges(
      new CloudEdge({
        from: 'a',
        to: 'b',
        required: true,
      }),
    );

    assertEquals(pipeline.edges.length, 1);
    assertArrayIncludes(
      pipeline.edges,
      [
        new CloudEdge({
          from: 'a',
          to: 'b',
          required: true,
        }),
      ],
    );
  });

  it('should remove edge with both to and from values', () => {
    const pipeline = new Pipeline();
    pipeline.insertEdges(
      new CloudEdge({
        from: 'a',
        to: 'b',
        required: true,
      }),
    );

    pipeline.removeEdge({
      to: 'b',
      from: 'a',
    });

    assertEquals(pipeline.edges.length, 0);
  });

  it('should schedule new nodes for creation', async () => {
    // no-op uses hashes generated by providers to detect drift
    const providerStore = new EmptyProviderStore();
    providerStore.save(new SupportedProviders.docker('docker', {}, providerStore, {}));

    const plannedPipeline = await Pipeline.plan({
      before: new Pipeline(),
      after: new CloudGraph({
        edges: [],
        nodes: [
          new CloudNode({
            name: 'test',
            inputs: {
              name: 'test',
              databaseSize: 'large',
              databaseType: 'postgres',
              databaseVersion: '15',
              region: 'region',
              type: 'databaseCluster',
              vpc: 'vpc',
              account: 'docker',
            },
          }),
        ],
      }),
    }, providerStore);

    assertEquals(plannedPipeline.steps.length, 1);
    assertEquals(plannedPipeline.steps[0].action, 'create');
  });

  it('should schedule old nodes for deletion', async () => {
    // no-op uses hashes generated by providers to detect drift
    const providerStore = new EmptyProviderStore();
    providerStore.save(new SupportedProviders.docker('docker', {}, providerStore, {}));

    const previousPipeline = new Pipeline({
      steps: [
        new PipelineStep({
          name: 'test',
          action: 'create',
          type: 'databaseCluster',
          color: 'blue',
          status: {
            state: 'complete',
          },
          inputs: {
            name: 'test',
            databaseSize: 'large',
            databaseType: 'postgres',
            databaseVersion: '15',
            region: 'region',
            type: 'databaseCluster',
            vpc: 'vpc',
            account: 'docker',
          },
        }),
      ],
    });

    const plannedPipeline = await Pipeline.plan({
      before: previousPipeline,
      after: new CloudGraph(),
    }, providerStore);

    assertEquals(plannedPipeline.steps.length, 1);
    assertEquals(plannedPipeline.steps[0].action, 'delete');
  });

  it('should set leaf update step as no-op w/out changes', async () => {
    // no-op uses hashes generated by providers to detect drift
    const providerStore = new EmptyProviderStore();
    providerStore.save(new SupportedProviders.docker('docker', {}, providerStore, {}));

    const previousStep = new PipelineStep({
      name: 'test',
      action: 'update',
      type: 'databaseCluster',
      color: 'blue',
      status: {
        state: 'complete',
      },
      inputs: {
        name: 'test',
        databaseSize: 'large',
        databaseType: 'postgres',
        databaseVersion: '15',
        region: 'region',
        type: 'databaseCluster',
        vpc: 'vpc',
        account: 'docker',
      },
    });

    const previousPipeline = new Pipeline({ steps: [previousStep] });
    const plannedPipeline = await Pipeline.plan({
      before: previousPipeline,
      after: new CloudGraph({
        edges: previousPipeline.edges,
        nodes: [
          new CloudNode({
            name: 'test',
            inputs: {
              name: 'test',
              databaseSize: 'large',
              databaseType: 'postgres',
              databaseVersion: '15',
              region: 'region',
              type: 'databaseCluster',
              vpc: 'vpc',
              account: 'docker',
            },
          }),
        ],
      }),
    }, providerStore);

    assertEquals(plannedPipeline.steps.length, 1);
    assertEquals(plannedPipeline.steps[0].action, 'no-op');
  });

  it('should attempt to update node that was previously set to update but unable to', async () => {
    // If a node was set to "update" in the previous pipeline but the step never ran,
    // a subsequent pipeline should attempt to "update" the node again.

    const providerStore = new EmptyProviderStore();
    providerStore.save(new SupportedProviders.docker('docker', {}, providerStore, {}));

    const previousStep = new PipelineStep({
      name: 'test',
      action: 'update',
      type: 'namespace',
      color: 'blue',
      status: { state: 'pending' },
      inputs: { type: 'namespace', account: 'test-account', name: 'test-ns' },
    });

    const previousPipeline = new Pipeline({ steps: [previousStep] });
    const plannedPipeline = await Pipeline.plan({
      before: previousPipeline,
      after: new CloudGraph({
        edges: previousPipeline.edges,
        nodes: [
          new CloudNode({
            name: 'test',
            inputs: { type: 'namespace', account: 'test-account', name: 'test-ns' },
          }),
        ],
      }),
    }, providerStore);

    assertEquals(plannedPipeline.steps.length, 1);
    assertEquals(plannedPipeline.steps[0].action, 'update');
  });
});
