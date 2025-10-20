import type { Node as JsoncNode } from 'jsonc-parser';

import type { TComplexTypeString } from '#/contracts/json/TComplexTypeString';
import type { TPrimitiveTypeString } from '#/contracts/json/TPrimitiveTypeString';

// ---------- kind 판별 ----------
export function jsonKindOf(node: JsoncNode): TComplexTypeString | TPrimitiveTypeString {
  switch (node.type) {
    case 'object':
      return 'object';
    case 'array':
      return 'array';
    case 'string':
      return 'string';
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'null':
      return 'null';
    // 'property' 같은 메타 노드는 여기 오지 않게 트래버스에서 처리
    default:
      return 'null';
  }
}
