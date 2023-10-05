import { assertEquals } from 'std/testing/asserts.ts';
import { describe, it } from 'std/testing/bdd.ts';
import { CloudEdge } from '../edge.ts';

describe('CloudEdge', () => {
  it('should reverse edge', () => {
    const edge = new CloudEdge({ from: 'A', to: 'B' });
    const reversed_edge = edge.reverse();

    assertEquals(reversed_edge, new CloudEdge({ from: 'B', to: 'A' }));
    assertEquals(reversed_edge.reverse(), edge);
  });
});
