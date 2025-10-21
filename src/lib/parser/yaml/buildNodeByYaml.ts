/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-underscore-dangle */

import { JSONPath } from 'jsonpath-plus';
import { atOrThrow } from 'my-easy-fp';
import { isMap, isScalar, isSeq, LineCounter, parseDocument } from 'yaml';

import { createGraphNode } from '#/lib/graph/createGraphNode';
import { childPath } from '#/lib/parser/yaml/childPath';
import { kindOfYamlNode } from '#/lib/parser/yaml/kindOfYamlNode';
import { toRange } from '#/lib/parser/yaml/toRange';
import { valueOffsets } from '#/lib/parser/yaml/valueOffsets';

import type { JsonValue } from 'type-fest';
import type { Node as YamlNode } from 'yaml';

import type { IComplexField } from '#/lib/graph/interfaces/IComplexField';
import type { IGraphEdge } from '#/lib/graph/interfaces/IGraphEdge';
import type { IGraphNode } from '#/lib/graph/interfaces/IGraphNode';
import type { IPrimitiveField } from '#/lib/graph/interfaces/IPrimitiveField';
import type { ParserConfig } from '#/lib/parser/common/ParserConfig';
import type { IPathLoCEntry } from '#/lib/parser/interfaces/IPathLoCEntry';
import type { IPathLoCIndexMap } from '#/lib/parser/interfaces/IPathLoCIndexMap';
import type { IPrimitiveLoC } from '#/lib/parser/interfaces/IPrimitiveLoC';

interface IBuildNodeByYamlParams {
  /** 원본 JSON 문자열 */
  origin: string;

  /** JSON.parse 또는 jsonc.parse 를 통해 Object화 시킨 JSON 값 */
  document: JsonValue;

  /** 파싱 설정 */
  config: ParserConfig;
}

export function buildNodeByYaml({ document, origin, config }: IBuildNodeByYamlParams): {
  map: IPathLoCIndexMap;
  nodes: IGraphNode[];
  edges: IGraphEdge[];
} {
  const lc = new LineCounter();
  const doc = parseDocument(origin, { lineCounter: lc });

  if (doc.errors.length) {
    const e = doc.errors[0];
    const where =
      e.pos?.[0] != null
        ? (() => {
            const p = lc.linePos(atOrThrow(e.pos, 0));
            return ` at ${p.line}:${p.col}`;
          })()
        : '';

    throw new Error(`YAML parse error${where}: ${e.message}`);
  }

  const root = doc.contents as YamlNode | null;

  // if (root == null || root?.range == null) {
  if (root?.range == null) {
    return { map: { $: { kind: 'null', loc: toRange(lc, 0, 0) } }, nodes: [], edges: [] };
  }

  const map: IPathLoCIndexMap = {};
  const nodes: IGraphNode[] = [];
  const edges: IGraphEdge[] = [];
  const nodeMap = new Map<string, IGraphNode>();
  const taskStack: { node: YamlNode; path: string; key: string; value: JsonValue; parent?: IGraphNode }[] = [
    { node: root, path: '$', key: 'root', value: document },
  ];

  for (let i = 0; taskStack.length > 0 && i < config.guard; i += 1) {
    const task = taskStack.pop();

    if (task?.node == null) {
      continue;
    }

    const { node, path, parent } = task;

    const { start, end } = valueOffsets(node);
    const kind = kindOfYamlNode(node);
    const loc = toRange(lc, start, end);

    const entry: IPathLoCEntry = { kind, loc };

    if (kind !== 'object' && kind !== 'array' && isScalar(node)) {
      const prim: IPrimitiveLoC = { kind: kind as IPrimitiveLoC['kind'], valueLoc: loc };
      // 문자열일 때 따옴표 내부만 contentLoc으로 시도
      if (kind === 'string') {
        const open = origin[start];
        const close = origin[end - 1];
        // 큰따옴표/작은따옴표로 둘러싸인 인라인 스칼라만 내부 컨텐츠 범위 제공
        if ((open === '"' && close === '"') || (open === "'" && close === "'")) {
          prim.contentLoc = toRange(lc, start + 1, end - 1);
        } else {
          // 비인용/블록 스칼라는 토큰 전체를 content로 간주(취향에 따라 빼도 됨)
          prim.contentLoc = loc;
        }
      }
    }

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

    if (isMap(node)) {
      const currentGraphNode = nodeMap.get(path);
      const yamlMap = node;

      for (let j = yamlMap.items.length - 1; j >= 0; j -= 1) {
        const p = yamlMap.items[j];
        const { key, value } = p;

        if (value == null) {
          continue;
        }

        const keyStr = isScalar(key) ? String(key.value) : String((key as YamlNode)?.toJSON?.() ?? '');
        const valueKind = kindOfYamlNode(value as YamlNode);
        const childNodePath = childPath(path, keyStr);

        // valueKind가 primitive면 graphNode에 primitiveFields 에 추가
        // valueKind가 complex면 graphNode에 complexFields 에 추가
        if (valueKind !== 'object' && valueKind !== 'array') {
          const primitiveValue = isScalar(value) ? value.value : ((value as YamlNode)?.toJSON?.() ?? null);
          const field: IPrimitiveField = {
            key: keyStr,
            value: primitiveValue,
            type: valueKind,
          };

          if (currentGraphNode != null) {
            currentGraphNode.data.primitiveFields = [field, ...currentGraphNode.data.primitiveFields];
          }
        } else {
          const valueResult = JSONPath({ path: childNodePath, json: document });
          const jsonValue: JsonValue =
            Array.isArray(valueResult) && valueResult.length > 0 ? valueResult[0] : valueResult;

          let size = 0;
          if (isMap(value)) {
            size = value.items.length;
          } else if (isSeq(value)) {
            size = value.items.length;
          }

          const field: IComplexField = {
            key: keyStr,
            size,
            type: valueKind,
            nodeId: childNodePath,
          };

          if (currentGraphNode != null) {
            currentGraphNode.data.complexFields = [field, ...currentGraphNode.data.complexFields];
          }

          taskStack.push({
            node: value as YamlNode,
            path: childNodePath,
            key: keyStr,
            value: jsonValue,
            parent: currentGraphNode,
          });
        }
      }
    } else if (isSeq(node)) {
      const currentGraphNode = nodeMap.get(path);
      const seq = node;

      for (let j = seq.items.length - 1; j >= 0; j -= 1) {
        const valueNode = seq.items[j] as YamlNode | undefined;

        if (valueNode == null) {
          continue;
        }

        const valueKind = kindOfYamlNode(valueNode);
        const childNodePath = childPath(path, j);
        const childKey = `${task.key}[${j}]`;

        // array의 각 요소에 대한 필드 정보 추가
        if (valueKind !== 'object' && valueKind !== 'array') {
          const primitiveValue = isScalar(valueNode) ? valueNode.value : (valueNode?.toJSON?.() ?? null);
          const field: IPrimitiveField = {
            key: `${j}`,
            value: primitiveValue,
            type: valueKind,
          };

          if (currentGraphNode != null) {
            currentGraphNode.data.primitiveFields = [field, ...currentGraphNode.data.primitiveFields];
          }
        } else {
          const valueResult = JSONPath({ path: childNodePath, json: document });
          const jsonValue: JsonValue =
            Array.isArray(valueResult) && valueResult.length > 0 ? valueResult[0] : valueResult;

          let size = 0;
          if (isMap(valueNode)) {
            size = valueNode.items.length;
          } else if (isSeq(valueNode)) {
            size = valueNode.items.length;
          }

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
            path: childNodePath,
            key: childKey,
            value: jsonValue,
            parent: currentGraphNode,
          });
        }
      }
    }
  }

  return { map, nodes, edges };
}
