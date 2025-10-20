/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */

import { atOrThrow } from 'my-easy-fp';
import { isMap, isScalar, isSeq, LineCounter, parseDocument } from 'yaml';

import { childPath } from '#/lib/parser/yaml/childPath';
import { kindOfYamlNode } from '#/lib/parser/yaml/kindOfYamlNode';
import { toRange } from '#/lib/parser/yaml/toRange';
import { valueOffsets } from '#/lib/parser/yaml/valueOffsets';

import type { JsonValue } from 'type-fest';
import type { Node as YamlNode, Pair, YAMLMap, YAMLSeq, Scalar } from 'yaml';

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

export function buildNodeByYaml({ document, origin, config }: IBuildNodeByYamlParams): IPathLoCIndexMap {
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
    return { $: { kind: 'null', loc: toRange(lc, 0, 0) } };
  }

  const index: IPathLoCIndexMap = {};
  const taskStack: { node: YamlNode; path: string; key: string; value: JsonValue }[] = [
    { node: root, path: '$', key: 'root', value: document },
  ];

  for (let i = 0; taskStack.length > 0 && i < config.guard; i += 1) {
    const task = taskStack.pop();

    if (task?.node == null) {
      continue;
    }

    const { node, path } = task;

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
      entry.primitive = prim;
    }

    index[path] = entry;

    if (isMap(node)) {
      const map = node as YAMLMap<
        {
          range: Range;
          source: string;
          type: Scalar.Type;
          value?: YamlNode | null;
          toJSON?: () => string;
        },
        {
          range: Range;
          source: string;
          type: Scalar.Type;
          value?: YamlNode | null;
          toJSON?: () => string;
        }
      >;

      for (let j = map.items.length - 1; j >= 0; j -= 1) {
        const p = map.items[j];
        // const { key, value } = p;
        const { key, value } = p;

        if (value == null) {
          continue;
        }

        const keyStr = isScalar(key) ? `${key.value}` : (key.toJSON?.() ?? '');
        const child = childPath(path, keyStr);

        taskStack.push({
          node: value as unknown as YamlNode,
          path: child,
          key: child,
          value: value.value as JsonValue,
        });
      }
    } else if (isSeq(node)) {
      const seq = node;
      for (let j = seq.items.length - 1; j >= 0; j -= 1) {
        const childNode = seq.items[j] as YamlNode | undefined;

        if (childNode) {
          taskStack.push({
            node: childNode,
            path: childPath(path, j),
            key: '',
            value: {},
          });
        }
      }
    }
  }

  return index;
}
