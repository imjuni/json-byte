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

  if (Array.isArray(value)) {
    return JSON.stringify(value);
  }

  const primitive = value as JsonObject;
  const keys = Object.keys(primitive);

  const primitiveObject = keys.reduce<JsonObject>((aggregated, key) => {
    const field = primitive[key];

    if (typeof field === 'string' || typeof field === 'number' || typeof field === 'boolean' || field == null) {
      return { ...aggregated, [key]: field };
    }

    return aggregated;
  }, {});

  return JSON.stringify(primitiveObject);
}
