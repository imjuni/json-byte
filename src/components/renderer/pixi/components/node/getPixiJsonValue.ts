import { isPrimitiveField } from '#/lib/graph/tools/isPrimitiveField';

import type { IComplexField } from '#/lib/graph/interfaces/IComplexField';
import type { IPrimitiveField } from '#/lib/graph/interfaces/IPrimitiveField';

export function getPixiJsonValue(field: IPrimitiveField | IComplexField): string {
  if (isPrimitiveField(field)) {
    return `${field.value}`.substring(0, 20);
  }

  if (field.type === 'array') {
    return `[ ${field.size} ]`;
  }

  return `{ ${field.size} }`;
}
