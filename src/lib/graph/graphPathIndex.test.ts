import { describe, expect, it } from 'vitest';

import {
  createGraphPathIndex,
  parseJqPath,
  parseJsonPath,
  resolveGraphPath,
  segmentsToJsonPath,
} from '#/lib/graph/graphPathIndex';

import type { IGraphNode } from '#/lib/graph/interfaces/IGraphNode';
import type { IPathLoCIndexMap } from '#/lib/parser/interfaces/IPathLoCIndexMap';

const rootNode: IGraphNode = {
  id: '$',
  draggable: false,
  position: { x: 0, y: 0 },
  data: {
    label: 'root',
    stringify: '{}',
    origin: {},
    nodeType: 'object',
    primitiveFields: [{ key: 'display-name', value: 'JSON Byte', type: 'string' }],
    complexFields: [{ key: 'items', type: 'array', size: 2, nodeId: "$['items']" }],
    _children: [],
    _parent: undefined,
  },
};

const itemsNode: IGraphNode = {
  id: "$['items']",
  draggable: false,
  position: { x: 0, y: 0 },
  data: {
    label: 'items',
    stringify: '[]',
    origin: ['first', 'second'],
    nodeType: 'array',
    primitiveFields: [
      { key: 'items[0]', value: 'first', type: 'string' },
      { key: 'items[1]', value: 'second', type: 'string' },
    ],
    complexFields: [],
    _children: [],
    _parent: rootNode,
  },
};

const location = {
  kind: 'string' as const,
  loc: { start: { line: 1, column: 1 }, end: { line: 1, column: 1 }, offset: 0, length: 1 },
};

const locMap: IPathLoCIndexMap = {
  $: { ...location, kind: 'object' },
  "$['display-name']": location,
  "$['items']": { ...location, kind: 'array' },
  "$['items'][0]": location,
  "$['items'][1]": location,
};

describe('graphPathIndex', () => {
  it('normalizes JSONPath dot and bracket notation', () => {
    expect(segmentsToJsonPath(parseJsonPath('$.items[0]') ?? [])).toBe("$['items'][0]");
    expect(segmentsToJsonPath(parseJsonPath('$["display-name"]') ?? [])).toBe("$['display-name']");
  });

  it('normalizes jq identifier and bracket notation', () => {
    expect(segmentsToJsonPath(parseJqPath('.items[1]') ?? [])).toBe("$['items'][1]");
    expect(segmentsToJsonPath(parseJqPath('.["display-name"]') ?? [])).toBe("$['display-name']");
  });

  it('resolves JSONPath before jq paths', () => {
    const index = createGraphPathIndex([rootNode, itemsNode], locMap);
    expect(resolveGraphPath(index, '$.items')?.node.id).toBe("$['items']");
    expect(resolveGraphPath(index, '.items')?.node.id).toBe("$['items']");
  });

  it('focuses a primitive field through its parent node', () => {
    const index = createGraphPathIndex([rootNode, itemsNode], locMap);
    const target = resolveGraphPath(index, '.items[1]');
    expect(target?.node.id).toBe("$['items']");
    expect(target?.match.primitiveFields[1]).toEqual({ key: true, value: true });
  });
});
