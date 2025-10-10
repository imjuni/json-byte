export function getOrDefault<T>(value: T, defaultValue?: T): NonNullable<T> {
  if (value == null && defaultValue != null) {
    return defaultValue;
  }

  if (value == null) {
    return '' as NonNullable<T>;
  }

  switch (typeof value) {
    case 'bigint':
    case 'boolean':
    case 'function':
    case 'object':
    case 'string':
    case 'number':
    case 'symbol':
      return value;

    /* v8 ignore next 2 */
    default:
      return '' as NonNullable<T>;
  }
}
