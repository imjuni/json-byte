import { isError } from 'my-easy-fp';

import type { JsonValue } from 'type-fest';

export function safeParse(value: string): JsonValue | Error {
  const parsed = JSON.parse(value) as JsonValue;

  try {
    return parsed;
  } catch (err) {
    const error = isError(err, new Error('Cannot parse json document'));
    return error;
  }
}
