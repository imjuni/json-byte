import type { JsonValue } from 'type-fest';

import type { TPrimitiveType } from '#/contracts/json/TPrimitiveType';

export function isPrimitive(value: JsonValue): value is TPrimitiveType {
  return value === null || typeof value !== 'object';
}
