import { describe, expect, it } from 'vitest';

import { replaceJsonPathValue } from '#/lib/json/replaceJsonPathValue';

describe('replaceJsonPathValue', () => {
  it('replaces the root value', () => {
    expect(replaceJsonPathValue({ old: true }, '$', { next: true })).toEqual({ next: true });
  });

  it('replaces nested object and array values without mutating the document', () => {
    const document = { users: [{ name: 'before' }, { name: 'keep' }] };
    const result = replaceJsonPathValue(document, "$['users'][0]", { name: 'after' });

    expect(result).toEqual({ users: [{ name: 'after' }, { name: 'keep' }] });
    expect(document.users[0]).toEqual({ name: 'before' });
  });

  it('rejects invalid paths', () => {
    expect(replaceJsonPathValue({}, 'users[0]', null)).toBeInstanceOf(Error);
  });
});
