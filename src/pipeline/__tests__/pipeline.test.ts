import { assertArrayIncludes, assertEquals } from 'std/testing/asserts.ts';
import { describe, it } from 'std/testing/bdd.ts';
import { CloudEdge } from '../../cloud-graph/index.ts';
import { Pipeline } from '../pipeline.ts';

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
});
