import type { JsonValue } from 'type-fest';

import type { TPrimitiveTypeString } from '#/contracts/json/TPrimitiveTypeString';

/** Primitive Type 인 경우 문자열을 반환합니다 */
export function getPrimitiveTypeString(value: JsonValue): TPrimitiveTypeString {
  if (value === null) return 'null';

  switch (typeof value) {
    case 'string':
      return 'string';

    case 'number':
      return 'number';

    case 'boolean':
      return 'boolean';

    default:
      return 'null';
  }
}
