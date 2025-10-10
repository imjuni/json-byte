import { encode } from '#/lib/messagepack/encode';
import { toBase64 } from '#/lib/messagepack/toBase64';

import type { JsonValue } from 'type-fest';

export function replaceHref(value: JsonValue | Error): boolean {
  try {
    if (value instanceof Error) {
      return false;
    }

    const { href } = window.location;

    const url = new URL(href);
    const encoded = encode(value);

    if (encoded instanceof Error) {
      return false;
    }

    const base64Content = toBase64(encoded);

    url.searchParams.delete('c');
    url.searchParams.append('c', base64Content);

    window.history.replaceState(null, '', `${url.pathname}${url.search}`);

    return true;
  } catch {
    return false;
  }
}
