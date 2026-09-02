import type { ElkExtendedEdge, ElkNode, ElkPort } from 'elkjs/lib/elk-api.js';

import type { IGraphEdge } from '#/lib/graph/interfaces/IGraphEdge';
import type { IGraphNode } from '#/lib/graph/interfaces/IGraphNode';
import type { IElkLayoutResult, ILayoutEdge, ILayoutPort } from '#/lib/layout/interfaces/IElkLayoutResult';

export const NODE_WIDTH = 280;
export const HEADER_HEIGHT = 40;
export const LINE_HEIGHT = 30;
export const NODE_PADDING = 10;

export const getNodeHeight = (node: IGraphNode): number => {
  const fieldCount = node.data.primitiveFields.length + node.data.complexFields.length;
  return HEADER_HEIGHT + fieldCount * LINE_HEIGHT + NODE_PADDING;
};

export const getSourcePortId = (nodeId: string, fieldKey: string): string => `${nodeId}-source-${fieldKey}`;
export const getTargetPortId = (nodeId: string): string => `${nodeId}-target`;

const getPortAnchor = (port: ElkPort, node: ElkNode): { x: number; y: number } => {
  const x = port.x ?? 0;
  const y = port.y ?? 0;
  const width = port.width ?? 0;
  const height = port.height ?? 0;
  const side = port.layoutOptions?.['elk.port.side'];

  if (side === 'EAST') return { x: node.width ?? x + width, y: y + height / 2 };
  if (side === 'WEST') return { x: 0, y: y + height / 2 };
  if (side === 'SOUTH') return { x: x + width / 2, y: node.height ?? y + height };
  return { x: x + width / 2, y: 0 };
};

export function createElkGraph(nodes: IGraphNode[], edges: IGraphEdge[], direction: 'LR' | 'TB' = 'LR'): ElkNode {
  const nodeIds = new Set(nodes.map((node) => node.id));
  const elkNodes = nodes.map<ElkNode>((node) => {
    const height = getNodeHeight(node);
    const sourceCount = Math.max(node.data.complexFields.length, 1);
    const sourcePorts = node.data.complexFields.map<ElkPort>((field, index) => ({
      id: getSourcePortId(node.id, field.key),
      width: 8,
      height: 8,
      x: direction === 'LR' ? NODE_WIDTH - 8 : ((index + 1) * NODE_WIDTH) / (sourceCount + 1) - 4,
      y:
        direction === 'LR'
          ? HEADER_HEIGHT + (node.data.primitiveFields.length + index + 0.5) * LINE_HEIGHT - 4
          : height - 8,
      layoutOptions: {
        'elk.port.side': direction === 'LR' ? 'EAST' : 'SOUTH',
        'elk.port.index': String(index + 1),
      },
    }));
    const targetPort: ElkPort = {
      id: getTargetPortId(node.id),
      width: 8,
      height: 8,
      x: direction === 'LR' ? 0 : NODE_WIDTH / 2 - 4,
      y: direction === 'LR' ? 4 : 0,
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
      layoutOptions: { 'elk.portConstraints': 'FIXED_POS' },
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
      'elk.spacing.edgeNode': '24',
      'elk.spacing.edgeEdge': '16',
      'elk.spacing.portPort': '12',
      'elk.layered.spacing.nodeNodeBetweenLayers': '140',
      'elk.layered.spacing.edgeNodeBetweenLayers': '32',
      'elk.layered.spacing.edgeEdgeBetweenLayers': '16',
      'elk.layered.layering.strategy': 'NETWORK_SIMPLEX',
      'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
      'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
      'elk.layered.crossingMinimization.forceNodeModelOrder': 'true',
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
  const layoutedPorts = (graph.children ?? []).flatMap<ILayoutPort>((node) =>
    (node.ports ?? []).map((port) => ({ id: port.id, nodeId: node.id, position: getPortAnchor(port, node) })),
  );
  const nodesById = new Map((graph.children ?? []).map((node) => [node.id, node]));
  const absolutePortPositions = new Map(
    layoutedPorts.map((port) => {
      const node = nodesById.get(port.nodeId);
      return [
        port.id,
        {
          x: (node?.x ?? 0) + port.position.x,
          y: (node?.y ?? 0) + port.position.y,
        },
      ];
    }),
  );
  const layoutedEdges = (graph.edges ?? []).map<ILayoutEdge>((edge) => {
    const sections = (edge.sections ?? []).map((section) => [
      section.startPoint,
      ...(section.bendPoints ?? []),
      section.endPoint,
    ]);
    const firstSection = sections[0];
    const lastSection = sections.at(-1);
    const sourcePosition = absolutePortPositions.get(edge.sources[0] ?? '');
    const targetPosition = absolutePortPositions.get(edge.targets[0] ?? '');

    if (firstSection != null && sourcePosition != null) firstSection[0] = sourcePosition;
    if (lastSection != null && targetPosition != null) lastSection[lastSection.length - 1] = targetPosition;

    return { id: edge.id, sections };
  });

  return {
    nodes: layoutedNodes,
    edges: layoutedEdges,
    ports: layoutedPorts,
    bounds: { width: graph.width ?? 0, height: graph.height ?? 0 },
  };
}

export function applyGraphLayout(
  nodes: IGraphNode[],
  edges: IGraphEdge[],
  direction: 'LR' | 'TB' = 'LR',
): { promise: Promise<IElkLayoutResult>; cancel: () => void } {
  const graph = createElkGraph(nodes, edges, direction);
  const worker = new Worker(new URL('./treeLayout.worker.ts', import.meta.url), { type: 'module' });
  const promise = new Promise<IElkLayoutResult>((resolve, reject) => {
    worker.onmessage = (event: MessageEvent<ElkNode>) => resolve(mapElkResult(nodes, event.data));
    worker.onerror = (event) => reject(new Error(event.message));
    worker.postMessage({ graph, direction });
  }).finally(() => worker.terminate());

  return { promise, cancel: () => worker.terminate() };
}
