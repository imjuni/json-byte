import { isMap, isScalar, isSeq } from 'yaml';

import type { JsonValue } from 'type-fest';
import type { Node as YamlNode } from 'yaml';

import type { TComplexTypeString } from '#/contracts/json/TComplexTypeString';
import type { TPrimitiveTypeString } from '#/contracts/json/TPrimitiveTypeString';

export function kindOfYamlNode(node: YamlNode): TComplexTypeString | TPrimitiveTypeString {
  if (isMap(node)) return 'object';
  if (isSeq(node)) return 'array';
  if (isScalar(node)) {
    const scalar = node as unknown as { toJSON?: () => JsonValue; value: JsonValue };
    const value = scalar.toJSON?.() ?? scalar.value;
    if (value === null) return 'null';
    switch (typeof value) {
      case 'string':
        return 'string';
      case 'number':
        return 'number';
      case 'boolean':
        return 'boolean';
      default:
        return 'string'; // Treat tags and other scalar values as strings.
    }
  }
  return 'null';
}
