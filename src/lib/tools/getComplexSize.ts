import type { JsonValue } from 'type-fest';

/**
 * Calculate the size of a complex JSON value (array or object).
 *
 * For arrays, returns the number of elements.
 * For objects, returns the number of keys.
 * For primitive values, returns 0.
 *
 * @param value - The JSON value to measure
 * @returns The size of the array/object, or 0 for primitive values
 *
 * @example
 * ```ts
 * getComplexSize([1, 2, 3]) // returns 3
 * getComplexSize({ a: 1, b: 2 }) // returns 2
 * getComplexSize("string") // returns 0
 * getComplexSize(null) // returns 0
 * ```
 */
export function getComplexSize(value: JsonValue): number {
  if (Array.isArray(value)) {
    return value.length;
  }

  if (typeof value === 'object' && value !== null) {
    return Object.keys(value).length;
  }

  return 0;
}
