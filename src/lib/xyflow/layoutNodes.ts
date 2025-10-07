import dagre from 'dagre';

import type { IXyFlowEdge } from '#/lib/xyflow/interfaces/IXyFlowEdge';
import type { IXyFlowNode } from '#/lib/xyflow/interfaces/IXyFlowNode';

const NODE_WIDTH = 200;
const NODE_HEIGHT = 80;

export type TLayoutDirection = 'TB' | 'LR' | 'RL' | 'BT';

export function layoutNodes(
  nodes: IXyFlowNode[],
  edges: IXyFlowEdge[],
  direction: TLayoutDirection = 'TB',
): IXyFlowNode[] {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Configure graph layout
  dagreGraph.setGraph({
    rankdir: direction, // TB: Top to Bottom, LR: Left to Right, RL: Right to Left, BT: Bottom to Top
    align: 'UL', // Upper Left alignment
    nodesep: 100, // Spacing between nodes in the same rank
    ranksep: 150, // Spacing between ranks
    marginx: 50,
    marginy: 50,
  });

  // Add nodes to dagre graph
  for (const node of nodes) {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
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
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      },
    };
  });

  return layoutedNodes;
}
