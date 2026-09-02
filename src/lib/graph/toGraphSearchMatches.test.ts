import { describe, expect, it } from 'vitest';

import { toGraphSearchMatches } from '#/lib/graph/toGraphSearchMatches';
import { createFuse } from '#/stores/fuseStore';

import type { IGraphNode } from '#/lib/graph/interfaces/IGraphNode';

const node: IGraphNode = {
  id: '$',
  draggable: false,
  position: { x: 0, y: 0 },
  data: {
    label: 'root',
    stringify: '{}',
    origin: {},
    nodeType: 'object',
    primitiveFields: [
      { key: 'username', value: 'john', type: 'string' },
      { key: 'age', value: 42, type: 'number' },
    ],
    complexFields: [{ key: 'children', type: 'array', size: 3, nodeId: "$['children']" }],
    _children: [],
    _parent: undefined,
  },
};

describe('toGraphSearchMatches', () => {
  it('preserves primitive key match references from Fuse', () => {
    const matches = toGraphSearchMatches(createFuse([node]).search('username'));
    expect(matches.$?.primitiveFields[0]).toEqual({ key: true, value: false });
  });

  it('preserves primitive value match references from Fuse', () => {
    const matches = toGraphSearchMatches(createFuse([node]).search('john'));
    expect(matches.$?.primitiveFields[0]).toEqual({ key: false, value: true });
  });

  it('preserves numeric value match references from Fuse', () => {
    const matches = toGraphSearchMatches(createFuse([node]).search('42'));
    expect(matches.$?.primitiveFields[1]).toEqual({ key: false, value: true });
  });

  it('preserves complex key match references from Fuse', () => {
    const matches = toGraphSearchMatches(createFuse([node]).search('children'));
    expect(matches.$?.complexFields[0]).toEqual({ key: true, value: false });
  });

  it('preserves complex size match references from Fuse', () => {
    const matches = toGraphSearchMatches(createFuse([node]).search('3'));
    expect(matches.$?.complexFields[0]).toEqual({ key: false, value: true });
  });
});
