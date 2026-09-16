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

  it.each(['LR', 'TB'] as const)('reserves %s layer space for separated edge lanes', (direction) => {
    const childCount = 30;
    const isHorizontal = direction === 'LR';
    const root: ElkNode = {
      id: 'root-node',
      width: 280,
      height: childCount * 30 + 50,
      ports: Array.from({ length: childCount }, (_, index) => ({
        id: `source-${index}`,
        x: isHorizontal ? 272 : ((index + 1) * 280) / (childCount + 1) - 4,
        y: isHorizontal ? 40 + index * 30 : childCount * 30 + 42,
        width: 8,
        height: 8,
      })),
    };
    const children = Array.from(
      { length: childCount },
      (_, index): ElkNode => ({
        id: `child-${index}`,
        width: 280,
        height: 100,
        ports: [{ id: `target-${index}`, x: isHorizontal ? 0 : 136, y: isHorizontal ? 4 : 0, width: 8, height: 8 }],
      }),
    );
    const graph: ElkNode = {
      id: 'root',
      children: [root, ...children],
      edges: Array.from({ length: childCount }, (_, index) => ({
        id: `edge-${index}`,
        sources: [`source-${index}`],
        targets: [`target-${index}`],
      })),
    };

    const result = layoutTreeGraph(graph, direction);
    const firstChild = result.children?.[1];
    const layerGap = isHorizontal
      ? (firstChild?.x ?? 0) - ((root.x ?? 0) + (root.width ?? 0))
      : (firstChild?.y ?? 0) - ((root.y ?? 0) + (root.height ?? 0));

    expect(layerGap).toBeGreaterThanOrEqual((childCount - 2) * 6 + 64);
  });
});
