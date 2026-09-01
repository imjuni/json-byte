import { describe, expect, it } from 'vitest';

import { applyNodeDimensionChanges } from '#/lib/graph/applyNodeDimensionChanges';

import type { NodeChange } from '@xyflow/react';

import type { IGraphNode } from '#/lib/graph/interfaces/IGraphNode';

const createNode = (id: string): IGraphNode =>
  ({
    id,
    data: {},
    position: { x: 0, y: 0 },
    type: 'object',
  }) as IGraphNode;

describe('applyNodeDimensionChanges', () => {
  it('should preserve unmeasured nodes when only one node dimension changes', () => {
    const nodes = [createNode('root'), createNode('child')];
    const changes = [
      {
        id: 'child',
        type: 'dimensions',
        dimensions: { width: 120, height: 80 },
      },
    ] as NodeChange<IGraphNode>[];

    const result = applyNodeDimensionChanges(nodes, changes);

    expect(result).toHaveLength(2);
    expect(result[0]).toBe(nodes[0]);
    expect(result[1]?.measured).toEqual({ width: 120, height: 80 });
  });

  it('should ignore changes unrelated to dimensions', () => {
    const nodes = [createNode('root'), createNode('child')];
    const changes = [{ id: 'child', type: 'select', selected: true }] as NodeChange<IGraphNode>[];

    const result = applyNodeDimensionChanges(nodes, changes);

    expect(result).toEqual(nodes);
  });
});
