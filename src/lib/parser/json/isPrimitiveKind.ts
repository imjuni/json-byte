import type { TComplexTypeString } from '#/contracts/json/TComplexTypeString';
import type { TPrimitiveTypeString } from '#/contracts/json/TPrimitiveTypeString';

export function isPrimitiveKind(kind: TComplexTypeString | TPrimitiveTypeString): kind is TPrimitiveTypeString {
  switch (kind) {
    case 'string':
    case 'number':
    case 'boolean':
    case 'null':
      return true;
    default:
      return false;
  }
}
