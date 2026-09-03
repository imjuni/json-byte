import { isError } from 'my-easy-fp';

import { compressQueryString } from '#/lib/compression/queryStringCodec';

import type { JsonValue } from 'type-fest';

export async function replaceHref(value: JsonValue | Error): Promise<boolean> {
  try {
    if (value instanceof Error) {
      return false;
    }

    const { href } = window.location;

    const url = new URL(href);
    const base64Content = await compressQueryString(JSON.stringify(value));
    if (base64Content instanceof Error) return false;

    url.searchParams.delete('c');
    url.searchParams.append('c', base64Content);

    window.history.replaceState(null, '', `${url.pathname}${url.search}`);

    return true;
  } catch (caught) {
    const err = isError(caught, new Error('unknown error raised'));
    // eslint-disable-next-line
    console.warn(err.message, err.stack);
    return false;
  }
}
