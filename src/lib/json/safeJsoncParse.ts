import { parse, printParseErrorCode } from 'jsonc-parser';
import { isError } from 'my-easy-fp';

import type { ParseError } from 'jsonc-parser';
import type { JsonValue } from 'type-fest';

export function safeJsoncParse(value?: string | null): JsonValue | Error {
  try {
    if (value == null) {
      return new Error('Empty string');
    }

    const errors: ParseError[] = [];
    const parsed = parse(value, errors) as JsonValue;

    const error = errors.at(0);
    if (error != null) {
      return new Error(`Invalid Json With commet - ${printParseErrorCode(error.error)}`);
    }

    return parsed;
  } catch (err) {
    const error = isError(err, new Error('Cannot parse json document'));
    return error;
  }
}
