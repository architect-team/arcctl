/**
 * Topologically sort the graph, and raising an error if a cycle is detected.
 * Input graph has a key for each node and a set of edges that node points to.
 */
export function topologicalSort(graph: Record<string, Set<string>>): string[] {
  const result: string[] = [];
  const discovered = new Set<string>();
  const finished = new Set<string>();

  const topoSortHelper = (
    node: string,
    discovered: Set<string>,
    finished: Set<string>,
  ) => {
    discovered.add(node);

    for (const edge of graph[node] || []) {
      if (discovered.has(edge)) {
        throw Error(`A circular dependency has been found between '${node}' and '${edge}'`);
      }
      if (!finished.has(edge)) {
        topoSortHelper(edge, discovered, finished);
      }
    }

    discovered.delete(node);
    finished.add(node);
    result.unshift(node);
  };

  for (const node of Object.keys(graph)) {
    if (!finished.has(node) && !discovered.has(node)) {
      topoSortHelper(node, discovered, finished);
    }
  }

  return result;
}
