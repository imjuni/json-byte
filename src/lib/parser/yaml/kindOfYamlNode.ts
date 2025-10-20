import { isMap, isScalar, isSeq } from 'yaml';

import type { Node as YamlNode } from 'yaml';

import type { TComplexTypeString } from '#/contracts/json/TComplexTypeString';
import type { TPrimitiveTypeString } from '#/contracts/json/TPrimitiveTypeString';

export function kindOfYamlNode(node: YamlNode): TComplexTypeString | TPrimitiveTypeString {
  if (isMap(node)) return 'object';
  if (isSeq(node)) return 'array';
  if (isScalar(node)) {
    const v = (node as any).toJSON ? (node as any).toJSON() : (node as any).value;
    if (v === null) return 'null';
    switch (typeof v) {
      case 'string':
        return 'string';
      case 'number':
        return 'number';
      case 'boolean':
        return 'boolean';
      default:
        return 'string'; // 기타는 문자열 취급(앵커/태그 등은 일반화)
    }
  }
  return 'null';
}
