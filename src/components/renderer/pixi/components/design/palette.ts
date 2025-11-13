import type { TComplexTypeString } from '#/contracts/json/TComplexTypeString';
import type { TPrimitiveTypeString } from '#/contracts/json/TPrimitiveTypeString';

export const TypeColor: Record<TComplexTypeString | TPrimitiveTypeString, string> = {
  string: '#2196F3',
  number: '#9C27B0',
  boolean: '#4CAF50',
  null: '#9C27B0',
  object: '#FF9800',
  array: '#F44336',
};

export const FontColor: Record<'key' | 'label', string> = {
  key: '#CCCCCC',
  label: '#FFFFFF',
};

export const NodeColor: Record<'background' | 'stroke', string> = {
  background: '#2A2A2A',
  stroke: '#444444',
};
