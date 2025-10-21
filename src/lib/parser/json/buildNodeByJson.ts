/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-underscore-dangle */
import { parseTree } from 'jsonc-parser';
import { JSONPath } from 'jsonpath-plus';
import { atOrThrow } from 'my-easy-fp';

import { createGraphNode } from '#/lib/graph/createGraphNode';
import { childPath } from '#/lib/parser/json/childPath';
import { isPrimitiveKind } from '#/lib/parser/json/isPrimitiveKind';
import { jsonKindOf } from '#/lib/parser/json/jsonKindOf';
import { toRange } from '#/lib/parser/json/toRange';

import type { Node as JsoncNode, ParseError } from 'jsonc-parser';
import type { JsonValue } from 'type-fest';

import type { IComplexField } from '#/lib/graph/interfaces/IComplexField';
import type { IGraphEdge } from '#/lib/graph/interfaces/IGraphEdge';
import type { IGraphNode } from '#/lib/graph/interfaces/IGraphNode';
import type { IPrimitiveField } from '#/lib/graph/interfaces/IPrimitiveField';
import type { ParserConfig } from '#/lib/parser/common/ParserConfig';
import type { IPathLoCEntry } from '#/lib/parser/interfaces/IPathLoCEntry';
import type { IPathLoCIndexMap } from '#/lib/parser/interfaces/IPathLoCIndexMap';

interface IBuildNodeByJsonParams {
  /** 원본 JSON 문자열 */
  origin: string;

  /** JSON.parse 또는 jsonc.parse 를 통해 Object화 시킨 JSON 값 */
  document: JsonValue;

  /** 파싱 설정 */
  config: ParserConfig;

  /** line 시작 지점 */
  lineStarts: number[];
}

export function buildNodeByJson({ origin, document, config, lineStarts }: IBuildNodeByJsonParams): {
  map: IPathLoCIndexMap;
  nodes: IGraphNode[];
  edges: IGraphEdge[];
} {
  const errors: ParseError[] = [];
  const tree = parseTree(origin, errors);

  if (tree == null || document instanceof Error) {
    throw new Error('Invalid JSON: parse failed');
  }

  if (errors.length) {
    throw new Error(`JSON parse errors: ${errors.map((e) => e.error).join(', ')}`);
  }

  const map: IPathLoCIndexMap = {};
  const nodes: IGraphNode[] = [];
  const edges: IGraphEdge[] = [];
  const nodeMap = new Map<string, IGraphNode>();
  const taskStack: { node: JsoncNode; key: string; value: JsonValue; path: string; parent?: IGraphNode }[] = [
    { node: tree, key: 'root', value: document, path: '$' },
  ];

  for (let i = 0; taskStack.length > 0 && i < config.guard; i += 1) {
    const task = taskStack.pop();

    if (task?.node == null) {
      continue;
    }

    const { node, path, parent } = task;

    const kind = jsonKindOf(node);
    const loc = toRange(node.offset, node.length, lineStarts, config);
    const entry: IPathLoCEntry = { kind, loc };

    map[path] = entry;

    // Create graphNode for complex types (object or array)
    if (kind === 'object' || kind === 'array') {
      const graphNode = createGraphNode({
        id: path,
        label: task.key,
        type: kind,
        value: task.value,
      });

      // Set parent relationship
      if (parent != null) {
        graphNode.data._parent = parent;
        parent.data._children.push(graphNode);

        // Create edge from parent to current node
        const edge: IGraphEdge = {
          id: `${parent.id}-${graphNode.id}`,
          label: task.key,
          source: parent.id,
          sourceHandle: `source-${task.key}`,
          target: graphNode.id,
          targetHandle: 'target-top',
          data: {
            parent,
            child: graphNode,
          },
        };

        edges.push(edge);
      }

      nodes.push(graphNode);
      nodeMap.set(path, graphNode);
    }

    // 자식 순회
    // object 일 때, jsonc-parser는 object의 각 필드를 property로 구분한다.
    // property는 2개의 children으로 구성된다.
    // 0 인덱스는 property의 key, 1 인덱스는 property의 value 이다.
    // 예를들면 { name: 'ironman' } 이라면, 0번 index는 name, 1번 인덱스는 'ironman' 이다
    if (node.type === 'object' && node.children != null && node.children.length > 0) {
      const currentGraphNode = nodeMap.get(path);

      for (let j = node.children.length - 1; j >= 0; j -= 1) {
        const property = node.children[j];

        const keyNode = atOrThrow(property.children, 0);
        const valueNode = atOrThrow(property.children, 1);
        const valueKind = jsonKindOf(valueNode);

        // valueKind가 primitive면 graphNode에 primitiveFields 에 추가
        // valueKind가 complex면 graphNode에 complexFields 에 추가

        if (isPrimitiveKind(valueKind)) {
          const propertyLoc = toRange(property.offset, property.length, lineStarts, config);
          const childNodePath = childPath(path, `${keyNode.value}`);

          map[childNodePath] = { kind: valueKind, loc: propertyLoc };

          const field: IPrimitiveField = {
            key: keyNode.value,
            value: valueNode.value,
            type: valueKind,
          };

          if (currentGraphNode != null) {
            currentGraphNode.data.primitiveFields = [field, ...currentGraphNode.data.primitiveFields];
          }
        } else {
          const childNodePath = childPath(path, `${keyNode.value}`);
          const valueResult = JSONPath({ path: childNodePath, json: document });
          const value: JsonValue = Array.isArray(valueResult) && valueResult.length > 0 ? valueResult[0] : valueResult;
          const size = valueNode.children?.length ?? 0;

          const field: IComplexField = {
            key: keyNode.value,
            size,
            type: valueKind,
            nodeId: childNodePath,
          };

          if (currentGraphNode != null) {
            currentGraphNode.data.complexFields = [field, ...currentGraphNode.data.complexFields];
          }

          taskStack.push({
            node: valueNode,
            key: keyNode.value,
            value,
            path: childNodePath,
            parent: currentGraphNode,
          });
        }
      }
    } else if (node.type === 'array' && node.children != null && node.children.length > 0) {
      const currentGraphNode = nodeMap.get(path);

      for (let j = node.children.length - 1; j >= 0; j -= 1) {
        const valueNode = node.children[j];
        const valueKind = jsonKindOf(valueNode);
        const childNodePath = childPath(path, j);
        const childKey = `${task.key}[${j}]`;

        // array의 각 요소에 대한 필드 정보 추가
        if (isPrimitiveKind(valueKind)) {
          const propertyLoc = toRange(valueNode.offset, valueNode.length, lineStarts, config);

          map[childNodePath] = { kind: valueKind, loc: propertyLoc };

          const field: IPrimitiveField = {
            key: `${j}`,
            value: valueNode.value,
            type: valueKind,
          };

          if (currentGraphNode != null) {
            currentGraphNode.data.primitiveFields = [field, ...currentGraphNode.data.primitiveFields];
          }
        } else {
          const valueResult = JSONPath({ path: childNodePath, json: document });
          const value: JsonValue = Array.isArray(valueResult) && valueResult.length > 0 ? valueResult[0] : valueResult;
          const size = valueNode.children?.length ?? 0;

          const field: IComplexField = {
            key: childKey,
            size,
            type: valueKind,
            nodeId: childNodePath,
          };

          if (currentGraphNode != null) {
            currentGraphNode.data.complexFields = [field, ...currentGraphNode.data.complexFields];
          }

          taskStack.push({
            node: valueNode,
            key: childKey,
            value,
            path: childNodePath,
            parent: currentGraphNode,
          });
        }
      }
    }
  }

  return { map, nodes, edges };
}
