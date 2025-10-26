import ELK, { type ElkNode } from 'elkjs/lib/elk.bundled.js';

import type { IGraphEdge } from '#/lib/graph/interfaces/IGraphEdge';
import type { IGraphNode } from '#/lib/graph/interfaces/IGraphNode';

const elk = new ELK();

export async function applyElkLayout(
  nodes: IGraphNode[],
  edges: IGraphEdge[],
  direction: 'LR' | 'TB' = 'TB',
): Promise<IGraphNode[]> {
  // Convert graph nodes to ELK format with ports
  const elkNodes = nodes.map((node) => {
    const totalFields = node.data.primitiveFields.length + node.data.complexFields.length;
    const headerHeight = 40;
    const lineHeight = 26; // Match PixiGraphRenderer
    const paddingTop = 10;
    const paddingBottom = 10;
    const height = headerHeight + totalFields * lineHeight + paddingTop + paddingBottom;
    const width = 280;

    // Create ports for each complex field - at the right edge
    const ports = node.data.complexFields.map((field, index) => {
      const primitiveFieldsCount = node.data.primitiveFields.length;
      const fieldYOffset = headerHeight + paddingTop + primitiveFieldsCount * lineHeight + index * lineHeight;

      return {
        id: `${node.id}-port-${field.key}`,
        properties: {
          'port.side': 'EAST', // Ports on the right side
          'port.index': String(index), // Order of ports
        },
        width: 10,
        height: 10,
        x: width, // At the right edge, matching the handle position
        y: fieldYOffset + 11, // Match handle position in PixiGraphRenderer (+3 text offset + 8)
      };
    });

    return {
      id: node.id,
      width,
      height,
      ports: ports.length > 0 ? ports : undefined,
    };
  });

  // Convert graph edges to ELK format with port references
  const elkEdges = edges.map((edge) => {
    const sourceNode = nodes.find((n) => n.id === edge.source);
    const sourcePortId = sourceNode ? `${edge.source}-port-${edge.label}` : undefined;

    return {
      id: edge.id,
      sources: sourcePortId ? [sourcePortId] : [edge.source],
      targets: [edge.target],
    };
  });

  // Map direction to ELK format
  const elkDirection = direction === 'LR' ? 'RIGHT' : 'DOWN';

  // Create ELK graph
  // Node width is 280, so 120% spacing = 336
  const nodeSpacing = Math.round(280 * 1.2);

  const elkGraph: ElkNode = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': elkDirection,
      'elk.spacing.nodeNode': String(nodeSpacing),
      'elk.layered.spacing.nodeNodeBetweenLayers': String(nodeSpacing),
      'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX', // Better for minimizing edge crossings
      'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP', // Minimize edge crossings
      'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES', // Consider port order
      'elk.portConstraints': 'FIXED_ORDER', // Respect port order
    },
    children: elkNodes,
    edges: elkEdges,
  };

  // Calculate layout
  const layoutedGraph = await elk.layout(elkGraph);

  // Apply positions back to original nodes
  const layoutedNodes = nodes.map((node) => {
    const elkNode = layoutedGraph.children?.find((n) => n.id === node.id);
    if (elkNode?.x != null && elkNode?.y != null) {
      return {
        ...node,
        position: {
          x: elkNode.x,
          y: elkNode.y,
        },
      };
    }
    return node;
  });

  return layoutedNodes;
}
