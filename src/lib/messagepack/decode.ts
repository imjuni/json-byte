import { decode as mdecode } from '@msgpack/msgpack';
import { isError } from 'my-easy-fp';

import type { JsonValue } from 'type-fest';

export function decode(value: Uint8Array): JsonValue | Error {
  try {
    const decoded = mdecode(value) as JsonValue;
    return decoded;
  } catch (caught) {
    const err = isError(caught, new Error('unknown error raised from messagepack decode'));
    return err;
  }
}
