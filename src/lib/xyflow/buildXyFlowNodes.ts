/* eslint-disable no-restricted-syntax */

import { getOrDefault } from '#/lib/getOrDefault';
import { CE_XYFLOW_NODE_TYPE } from '#/lib/xyflow/const-enum/CE_XYFLOW_NODE_TYPE';
import { getNodeFieldsAndStack } from '#/lib/xyflow/getNodeFieldsAndStack';
import { layoutNodes } from '#/lib/xyflow/layoutNodes';

import type { JsonValue } from 'type-fest';

import type { TComplexTypeString } from '#/contracts/json/TComplexTypeString';
import type { IBuildTask } from '#/lib/xyflow/interfaces/IBuildTask';
import type { IComplexField } from '#/lib/xyflow/interfaces/IComplexField';
import type { IPrimitiveField } from '#/lib/xyflow/interfaces/IPrimitiveField';
import type { IXyFlowEdge } from '#/lib/xyflow/interfaces/IXyFlowEdge';
import type { IXyFlowNode } from '#/lib/xyflow/interfaces/IXyFlowNode';
import type { TLayoutDirection } from '#/lib/xyflow/layoutNodes';

const MAX_ITERATIONS = 1000000;

export function buildXyFlowNodes(
  document: JsonValue,
  direction: TLayoutDirection = 'TB',
  _maxIterations?: number,
): { nodes: IXyFlowNode[]; edges: IXyFlowEdge[] } {
  if (typeof document !== 'object' || document === null) {
    return { nodes: [], edges: [] };
  }

  const maxIterations = getOrDefault(_maxIterations, MAX_ITERATIONS);
  const nodes: IXyFlowNode[] = [];
  const edges: IXyFlowEdge[] = [];
  const stack: IBuildTask[] = [];

  // Determine root type
  const rootType: TComplexTypeString = Array.isArray(document) ? 'array' : 'object';
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

  const {
    primitiveFields: currentPrimitiveFields,
    complexFields: currentComplexFields,
    stack: currentStack,
  } = getNodeFieldsAndStack({
    entries: rootEntries,
    currentPath: '$',
    currentNode: rootNode,
    depth: 0,
  });

  rootNode.data.primitiveFields.push(...currentPrimitiveFields);
  rootNode.data.complexFields.push(...currentComplexFields);
  stack.push(...currentStack);

  nodes.push(rootNode);

  // Process queue iteratively (FIFO to maintain correct order)
  let iterations = 0;

  for (; stack.length > 0 && iterations < maxIterations; iterations += 1) {
    // The for loop only executes when stack.length > 0, so shift() result cannot be undefined
    // Use shift() instead of pop() for FIFO order
    const task = stack.shift() as IBuildTask;

    const { key, value, parent, depth } = task;

    // Create node for this complex value
    const isArrayIndex = /^\d+$/.test(key);
    const currentPath = isArrayIndex ? `${parent.id}[${key}]` : `${parent.id}.${key}`;
    const label = isArrayIndex ? `${parent.data.label}[${key}]` : key;
    const nodeType: TComplexTypeString = Array.isArray(value) ? 'array' : 'object';

    const childEntries = Array.isArray(value)
      ? value.map((item, index) => ({ key: String(index), value: item }))
      : Object.entries(value as Record<string, JsonValue>).map(([k, v]) => ({ key: k, value: v }));

    const primitiveFields: IPrimitiveField[] = [];
    const complexFields: IComplexField[] = [];

    const currentNode: IXyFlowNode = {
      id: currentPath,
      draggable: false,
      position: { x: 0, y: 0 },
      type: CE_XYFLOW_NODE_TYPE.PLAIN_OBJECT_NODE,
      data: {
        label,
        origin: value,
        nodeType,
        primitiveFields,
        complexFields,
        _children: [],
        _parent: parent,
      },
    };

    // Separate primitive and complex fields
    const {
      primitiveFields: currentChildPrimitiveFields,
      complexFields: currentChildComplexFields,
      stack: currentChildStack,
    } = getNodeFieldsAndStack({
      entries: childEntries,
      currentPath,
      currentNode,
      depth,
    });

    currentNode.data.primitiveFields.push(...currentChildPrimitiveFields);
    currentNode.data.complexFields.push(...currentChildComplexFields);
    stack.push(...currentChildStack);

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
      sourceHandle: `source-${key}`, // Connect from specific complex field handle
      target: currentNode.id,
      targetHandle: 'target-top', // Connect to the top target handle
      data: {
        parent,
        child: currentNode,
      },
    };

    edges.push(edge);
  }

  if (iterations >= MAX_ITERATIONS) {
    // eslint-disable-next-line no-console
    console.warn('Maximum iteration limit reached. The data structure may be too deep or contain cycles.');
  }

  // Apply dagre layout
  const layoutedNodes = layoutNodes(nodes, edges, direction);

  return { nodes: layoutedNodes, edges };
}
