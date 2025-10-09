import type { JsonValue } from 'type-fest';

import type { TPrimitiveTypeString } from '#/contracts/json/TPrimitiveTypeString';

export interface IPrimitiveField {
  key: string;
  value: JsonValue;
  type: TPrimitiveTypeString;
}
