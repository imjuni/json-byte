import { isError } from 'my-easy-fp';
import { parse } from 'yaml';

import type { JsonValue } from 'type-fest';

export function safeYamlParse(value: string): JsonValue | Error {
  try {
    const parsed = parse(value) as JsonValue;
    return parsed;
  } catch (err) {
    const error = isError(err, new Error('Cannot parse json document'));
    return error;
  }
}
