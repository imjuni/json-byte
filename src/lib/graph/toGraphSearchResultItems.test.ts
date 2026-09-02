import { describe, expect, it } from 'vitest';

import { createGraphPathIndex } from '#/lib/graph/graphPathIndex';
import { toGraphSearchResultItems } from '#/lib/graph/toGraphSearchResultItems';
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
    primitiveFields: [{ key: 'username', value: 'john', type: 'string' }],
    complexFields: [],
    _children: [],
    _parent: undefined,
  },
};

const location = {
  kind: 'string' as const,
  loc: { start: { line: 1, column: 1 }, end: { line: 1, column: 1 }, offset: 0, length: 1 },
};

describe('toGraphSearchResultItems', () => {
  it('returns the matched primitive field JSONPath', () => {
    const index = createGraphPathIndex([node], {
      $: { ...location, kind: 'object' },
      "$['username']": location,
    });
    const items = toGraphSearchResultItems(createFuse([node]).search('username'), index);
    expect(items.map((item) => item.path)).toEqual(["$['username']"]);
    expect(items.map((item) => item.title)).toEqual(['username']);
  });
});
