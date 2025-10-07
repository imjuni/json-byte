/* eslint-disable no-restricted-syntax */
import { CE_XYFLOW_NODE_TYPE } from '#/lib/xyflow/const-enum/CE_XYFLOW_NODE_TYPE';
import { layoutNodes } from '#/lib/xyflow/layoutNodes';

import type { JsonValue } from 'type-fest';

import type { IXyFlowEdge } from '#/lib/xyflow/interfaces/IXyFlowEdge';
import type { IComplexField, IPrimitiveField, IXyFlowNode, TNodeType } from '#/lib/xyflow/interfaces/IXyFlowNode';
import type { TLayoutDirection } from '#/lib/xyflow/layoutNodes';

interface IBuildTask {
  key: string;
  value: JsonValue;
  parentPath: string;
  parent: IXyFlowNode;
  node: IXyFlowNode;
  depth: number;
}

function isPrimitive(value: JsonValue): boolean {
  return value === null || typeof value !== 'object';
}

function getPrimitiveType(value: JsonValue): 'string' | 'number' | 'boolean' | 'null' {
  if (value === null) return 'null';
  if (typeof value === 'string') return 'string';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  return 'null';
}

function getComplexSize(value: JsonValue): number {
  if (Array.isArray(value)) return value.length;
  if (typeof value === 'object' && value !== null) return Object.keys(value).length;
  return 0;
}

function buildNodes(
  document: JsonValue,
  direction: TLayoutDirection = 'TB',
): { nodes: IXyFlowNode[]; edges: IXyFlowEdge[] } {
  if (typeof document !== 'object' || document === null) {
    return { nodes: [], edges: [] };
  }

  const MAX_ITERATIONS = 1000000;
  const nodes: IXyFlowNode[] = [];
  const edges: IXyFlowEdge[] = [];
  const stack: IBuildTask[] = [];

  // Determine root type
  const rootType: TNodeType = Array.isArray(document) ? 'array' : 'object';
  const rootEntries = Array.isArray(document)
    ? document.map((item, index) => ({ key: String(index), value: item }))
    : Object.entries(document).map(([key, value]) => ({ key, value }));

  // Create root node
  const rootNode: IXyFlowNode = {
    id: '$',
    draggable: false,
    position: { x: 0, y: 0 },
    type: CE_XYFLOW_NODE_TYPE.PLAIN_OBJECT_NODE,
    data: {
      label: 'root',
      origin: document,
      nodeType: rootType,
      primitiveFields: [],
      complexFields: [],
      _children: [],
      _parent: undefined,
    },
  };

  // Separate primitive and complex fields for root
  for (const { key, value } of rootEntries) {
    if (isPrimitive(value)) {
      rootNode.data.primitiveFields.push({
        key,
        value,
        type: getPrimitiveType(value),
      });
    } else {
      const isArrayIndex = /^\d+$/.test(key);
      const childPath = isArrayIndex ? `$[${key}]` : `$.${key}`;
      const childType: TNodeType = Array.isArray(value) ? 'array' : 'object';

      rootNode.data.complexFields.push({
        key,
        type: childType,
        size: getComplexSize(value),
        nodeId: childPath,
      });

      // Push to stack for processing
      stack.push({
        key,
        value,
        parentPath: '$',
        parent: rootNode,
        node: rootNode, // placeholder, will create actual node in loop
        depth: 1,
      });
    }
  }

  nodes.push(rootNode);

  // Process stack iteratively
  let iterations = 0;
  // eslint-disable-next-line no-plusplus
  for (; stack.length > 0 && iterations < MAX_ITERATIONS; iterations++) {
    const task = stack.pop();
    if (!task) break;

    const { key, value, parent, depth } = task;

    // Create node for this complex value
    const isArrayIndex = /^\d+$/.test(key);
    const currentPath = isArrayIndex ? `${parent.id}[${key}]` : `${parent.id}.${key}`;
    const nodeType: TNodeType = Array.isArray(value) ? 'array' : 'object';

    const childEntries = Array.isArray(value)
      ? value.map((item, index) => ({ key: String(index), value: item }))
      : Object.entries(value as Record<string, JsonValue>).map(([k, v]) => ({ key: k, value: v }));

    const primitiveFields: IPrimitiveField[] = [];
    const complexFields: IComplexField[] = [];

    // Separate primitive and complex fields
    for (const { key: fieldKey, value: fieldValue } of childEntries) {
      if (isPrimitive(fieldValue)) {
        primitiveFields.push({
          key: fieldKey,
          value: fieldValue,
          type: getPrimitiveType(fieldValue),
        });
      } else {
        const isFieldArrayIndex = /^\d+$/.test(fieldKey);
        const fieldPath = isFieldArrayIndex ? `${currentPath}[${fieldKey}]` : `${currentPath}.${fieldKey}`;
        const fieldType: TNodeType = Array.isArray(fieldValue) ? 'array' : 'object';

        complexFields.push({
          key: fieldKey,
          type: fieldType,
          size: getComplexSize(fieldValue),
          nodeId: fieldPath,
        });
      }
    }

    const currentNode: IXyFlowNode = {
      id: currentPath,
      draggable: false,
      position: { x: 0, y: 0 },
      type: CE_XYFLOW_NODE_TYPE.PLAIN_OBJECT_NODE,
      data: {
        label: key,
        origin: value,
        nodeType,
        primitiveFields,
        complexFields,
        _children: [],
        _parent: parent,
      },
    };

    // eslint-disable-next-line no-underscore-dangle
    parent.data._children.push(currentNode);
    nodes.push(currentNode);

    // Create edge from parent to current node
    // For array children, format label as "parentLabel[index]" for better readability
    const edgeLabel = isArrayIndex ? `${parent.data.label}[${key}]` : key;

    const edge: IXyFlowEdge = {
      id: `${parent.id}-${currentNode.id}`,
      label: edgeLabel,
      source: parent.id,
      target: currentNode.id,
      data: {
        parent,
        child: currentNode,
      },
    };
    edges.push(edge);

    // Push complex children to stack
    for (const { key: complexKey, value: complexValue } of childEntries) {
      if (!isPrimitive(complexValue)) {
        stack.push({
          key: complexKey,
          value: complexValue,
          parentPath: currentPath,
          parent: currentNode,
          node: currentNode,
          depth: depth + 1,
        });
      }
    }
  }

  if (iterations >= MAX_ITERATIONS) {
    // eslint-disable-next-line no-console
    console.warn('Maximum iteration limit reached. The data structure may be too deep or contain cycles.');
  }

  // Apply dagre layout
  const layoutedNodes = layoutNodes(nodes, edges, direction);

  return { nodes: layoutedNodes, edges };
}

export function createXyFlowNodes(document: JsonValue, direction?: TLayoutDirection): IXyFlowNode[] {
  return buildNodes(document, direction).nodes;
}

export function createXyFlowNodesWithEdges(
  document: JsonValue,
  direction?: TLayoutDirection,
): { nodes: IXyFlowNode[]; edges: IXyFlowEdge[] } {
  return buildNodes(document, direction);
}
