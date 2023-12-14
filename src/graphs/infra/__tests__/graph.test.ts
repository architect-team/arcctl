import { assertArrayIncludes, assertEquals, assertExists, assertThrows } from 'std/testing/asserts.ts';
import { describe, it } from 'std/testing/bdd.ts';
import { GraphEdge } from '../../edge.ts';
import { InfraGraph } from '../graph.ts';
import { InfraGraphNode, NodeAction, NodeStatusState } from '../node.ts';

describe('InfraGraph', () => {
  describe('Insert edges', () => {
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
  });

  describe('Plan', () => {
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
        nodes: [createGraphNode('test', { action: 'create', state: 'complete' })],
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
          createGraphNode('test', { action: 'delete', state: 'complete' }),
          createGraphNode('test-2', { action: 'delete', state: 'error' }),
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
          createGraphNode('test', { action: 'create', state: 'error' }),
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
          createGraphNode('test', { action: 'update', state: 'complete', inputs: nodeInputs }),
        ],
      });

      const plannedGraph = await InfraGraph.plan({
        before: previousGraph,
        after: new InfraGraph({
          edges: previousGraph.edges,
          nodes: [
            createGraphNode('test', { inputs: nodeInputs }),
          ],
        }),
      });

      assertEquals(plannedGraph.nodes.length, 1);
      assertEquals(plannedGraph.nodes[0].action, 'no-op');
      assertEquals(plannedGraph.nodes[0].status.state, 'complete');
    });

    it('should update node when input changes between before/after', async () => {
      const nodeInputs = { input1: 'foo', input2: 'bar' };
      const modifiedNodeInputs = { input1: 'notFoo', input2: 'notBar' };
      const previousGraph = new InfraGraph({
        nodes: [
          createGraphNode('test', { action: 'update', state: 'complete', inputs: nodeInputs }),
        ],
      });

      const plannedGraph = await InfraGraph.plan({
        before: previousGraph,
        after: new InfraGraph({
          edges: previousGraph.edges,
          nodes: [
            createGraphNode('test', { inputs: modifiedNodeInputs }),
          ],
        }),
      });

      assertEquals(plannedGraph.nodes.length, 1);
      assertEquals(plannedGraph.nodes[0].action, 'update');
      assertEquals(plannedGraph.nodes[0].status.state, 'pending');
    });

    it('should attempt to create node that was previously set to create but unable to', async () => {
      // If a node was set to "create" in the previous graph but the node never ran,
      // a subsequent graph should attempt to "create" the node again.

      const previousStepPending = createGraphNode('test', { action: 'create', state: 'pending' });
      const previousStepErrored = createGraphNode('test-2', { action: 'create', state: 'error' });

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
      const previousGraph = new InfraGraph({
        nodes: [createGraphNode('test', { action: 'update', state: 'pending' })],
      });
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
      const nodeA = createGraphNode('nodeA', { action: 'update' });
      const nodeB = createGraphNode('nodeB', { action: 'update' });
      const nodeC = createGraphNode('nodeC', { action: 'create' });

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
      const nodeA = createGraphNode('nodeA', { action: 'delete', state: 'pending' });
      const nodeB = createGraphNode('nodeB', { action: 'delete', state: 'pending' });
      const nodeC = createGraphNode('nodeC', { action: 'delete', state: 'pending' });

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

  describe('Apply', () => {
    it('should replace input refs with output values', async () => {
      const OUTPUT_VALUE = 'foobarbaz';

      const nodeWithOutput = createGraphNode('testOutputNode', {
        state: 'complete',
        outputs: { anOutput: OUTPUT_VALUE },
      });

      const nodeWithRefInput = createGraphNode('testInputNode', {
        state: 'pending',
        inputs: { anInput: `\${ ${nodeWithOutput.getId()}.anOutput }` },
      });

      const graph = new InfraGraph({
        nodes: [
          nodeWithOutput,
          nodeWithRefInput,
        ],
      });

      graph.resolveInputFunctionsAndRefs(nodeWithRefInput);
      const updatedNode = graph.nodes.find((n) => n.name === 'testInputNode');
      assertExists(updatedNode);
      assertEquals((updatedNode.inputs as Record<string, unknown>).anInput, OUTPUT_VALUE);
    });

    it('should replace nested input refs with output values and resolve functions', async () => {
      const OUTPUT_VALUE_1 = 'FOOBARBAZ';
      const OUTPUT_VALUE_2 = 'bazinga';

      const nodeWithOutput = createGraphNode('testOutputNode', {
        action: 'create',
        outputs: { anOutput: OUTPUT_VALUE_1, anotherOutput: OUTPUT_VALUE_2 },
      });

      const nodeWithRefInput = createGraphNode('testInputNode', {
        action: 'create',
        inputs: {
          aListOfObjectsInput: [
            {
              input1: `\${ toLower(${nodeWithOutput.getId()}.anOutput) }`,
            },
            {
              input2: `\${ toUpper(${nodeWithOutput.getId()}.anotherOutput) }`,
            },
          ],
        },
      });

      const graph = new InfraGraph({
        nodes: [
          nodeWithOutput,
          nodeWithRefInput,
        ],
      });

      graph.resolveInputFunctionsAndRefs(nodeWithRefInput);
      const updatedNode = graph.nodes.find((n) => n.name === 'testInputNode');
      assertExists(updatedNode);
      assertEquals(
        ((updatedNode.inputs as Record<string, unknown>).aListOfObjectsInput as any)[0].input1,
        OUTPUT_VALUE_1.toLowerCase(),
      );
      assertEquals(
        ((updatedNode.inputs as Record<string, unknown>).aListOfObjectsInput as any)[1].input2,
        OUTPUT_VALUE_2.toUpperCase(),
      );
    });

    it('should throw error when output node id is invalid', async () => {
      const inputNodeName = 'testInputNode';
      const invalidOutputRef = 'badId.outputValue';
      const invalidOutputRef2 = 'badId.outputValue2';
      const nodeWithRefInput = createGraphNode(inputNodeName, {
        action: 'create',
        inputs: { anInput: `\${ ${invalidOutputRef} }`, anotherInput: `\${ ${invalidOutputRef2} }` },
      });

      const graph = new InfraGraph({
        nodes: [nodeWithRefInput],
      });

      assertThrows(
        () => {
          graph.resolveInputFunctionsAndRefs(nodeWithRefInput);
        },
        Error,
        `Missing outputs for keys: ${invalidOutputRef}, ${invalidOutputRef2}`,
      );
    });

    it('should throw error when output key is invalid', async () => {
      const outputNodeName = 'testOutputNode';
      const invalidOutputKey = 'wrongOutputName';
      const nodeWithOutput = createGraphNode(outputNodeName, {
        action: 'create',
        outputs: { anOutput: 'foobarbaz' },
      });

      const nodeWithRefInput = createGraphNode('testInputNode', {
        action: 'create',
        inputs: { anInput: `\${ ${nodeWithOutput.name}.${invalidOutputKey} }` },
      });

      const graph = new InfraGraph({
        nodes: [nodeWithOutput, nodeWithRefInput],
      });

      assertThrows(
        () => {
          graph.resolveInputFunctionsAndRefs(nodeWithRefInput);
        },
        Error,
        `Missing outputs for key: ${nodeWithOutput.name}.${invalidOutputKey}`,
      );
    });
  });
});

/**
 * Helper to create a node when the actual contents of the node besides name/action/state are irrelevant.
 */
function createGraphNode(
  name: string,
  options: {
    action?: NodeAction;
    state?: NodeStatusState;
    inputs?: Record<string, any>;
    outputs?: Record<string, any>;
  } = {},
): InfraGraphNode {
  return new InfraGraphNode({
    image: 'test-module:test-tag',
    color: 'blue',
    name,
    action: options.action,
    status: { state: options.state || 'complete' },
    inputs: options.inputs || { name: 'test' },
    outputs: options.outputs || {},
  });
}
