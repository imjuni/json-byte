import { describe, expect, it } from 'vitest';

import { layoutTreeGraph } from '#/lib/layout/treeLayout';

import type { ElkNode } from 'elkjs/lib/elk-api.js';

describe('layoutTreeGraph', () => {
  it('places tree layers and routes orthogonal edges', () => {
    const graph: ElkNode = {
      id: 'root',
      children: [
        {
          id: 'parent',
          width: 280,
          height: 100,
          ports: [{ id: 'source', x: 272, y: 40, width: 8, height: 8 }],
        },
        {
          id: 'child',
          width: 280,
          height: 100,
          ports: [{ id: 'target', x: 0, y: 4, width: 8, height: 8 }],
        },
      ],
      edges: [{ id: 'edge', sources: ['source'], targets: ['target'] }],
    };

    const result = layoutTreeGraph(graph, 'LR');
    const [parent, child] = result.children ?? [];
    const edge = result.edges?.[0];

    expect(parent?.x).toBe(0);
    expect(child?.x).toBe(420);
    expect(edge?.sections?.[0]?.bendPoints).toHaveLength(2);
    expect(edge?.sections?.[0]?.startPoint.x).toBe(276);
    expect(edge?.sections?.[0]?.endPoint.x).toBe(424);
  });

  it('handles a high fan-out tree without recursion', () => {
    const childCount = 20_000;
    const children: ElkNode[] = [
      {
        id: 'root-node',
        width: 280,
        height: childCount * 20 + 50,
        ports: Array.from({ length: childCount }, (_, index) => ({
          id: `source-${index}`,
          x: 272,
          y: 40 + index * 20,
          width: 8,
          height: 8,
        })),
      },
      ...Array.from({ length: childCount }, (_, index) => ({
        id: `child-${index}`,
        width: 280,
        height: 100,
        ports: [{ id: `target-${index}`, x: 0, y: 4, width: 8, height: 8 }],
      })),
    ];
    const graph: ElkNode = {
      id: 'root',
      children,
      edges: Array.from({ length: childCount }, (_, index) => ({
        id: `edge-${index}`,
        sources: [`source-${index}`],
        targets: [`target-${index}`],
      })),
    };

    const result = layoutTreeGraph(graph, 'LR');

    expect(result.children).toHaveLength(childCount + 1);
    expect(result.edges?.at(-1)?.sections).toHaveLength(1);
  });
});
