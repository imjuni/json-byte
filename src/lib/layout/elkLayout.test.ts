import { describe, expect, it } from 'vitest';

import { createElkGraph, mapElkResult } from '#/lib/layout/elkLayout';

import type { ElkNode } from 'elkjs/lib/elk.bundled.js';

import type { IGraphEdge } from '#/lib/graph/interfaces/IGraphEdge';
import type { IGraphNode } from '#/lib/graph/interfaces/IGraphNode';

const createNode = (id: string, label: string): IGraphNode => ({
  id,
  draggable: false,
  position: { x: 0, y: 0 },
  data: {
    label,
    searched: false,
    stringify: '{}',
    origin: {},
    nodeType: 'object',
    primitiveFields: [],
    complexFields: [],
    _children: [],
    _parent: undefined,
  },
});

describe('elkLayout', () => {
  it('should create orthogonal ELK graph with connected ports', () => {
    const parent = createNode('$', 'root');
    const child = createNode("$['child']", 'child');
    parent.data.complexFields.push({ key: 'child', type: 'object', size: 0, nodeId: child.id });
    const edge: IGraphEdge = {
      id: 'root-child',
      label: 'child',
      source: parent.id,
      target: child.id,
      data: { parent, child },
    };

    const graph = createElkGraph([parent, child], [edge], 'LR');

    expect(graph.layoutOptions?.['elk.edgeRouting']).toBe('ORTHOGONAL');
    expect(graph.edges?.[0]?.sources).toEqual(['$-source-child']);
    expect(graph.edges?.[0]?.targets).toEqual(["$['child']-target"]);
  });

  it('should map ELK node positions and edge bend points', () => {
    const node = createNode('$', 'root');
    const graph: ElkNode = {
      id: 'root',
      width: 500,
      height: 300,
      children: [{ id: '$', x: 20, y: 30, width: 280, height: 50 }],
      edges: [
        {
          id: 'edge',
          sources: ['$'],
          targets: ['$'],
          sections: [
            {
              id: 'section',
              startPoint: { x: 1, y: 2 },
              bendPoints: [{ x: 3, y: 4 }],
              endPoint: { x: 5, y: 6 },
            },
          ],
        },
      ],
    };

    const result = mapElkResult([node], graph);

    expect(result.nodes[0]?.position).toEqual({ x: 20, y: 30 });
    expect(result.edges[0]?.points).toEqual([
      { x: 1, y: 2 },
      { x: 3, y: 4 },
      { x: 5, y: 6 },
    ]);
    expect(result.bounds).toEqual({ width: 500, height: 300 });
  });
});
