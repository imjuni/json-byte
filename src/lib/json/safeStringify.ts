import { isError } from 'my-easy-fp';

import type { JsonValue } from 'type-fest';

export function safeStringify(
  value?: JsonValue | null,
  replacer?: Parameters<typeof JSON.stringify>[1],
  space?: Parameters<typeof JSON.stringify>[2],
): string | Error {
  try {
    if (value == null) {
      return new Error('Empty value');
    }

    const parsed = JSON.stringify(value, replacer, space);
    return parsed;
  } catch (err) {
    const error = isError(err, new Error('Cannot stringify json document'));
    return error;
  }
}
