import { describe, expect, it } from 'vitest';

import { apiFetchFormSchema } from '#/components/editor/schemas/apiFetchFormSchema';

describe('apiFetchFormSchema', () => {
  const data = {
    url: 'https://pokeapi.co',
    headers: [
      { key: 'Authorization', value: 'Bearer some-api-token' },
      { key: 'referer', value: 'json-byte' },
    ],
    body: JSON.stringify({ name: 'pikachu' }),
  };

  it('should return true when valid data passed', () => {
    const result = apiFetchFormSchema.safeParse(data);
    expect(result.success).toBeTruthy();
  });

  it('should return true when valid data that is undefined body', () => {
    const result = apiFetchFormSchema.safeParse({ ...data, body: undefined });
    expect(result.success).toBeTruthy();
  });

  it('should return false when invalid data that is invalid url', () => {
    const result = apiFetchFormSchema.safeParse({ data, url: 'invalid' });
    expect(result.success).toBeFalsy();
  });
});
