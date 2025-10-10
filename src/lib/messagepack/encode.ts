import { encode as mencode } from '@msgpack/msgpack';
import { isError } from 'my-easy-fp';

import type { JsonValue } from 'type-fest';

export function encode(value: JsonValue): Uint8Array | Error {
  try {
    const encoded = mencode(value);
    return encoded;
  } catch (caught) {
    const err = isError(caught, new Error('unknown error raised from messagepack encoded'));
    return err;
  }
}
