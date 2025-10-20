import { describe, expect, it } from 'vitest';

import { buildGraphNodes } from '#/lib/graph/buildGraphNodes';

import type { JsonValue } from 'type-fest';

describe('buildGraphNodes', () => {
  it('should return empty nodes and edges when pass null', () => {
    const result = buildGraphNodes(null);

    expect(result).toEqual({ nodes: [], edges: [] });
  });

  it('should return empty nodes and edges when pass primitive value', () => {
    const result = buildGraphNodes('string' as JsonValue);

    expect(result).toEqual({ nodes: [], edges: [] });
  });

  it('should create root node and children nodes when pass object', () => {
    const document: JsonValue = {
      firstName: 'John',
      age: 26,
      address: {
        city: 'Nara',
      },
    };

    const result = buildGraphNodes(document);

    expect(result.nodes).toHaveLength(2); // root + address
    expect(result.edges).toHaveLength(1);
    expect(result.nodes[0].id).toBe('$');
    expect(result.nodes[0].data.label).toBe('root');
    expect(result.nodes[0].data.nodeType).toBe('object');
    expect(result.nodes[1].id).toBe('$.address');
    expect(result.edges[0].label).toBe('address');
  });

  it('should create root node with array type when pass array', () => {
    const document: JsonValue = [{ name: 'item1' }, { name: 'item2' }];

    const result = buildGraphNodes(document);

    expect(result.nodes[0].data.nodeType).toBe('array');
    expect(result.nodes).toHaveLength(3); // root + 2 items
    expect(result.edges).toHaveLength(2);
    expect(result.nodes[1].id).toBe('$[0]');
    expect(result.nodes[2].id).toBe('$[1]');
  });

  it('should handle nested arrays when pass array containing arrays', () => {
    const document: JsonValue = {
      phoneNumbers: [
        {
          type: 'iPhone',
          number: '0123-4567-8888',
        },
        {
          type: 'home',
          number: '0123-4567-8910',
        },
      ],
    };

    const result = buildGraphNodes(document);

    expect(result.nodes).toHaveLength(4); // root + phoneNumbers + 2 items
    expect(result.edges).toHaveLength(3);
    expect(result.nodes[1].id).toBe('$.phoneNumbers');
    expect(result.nodes[2].id).toBe('$.phoneNumbers[0]');
    expect(result.nodes[3].id).toBe('$.phoneNumbers[1]');
    expect(result.edges[1].label).toBe('phoneNumbers[0]');
    expect(result.edges[2].label).toBe('phoneNumbers[1]');
  });

  it('should separate primitive and complex fields when pass mixed object', () => {
    const document: JsonValue = {
      name: 'John',
      age: 26,
      address: {
        city: 'Nara',
      },
    };

    const result = buildGraphNodes(document);

    expect(result.nodes[0].data.primitiveFields).toHaveLength(2); // name, age
    expect(result.nodes[0].data.complexFields).toHaveLength(1); // address
    expect(result.nodes[0].data.primitiveFields[0].key).toBe('name');
    expect(result.nodes[0].data.primitiveFields[1].key).toBe('age');
    expect(result.nodes[0].data.complexFields[0].key).toBe('address');
  });

  it('should apply layout direction when pass TB direction', () => {
    const document: JsonValue = {
      address: { city: 'Nara' },
    };

    const result = buildGraphNodes(document, 'TB');

    expect(result.nodes).toHaveLength(2);
    expect(result.nodes[0].position).toBeDefined();
    expect(result.nodes[1].position).toBeDefined();
  });

  it('should apply layout direction when pass LR direction', () => {
    const document: JsonValue = {
      address: { city: 'Nara' },
    };

    const result = buildGraphNodes(document, 'LR');

    expect(result.nodes).toHaveLength(2);
    expect(result.nodes[0].position).toBeDefined();
    expect(result.nodes[1].position).toBeDefined();
  });

  it('should create proper edges with sourceHandle and targetHandle when pass nested object', () => {
    const document: JsonValue = {
      user: {
        name: 'John',
      },
    };

    const result = buildGraphNodes(document);

    expect(result.edges).toHaveLength(1);
    expect(result.edges[0].source).toBe('$');
    expect(result.edges[0].target).toBe('$.user');
    expect(result.edges[0].sourceHandle).toBe('source-user');
    expect(result.edges[0].targetHandle).toBe('target-top');
    expect(result.edges[0].label).toBe('user');
  });
});
