/* eslint-disable no-continue, no-param-reassign, no-restricted-syntax, @typescript-eslint/prefer-for-of */
import type { ElkExtendedEdge, ElkNode, ElkPort } from 'elkjs/lib/elk-api.js';

const NODE_SPACING = 80;
const LAYER_SPACING = 140;

const portCenter = (node: ElkNode, port: ElkPort): { x: number; y: number } => ({
  x: (node.x ?? 0) + (port.x ?? 0) + (port.width ?? 0) / 2,
  y: (node.y ?? 0) + (port.y ?? 0) + (port.height ?? 0) / 2,
});

export function layoutTreeGraph(graph: ElkNode, direction: 'LR' | 'TB'): ElkNode {
  const nodes = graph.children ?? [];
  const edges: ElkExtendedEdge[] = graph.edges ?? [];
  const portById = new Map<string, { node: ElkNode; port: ElkPort }>();
  const childrenById = new Map<string, string[]>();
  const indegree = new Map(nodes.map((node) => [node.id, 0]));

  for (const node of nodes) {
    for (const port of node.ports ?? []) portById.set(port.id, { node, port });
  }

  for (const edge of edges) {
    const source = portById.get(edge.sources[0] ?? '')?.node.id;
    const target = portById.get(edge.targets[0] ?? '')?.node.id;
    if (source == null || target == null) continue;
    const children = childrenById.get(source) ?? [];
    children.push(target);
    childrenById.set(source, children);
    indegree.set(target, (indegree.get(target) ?? 0) + 1);
  }

  const depthById = new Map<string, number>();
  const queue = nodes.filter((node) => (indegree.get(node.id) ?? 0) === 0).map((node) => node.id);
  for (const id of queue) depthById.set(id, 0);
  for (let index = 0; index < queue.length; index += 1) {
    const id = queue[index];
    if (id == null) continue;
    const depth = depthById.get(id) ?? 0;
    for (const childId of childrenById.get(id) ?? []) {
      if (depthById.has(childId)) continue;
      depthById.set(childId, depth + 1);
      queue.push(childId);
    }
  }

  const layers: ElkNode[][] = [];
  for (const node of nodes) {
    const depth = depthById.get(node.id) ?? 0;
    (layers[depth] ??= []).push(node);
  }

  let layerOffset = 0;
  for (const layer of layers) {
    let crossOffset = 0;
    let layerSize = 0;
    for (const node of layer) {
      node.x = direction === 'LR' ? layerOffset : crossOffset;
      node.y = direction === 'LR' ? crossOffset : layerOffset;
      crossOffset += (direction === 'LR' ? node.height : node.width) ?? 0;
      crossOffset += NODE_SPACING;
      layerSize = Math.max(layerSize, (direction === 'LR' ? node.width : node.height) ?? 0);
    }
    layerOffset += layerSize + LAYER_SPACING;
  }

  for (const edge of edges) {
    const sourceEntry = portById.get(edge.sources[0] ?? '');
    const targetEntry = portById.get(edge.targets[0] ?? '');
    if (sourceEntry == null || targetEntry == null) continue;
    const source = portCenter(sourceEntry.node, sourceEntry.port);
    const target = portCenter(targetEntry.node, targetEntry.port);
    const bendPoints =
      direction === 'LR'
        ? [
            { x: (source.x + target.x) / 2, y: source.y },
            { x: (source.x + target.x) / 2, y: target.y },
          ]
        : [
            { x: source.x, y: (source.y + target.y) / 2 },
            { x: target.x, y: (source.y + target.y) / 2 },
          ];
    edge.sections = [{ id: `${edge.id}-section`, startPoint: source, bendPoints, endPoint: target }];
  }

  graph.width = Math.max(0, ...nodes.map((node) => (node.x ?? 0) + (node.width ?? 0)));
  graph.height = Math.max(0, ...nodes.map((node) => (node.y ?? 0) + (node.height ?? 0)));
  return graph;
}
