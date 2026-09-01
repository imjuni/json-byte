import ELK from 'elkjs/lib/elk-api.js';
// Vite resolves the worker asset query during bundling.
// eslint-disable-next-line import-x/no-unresolved
import elkWorkerUrl from 'elkjs/lib/elk-worker.min.js?url';

import type { ElkExtendedEdge, ElkNode, ElkPort } from 'elkjs/lib/elk-api.js';

import type { IGraphEdge } from '#/lib/graph/interfaces/IGraphEdge';
import type { IGraphNode } from '#/lib/graph/interfaces/IGraphNode';
import type { IElkLayoutResult, ILayoutEdge } from '#/lib/layout/interfaces/IElkLayoutResult';

export const NODE_WIDTH = 280;
export const HEADER_HEIGHT = 40;
export const LINE_HEIGHT = 20;
export const NODE_PADDING = 10;

export const getNodeHeight = (node: IGraphNode): number => {
  const fieldCount = node.data.primitiveFields.length + node.data.complexFields.length;
  return HEADER_HEIGHT + fieldCount * LINE_HEIGHT + NODE_PADDING;
};

const getSourcePortId = (nodeId: string, fieldKey: string): string => `${nodeId}-source-${fieldKey}`;
const getTargetPortId = (nodeId: string): string => `${nodeId}-target`;

export function createElkGraph(nodes: IGraphNode[], edges: IGraphEdge[], direction: 'LR' | 'TB' = 'LR'): ElkNode {
  const nodeIds = new Set(nodes.map((node) => node.id));
  const elkNodes = nodes.map<ElkNode>((node) => {
    const height = getNodeHeight(node);
    const sourceCount = Math.max(node.data.complexFields.length, 1);
    const sourcePorts = node.data.complexFields.map<ElkPort>((field, index) => ({
      id: getSourcePortId(node.id, field.key),
      width: 8,
      height: 8,
      x: direction === 'LR' ? NODE_WIDTH - 4 : ((index + 1) * NODE_WIDTH) / (sourceCount + 1) - 4,
      y: direction === 'LR' ? HEADER_HEIGHT + (node.data.primitiveFields.length + index) * LINE_HEIGHT + 4 : height - 4,
      layoutOptions: {
        'elk.port.side': direction === 'LR' ? 'EAST' : 'SOUTH',
        'elk.port.index': String(index + 1),
      },
    }));
    const targetPort: ElkPort = {
      id: getTargetPortId(node.id),
      width: 8,
      height: 8,
      x: direction === 'LR' ? -4 : NODE_WIDTH / 2 - 4,
      y: direction === 'LR' ? 4 : -4,
      layoutOptions: {
        'elk.port.side': direction === 'LR' ? 'WEST' : 'NORTH',
        'elk.port.index': '0',
      },
    };

    return {
      id: node.id,
      width: NODE_WIDTH,
      height,
      ports: [targetPort, ...sourcePorts],
      layoutOptions: { 'elk.portConstraints': 'FIXED_ORDER' },
    };
  });
  const elkEdges = edges
    .filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target))
    .map<ElkExtendedEdge>((edge) => ({
      id: edge.id,
      sources: [getSourcePortId(edge.source, edge.label)],
      targets: [getTargetPortId(edge.target)],
    }));

  return {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': direction === 'LR' ? 'RIGHT' : 'DOWN',
      'elk.edgeRouting': 'ORTHOGONAL',
      'elk.spacing.nodeNode': '80',
      'elk.layered.spacing.nodeNodeBetweenLayers': '140',
      'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
      'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
      'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
      'elk.layered.mergeEdges': 'false',
    },
    children: elkNodes,
    edges: elkEdges,
  };
}

export function mapElkResult(nodes: IGraphNode[], graph: ElkNode): IElkLayoutResult {
  const positions = new Map((graph.children ?? []).map((node) => [node.id, node]));
  const layoutedNodes = nodes.map((node) => {
    const layouted = positions.get(node.id);
    if (layouted?.x == null || layouted.y == null) return node;

    return {
      ...node,
      width: layouted.width,
      height: layouted.height,
      position: { x: layouted.x, y: layouted.y },
    };
  });
  const layoutedEdges = (graph.edges ?? []).map<ILayoutEdge>((edge) => ({
    id: edge.id,
    points: (edge.sections ?? []).flatMap((section) => [
      section.startPoint,
      ...(section.bendPoints ?? []),
      section.endPoint,
    ]),
  }));

  return {
    nodes: layoutedNodes,
    edges: layoutedEdges,
    bounds: { width: graph.width ?? 0, height: graph.height ?? 0 },
  };
}

export function applyElkLayout(
  nodes: IGraphNode[],
  edges: IGraphEdge[],
  direction: 'LR' | 'TB' = 'LR',
): { promise: Promise<IElkLayoutResult>; cancel: () => void } {
  const elk = new ELK({ workerUrl: elkWorkerUrl });
  const promise = elk
    .layout(createElkGraph(nodes, edges, direction))
    .then((graph) => mapElkResult(nodes, graph))
    .finally(() => elk.terminateWorker());

  return { promise, cancel: () => elk.terminateWorker() };
}
