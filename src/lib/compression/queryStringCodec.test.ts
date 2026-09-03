import { describe, expect, it } from 'vitest';

import { compressQueryString, decompressQueryString } from '#/lib/compression/queryStringCodec';

describe('queryStringCodec', () => {
  it('should round-trip Unicode content with URL-safe deflate encoding', async () => {
    const source = JSON.stringify({ message: '안녕하세요 👋', repeated: 'json-byte '.repeat(100) });
    const compressed = await compressQueryString(source);

    expect(compressed).toBeTypeOf('string');
    expect(compressed).not.toMatch(/[+/=]/);
    expect(await decompressQueryString(compressed as string)).toBe(source);
  });

  it('should return an error for invalid compressed content', async () => {
    expect(await decompressQueryString('not-deflate-data')).toBeInstanceOf(Error);
  });
});
