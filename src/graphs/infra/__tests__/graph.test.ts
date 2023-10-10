import { assertArrayIncludes, assertEquals } from 'std/testing/asserts.ts';
import { describe, it } from 'std/testing/bdd.ts';
import { GraphEdge } from '../../edge.ts';
import { InfraGraph } from '../graph.ts';
import { InfraGraphNode, NodeAction, NodeStatusState } from '../node.ts';

describe('InfraGraph', () => {
  it('should add edges', () => {
    const infraGraph = new InfraGraph();
    infraGraph.insertEdges(
      new GraphEdge({
        from: 'a',
        to: 'b',
      }),
    );

    assertEquals(infraGraph.edges.length, 1);
    assertArrayIncludes(
      infraGraph.edges,
      [
        new GraphEdge({
          from: 'a',
          to: 'b',
        }),
      ],
    );
  });

  it('should remove edge with both to and from values', () => {
    const infraGraph = new InfraGraph();
    infraGraph.insertEdges(
      new GraphEdge({
        from: 'a',
        to: 'b',
      }),
    );
    infraGraph.removeEdge({
      to: 'b',
      from: 'a',
    });

    assertEquals(infraGraph.edges.length, 0);
  });

  it('should schedule new nodes for creation', async () => {
    const plannedGraph = await InfraGraph.plan({
      before: new InfraGraph(),
      after: new InfraGraph({
        edges: [],
        nodes: [createGraphNode('test')],
      }),
    });

    assertEquals(plannedGraph.nodes.length, 1);
    assertEquals(plannedGraph.nodes[0].action, 'create');
  });

  it('should schedule old nodes for deletion', async () => {
    const previousGraph = new InfraGraph({
      nodes: [createGraphNode('test', 'create', 'complete')],
    });

    const plannedGraph = await InfraGraph.plan({
      before: previousGraph,
      after: new InfraGraph(),
    });

    assertEquals(plannedGraph.nodes.length, 1);
    assertEquals(plannedGraph.nodes[0].action, 'delete');
  });

  it('should schedule old nodes for deletion after some failed in previous graph', async () => {
    const previousGraph = new InfraGraph({
      nodes: [
        createGraphNode('test', 'delete', 'complete'),
        createGraphNode('test-2', 'delete', 'error'),
      ],
    });

    const plannedGraph = await InfraGraph.plan({
      before: previousGraph,
      after: new InfraGraph(),
    });

    assertEquals(plannedGraph.nodes.length, 1);
    assertEquals(plannedGraph.nodes[0].action, 'delete');
    assertEquals(plannedGraph.nodes[0].name, 'test-2');
  });

  it('should delete a node that was previously created and errored', async () => {
    const previousGraph = new InfraGraph({
      nodes: [
        createGraphNode('test', 'create', 'error'),
      ],
    });

    const plannedGraph = await InfraGraph.plan({
      before: previousGraph,
      after: new InfraGraph(),
    });

    assertEquals(plannedGraph.nodes.length, 1);
    assertEquals(plannedGraph.nodes[0].action, 'delete');
  });

  it('should set leaf update node as no-op w/out changes', async () => {
    const nodeInputs = { input1: 'foo', input2: 'bar' };
    const previousGraph = new InfraGraph({
      nodes: [
        createGraphNode('test', 'update', 'complete', nodeInputs),
      ],
    });

    const plannedGraph = await InfraGraph.plan({
      before: previousGraph,
      after: new InfraGraph({
        edges: previousGraph.edges,
        nodes: [
          createGraphNode('test', undefined, undefined, nodeInputs),
        ],
      }),
    });

    assertEquals(plannedGraph.nodes.length, 1);
    assertEquals(plannedGraph.nodes[0].action, 'no-op');
  });

  it('should attempt to create node that was previously set to create but unable to', async () => {
    // If a node was set to "create" in the previous graph but the node never ran,
    // a subsequent graph should attempt to "create" the node again.

    const previousStepPending = createGraphNode('test', 'create', 'pending');
    const previousStepErrored = createGraphNode('test-2', 'create', 'error');

    const previousGraph = new InfraGraph({ nodes: [previousStepPending, previousStepErrored] });
    const plannedGraph = await InfraGraph.plan({
      before: previousGraph,
      after: new InfraGraph({
        edges: previousGraph.edges,
        nodes: [
          createGraphNode('test'),
          createGraphNode('test-2'),
        ],
      }),
    });

    assertEquals(plannedGraph.nodes.length, 2);
    assertEquals(plannedGraph.nodes[0].action, 'create');
    assertEquals(plannedGraph.nodes[1].action, 'create');
  });

  it('should attempt to update node that was previously set to update but unable to', async () => {
    // If a node was set to "update" in the previous graph but the node never ran,
    // a subsequent graph should attempt to "update" the node again.
    const previousGraph = new InfraGraph({ nodes: [createGraphNode('test', 'update', 'pending')] });
    const plannedGraph = await InfraGraph.plan({
      before: previousGraph,
      after: new InfraGraph({
        edges: previousGraph.edges,
        nodes: [
          createGraphNode('test'),
        ],
      }),
    });

    assertEquals(plannedGraph.nodes.length, 1);
    assertEquals(plannedGraph.nodes[0].action, 'update');
  });

  it('should reverse edges when removing nodes', async () => {
    const nodeA = createGraphNode('nodeA', 'update');
    const nodeB = createGraphNode('nodeB', 'update');
    const nodeC = createGraphNode('nodeC', 'create');

    const edgeAB = new GraphEdge({ from: nodeA.getId(), to: nodeB.getId() });
    const edgeBC = new GraphEdge({ from: nodeB.getId(), to: nodeC.getId() });

    const previousGraph = new InfraGraph({
      nodes: [nodeA, nodeB, nodeC],
      edges: [edgeAB, edgeBC],
    });

    const plannedGraph = await InfraGraph.plan({
      before: previousGraph,
      after: new InfraGraph(),
    });

    // All nodes should now be delete
    assertEquals(plannedGraph.nodes.length, 3);
    assertEquals(plannedGraph.nodes[0].action, 'delete');
    assertEquals(plannedGraph.nodes[1].action, 'delete');
    assertEquals(plannedGraph.nodes[2].action, 'delete');

    // All edges should be the reverse of the edges from the previous graph
    assertEquals(plannedGraph.edges.length, 2);
    assertArrayIncludes(plannedGraph.edges, [edgeAB.reverse(), edgeBC.reverse()]);
  });

  it('should NOT flip edges when removing if previous graph nodes were already delete nodes', async () => {
    const nodeA = createGraphNode('nodeA', 'delete', 'pending');
    const nodeB = createGraphNode('nodeB', 'delete', 'pending');
    const nodeC = createGraphNode('nodeC', 'delete', 'pending');

    const edgeAB = new GraphEdge({ from: nodeA.getId(), to: nodeB.getId() });
    const edgeBC = new GraphEdge({ from: nodeB.getId(), to: nodeC.getId() });

    const previousGraph = new InfraGraph({
      nodes: [nodeA, nodeB, nodeC],
      edges: [edgeAB, edgeBC],
    });

    const plannedGraph = await InfraGraph.plan({
      before: previousGraph,
      after: new InfraGraph(),
    });

    // All nodes should still be delete
    assertEquals(plannedGraph.nodes.length, 3);
    assertEquals(plannedGraph.nodes[0].action, 'delete');
    assertEquals(plannedGraph.nodes[1].action, 'delete');
    assertEquals(plannedGraph.nodes[2].action, 'delete');

    // All edges should be exactly the same as before
    assertEquals(plannedGraph.edges.length, 2);
    assertArrayIncludes(plannedGraph.edges, [edgeAB, edgeBC]);
  });
});

/**
 * Helper to create a node when the actual contents of the node besides name/action/state are irrelevant.
 */
function createGraphNode(
  name: string,
  action?: NodeAction,
  state?: NodeStatusState,
  inputs?: Record<string, any>,
): InfraGraphNode {
  return new InfraGraphNode({
    image: 'test-module:test-tag',
    plugin: 'pulumi',
    color: 'blue',
    name,
    action,
    status: { state: state || 'complete' },
    inputs: inputs || { name: 'test' },
  });
}
