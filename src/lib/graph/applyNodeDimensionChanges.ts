import type { NodeChange } from '@xyflow/react';

import type { IGraphNode } from '#/lib/graph/interfaces/IGraphNode';

export function applyNodeDimensionChanges(nodes: IGraphNode[], changes: NodeChange<IGraphNode>[]): IGraphNode[] {
  const dimensionChanges = changes.reduce<Record<string, NodeChange<IGraphNode>>>((aggregated, change) => {
    if ('id' in change && change.type === 'dimensions' && change.dimensions != null) {
      return { ...aggregated, [change.id]: change };
    }

    return aggregated;
  }, {});

  return nodes.map((node) => {
    const change = dimensionChanges[node.id];

    if (change?.type !== 'dimensions' || change.dimensions == null) {
      return node;
    }

    return {
      ...node,
      measured: {
        width: change.dimensions.width,
        height: change.dimensions.height,
      },
    };
  });
}
