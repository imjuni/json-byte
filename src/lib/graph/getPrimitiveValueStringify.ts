import type { JsonObject, JsonValue } from 'type-fest';

export function getPrimitiveValueStringify(value: JsonValue): string {
  const typeOf = typeof value;

  if (
    typeOf === 'boolean' ||
    typeOf === 'function' ||
    typeOf === 'symbol' ||
    typeOf === 'bigint' ||
    typeOf === 'string' ||
    typeOf === 'number'
  ) {
    return JSON.stringify(value);
  }

  const primitive = (Array.isArray(value) ? Object.fromEntries(value.entries()) : value) as JsonObject;
  const keys = Object.keys(primitive);

  const primitiveObject: JsonObject = {};
  for (const key of keys) {
    const field = primitive[key];

    if (typeof field === 'string' || typeof field === 'number' || typeof field === 'boolean' || field == null) {
      primitiveObject[key] = field;
    }
  }

  return JSON.stringify(Array.isArray(value) ? Object.values(primitiveObject) : primitiveObject);
}
