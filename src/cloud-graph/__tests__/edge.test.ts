import { assertEquals } from 'std/testing/asserts.ts';
import { describe, it } from 'std/testing/bdd.ts';
import { CloudEdge } from '../edge.ts';

describe('CloudEdge', () => {
  it('should reverse edge', () => {
    const edge = new CloudEdge({ from: 'A', to: 'B', required: true });
    const reversed_edge = edge.reverse();

    assertEquals(reversed_edge, new CloudEdge({ from: 'B', to: 'A', required: true }));
    assertEquals(reversed_edge.reverse(), edge);
  });

  it('should reverse edge and maintain not required', () => {
    const edge_not_required = new CloudEdge({ from: 'A', to: 'B', required: false });
    const reversed_edge_not_required = edge_not_required.reverse();

    assertEquals(reversed_edge_not_required, new CloudEdge({ from: 'B', to: 'A', required: false }));
  });
});
