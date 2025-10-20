import { getComplexSize } from '#/lib/tools/getComplexSize';
import { getPrimitiveTypeString } from '#/lib/tools/getPrimitiveTypeString';
import { isPrimitive } from '#/lib/tools/isPrimitive';

import type { JsonValue } from 'type-fest';

import type { TComplexTypeString } from '#/contracts/json/TComplexTypeString';
import type { IComplexField } from '#/lib/graph/interfaces/IComplexField';
import type { IPrimitiveField } from '#/lib/graph/interfaces/IPrimitiveField';

interface IGetNodeField {
  entry: { key: string; value: JsonValue };
  currentPath: string;
}

export function getNodeField({ entry, currentPath }: IGetNodeField): {
  primitiveFields: IPrimitiveField[];
  complexFields: IComplexField[];
} {
  const primitiveFields: IPrimitiveField[] = [];
  const complexFields: IComplexField[] = [];

  // Separate primitive and complex fields
  const { key, value } = entry;
  if (isPrimitive(value)) {
    primitiveFields.push({
      key,
      value,
      type: getPrimitiveTypeString(value),
    });
  } else {
    const isFieldArrayIndex = /^\d+$/.test(key);
    const fieldPath = isFieldArrayIndex ? `${currentPath}[${key}]` : `${currentPath}.${key}`;
    const fieldType: TComplexTypeString = Array.isArray(value) ? 'array' : 'object';

    complexFields.push({
      key,
      type: fieldType,
      size: getComplexSize(value),
      nodeId: fieldPath,
    });
  }

  return {
    primitiveFields,
    complexFields,
  };
}
