import { assertEquals } from 'std/testing/asserts.ts';
import { describe, it } from 'std/testing/bdd.ts';
import { AppEdge } from '../edge.ts';

describe('AppEdge', () => {
  it('should reverse edge', () => {
    const edge = new AppEdge({ from: 'A', to: 'B' });
    const reversed_edge = edge.reverse();

    assertEquals(reversed_edge, new AppEdge({ from: 'B', to: 'A' }));
    assertEquals(reversed_edge.reverse(), edge);
  });
});
