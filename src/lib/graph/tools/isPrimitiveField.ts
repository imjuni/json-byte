import type { IComplexField } from '#/lib/graph/interfaces/IComplexField';
import type { IPrimitiveField } from '#/lib/graph/interfaces/IPrimitiveField';

export function isPrimitiveField(field: IPrimitiveField | IComplexField): field is IPrimitiveField {
  return field.type === 'boolean' || field.type === 'string' || field.type === 'null' || field.type === 'number';
}
