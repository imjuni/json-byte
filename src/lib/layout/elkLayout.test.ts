import ELK from 'elkjs/lib/elk.bundled.js';
import { describe, expect, it } from 'vitest';

import {
  createElkGraph,
  EDGE_LANE_SEPARATION_NODE_CAP,
  getSourcePortId,
  getTargetPortId,
  mapElkResult,
  shouldSeparateEdgeLanes,
} from '#/lib/layout/elkLayout';

import type { ElkNode } from 'elkjs/lib/elk.bundled.js';

import type { IGraphEdge } from '#/lib/graph/interfaces/IGraphEdge';
import type { IGraphNode } from '#/lib/graph/interfaces/IGraphNode';

const createNode = (id: string, label: string): IGraphNode => ({
  id,
  draggable: false,
  position: { x: 0, y: 0 },
  data: {
    label,
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
  it('should separate edge lanes only within the node cap', () => {
    expect(shouldSeparateEdgeLanes(EDGE_LANE_SEPARATION_NODE_CAP)).toBe(true);
    expect(shouldSeparateEdgeLanes(EDGE_LANE_SEPARATION_NODE_CAP + 1)).toBe(false);
  });

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
    expect(graph.children?.[0]?.layoutOptions?.['elk.portConstraints']).toBe('FIXED_POS');
    expect(graph.edges?.[0]?.sources).toEqual(['$-source-child']);
    expect(graph.edges?.[0]?.targets).toEqual(["$['child']-target"]);
  });

  it('should map ELK node positions and edge bend points', () => {
    const node = createNode('$', 'root');
    const graph: ElkNode = {
      id: 'root',
      width: 500,
      height: 300,
      children: [
        {
          id: '$',
          x: 20,
          y: 30,
          width: 280,
          height: 50,
          ports: [
            {
              id: '$-source-child',
              x: 272,
              y: 24,
              width: 8,
              height: 8,
              layoutOptions: { 'elk.port.side': 'EAST' },
            },
          ],
        },
      ],
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
            {
              id: 'section-2',
              startPoint: { x: 7, y: 8 },
              endPoint: { x: 9, y: 10 },
            },
          ],
        },
      ],
    };

    const result = mapElkResult([node], graph);

    expect(result.nodes[0]?.position).toEqual({ x: 20, y: 30 });
    expect(result.edges[0]?.sections).toEqual([
      [
        { x: 1, y: 2 },
        { x: 3, y: 4 },
        { x: 5, y: 6 },
      ],
      [
        { x: 7, y: 8 },
        { x: 9, y: 10 },
      ],
    ]);
    expect(result.ports).toEqual([{ id: '$-source-child', nodeId: '$', position: { x: 280, y: 28 } }]);
    expect(result.bounds).toEqual({ width: 500, height: 300 });
  });

  it.each(['LR', 'TB'] as const)('should align %s edge endpoints with port anchors', async (direction) => {
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
    const graph = await new ELK().layout(createElkGraph([parent, child], [edge], direction));
    const result = mapElkResult([parent, child], graph);
    const parentNode = result.nodes.find((node) => node.id === parent.id);
    const childNode = result.nodes.find((node) => node.id === child.id);
    const sourcePort = result.ports.find((port) => port.id === getSourcePortId(parent.id, 'child'));
    const targetPort = result.ports.find((port) => port.id === getTargetPortId(child.id));
    const section = result.edges[0]?.sections[0];

    expect(section?.[0]).toEqual({
      x: (parentNode?.position.x ?? 0) + (sourcePort?.position.x ?? 0),
      y: (parentNode?.position.y ?? 0) + (sourcePort?.position.y ?? 0),
    });
    expect(section?.at(-1)).toEqual({
      x: (childNode?.position.x ?? 0) + (targetPort?.position.x ?? 0),
      y: (childNode?.position.y ?? 0) + (targetPort?.position.y ?? 0),
    });
    if (direction === 'LR') {
      expect(sourcePort?.position.x).toBe(parentNode?.width);
      expect(targetPort?.position.x).toBe(0);
    } else {
      expect(sourcePort?.position.y).toBe(parentNode?.height);
      expect(targetPort?.position.y).toBe(0);
    }
  });
});
