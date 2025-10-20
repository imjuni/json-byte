import { getComplexSize } from '#/lib/tools/getComplexSize';
import { getPrimitiveTypeString } from '#/lib/tools/getPrimitiveTypeString';
import { isPrimitive } from '#/lib/tools/isPrimitive';

import type { JsonValue } from 'type-fest';

import type { TComplexTypeString } from '#/contracts/json/TComplexTypeString';
import type { IBuildTask } from '#/lib/graph/interfaces/IBuildTask';
import type { IComplexField } from '#/lib/graph/interfaces/IComplexField';
import type { IGraphNode } from '#/lib/graph/interfaces/IGraphNode';
import type { IPrimitiveField } from '#/lib/graph/interfaces/IPrimitiveField';

export function getNodeFieldsAndStack({
  entries,
  currentNode,
  currentPath,
  depth,
}: {
  entries: { key: string; value: JsonValue }[];
  currentNode: IGraphNode;
  currentPath: string;
  depth: number;
}): {
  primitiveFields: IPrimitiveField[];
  complexFields: IComplexField[];
  stack: IBuildTask[];
} {
  const primitiveFields: IPrimitiveField[] = [];
  const complexFields: IComplexField[] = [];
  const stack: IBuildTask[] = [];

  // Separate primitive and complex fields
  for (const { key: fieldKey, value: fieldValue } of entries) {
    if (isPrimitive(fieldValue)) {
      primitiveFields.push({
        key: fieldKey,
        value: fieldValue,
        type: getPrimitiveTypeString(fieldValue),
      });
    } else {
      const isFieldArrayIndex = /^\d+$/.test(fieldKey);
      const fieldPath = isFieldArrayIndex ? `${currentPath}[${fieldKey}]` : `${currentPath}.${fieldKey}`;
      const fieldType: TComplexTypeString = Array.isArray(fieldValue) ? 'array' : 'object';

      complexFields.push({
        key: fieldKey,
        type: fieldType,
        size: getComplexSize(fieldValue),
        nodeId: fieldPath,
      });

      // Push complex children to stack
      stack.push({
        key: fieldKey,
        value: fieldValue,
        parentPath: currentPath,
        parent: currentNode,
        node: currentNode, // placeholder, will create actual node in loop
        depth: depth + 1,
      });
    }
  }

  return {
    primitiveFields,
    complexFields,
    stack,
  };
}
