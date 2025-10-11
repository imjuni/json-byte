import { isError } from 'my-easy-fp';
import { parse } from 'yaml';

import type { JsonValue } from 'type-fest';

export function safeYamlParse(value?: string | null): JsonValue | Error {
  try {
    if (value == null) {
      return new Error('Empty string');
    }

    const parsed = parse(value) as JsonValue;
    return parsed;
  } catch (err) {
    const error = isError(err, new Error('Cannot parse yaml document'));
    return error;
  }
}
