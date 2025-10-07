import type { JsonValue } from 'type-fest';

import type { TNodeType } from '#/lib/xyflow/interfaces/IXyFlowNode';

export function getNodeType(value: JsonValue): TNodeType {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'object') return 'object';
  if (typeof value === 'string') return 'string';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  return 'null';
}
