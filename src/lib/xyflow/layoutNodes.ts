import dagre from 'dagre';

import type { IXyFlowEdge } from '#/lib/xyflow/interfaces/IXyFlowEdge';
import type { IXyFlowNode } from '#/lib/xyflow/interfaces/IXyFlowNode';

const DEFAULT_NODE_WIDTH = 240;
const DEFAULT_NODE_HEIGHT = 100;

export type TLayoutDirection = 'TB' | 'LR' | 'RL' | 'BT';

/**
 * Get node size from measured dimensions or defaults
 */
function getNodeSize(node: IXyFlowNode): { width: number; height: number } {
  // Use measured dimensions if available (after React Flow renders the node)
  const width = node.measured?.width ?? node.width ?? DEFAULT_NODE_WIDTH;
  const height = node.measured?.height ?? node.height ?? DEFAULT_NODE_HEIGHT;

  return { width, height };
}

export function layoutNodes(
  nodes: IXyFlowNode[],
  edges: IXyFlowEdge[],
  direction: TLayoutDirection = 'LR',
): IXyFlowNode[] {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Configure graph layout
  dagreGraph.setGraph({
    rankdir: direction, // TB: Top to Bottom, LR: Left to Right, RL: Right to Left, BT: Bottom to Top
    align: 'UL', // Upper Left alignment
    nodesep: 120, // Spacing between nodes in the same rank
    ranksep: 200, // Spacing between ranks (increased for better readability)
    marginx: 50,
    marginy: 50,
  });

  // Calculate and store node sizes
  const nodeSizes = new Map<string, { width: number; height: number }>();
  for (const node of nodes) {
    const size = getNodeSize(node);
    nodeSizes.set(node.id, size);
    dagreGraph.setNode(node.id, { width: size.width, height: size.height });
  }

  // Add edges to dagre graph
  for (const edge of edges) {
    dagreGraph.setEdge(edge.source, edge.target);
  }

  // Calculate layout
  dagre.layout(dagreGraph);

  // Update node positions
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const nodeSize = nodeSizes.get(node.id) ?? { width: DEFAULT_NODE_WIDTH, height: DEFAULT_NODE_HEIGHT };

    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeSize.width / 2,
        y: nodeWithPosition.y - nodeSize.height / 2,
      },
    };
  });

  return layoutedNodes;
}
