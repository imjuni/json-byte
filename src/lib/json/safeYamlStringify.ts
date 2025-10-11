import { isError } from 'my-easy-fp';
import { stringify } from 'yaml';

import type { JsonValue } from 'type-fest';

export function safeYamlStringify(
  value?: JsonValue | null,
  replacer?: Parameters<typeof stringify>[1],
  space?: Parameters<typeof stringify>[2],
): string | Error {
  try {
    if (value == null) {
      return new Error('Empty value');
    }

    const parsed = stringify(value, replacer, space);
    return parsed;
  } catch (err) {
    const error = isError(err, new Error('Cannot stringify yaml document'));
    return error;
  }
}
