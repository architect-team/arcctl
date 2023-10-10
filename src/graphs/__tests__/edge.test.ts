import { assertEquals } from 'std/testing/asserts.ts';
import { describe, it } from 'std/testing/bdd.ts';
import { GraphEdge } from '../edge.ts';

describe('GraphEdge', () => {
  it('should reverse edge', () => {
    const edge = new GraphEdge({ from: 'A', to: 'B' });
    const reversed_edge = edge.reverse();

    assertEquals(reversed_edge, new GraphEdge({ from: 'B', to: 'A' }));
    assertEquals(reversed_edge.reverse(), edge);
  });
});
