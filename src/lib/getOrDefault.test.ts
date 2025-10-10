import { describe, expect, it } from 'vitest';

import { getOrDefault } from '#/lib/getOrDefault';

describe('getOrDefault', () => {
  it('should return value when pass non-null value', () => {
    const o = {};
    const f = () => 'a';
    const s = Symbol.for('a');

    const r01 = getOrDefault(10);
    const r02 = getOrDefault('10');
    const r03 = getOrDefault(o);
    const r04 = getOrDefault(f);
    const r05 = getOrDefault(10n);
    const r06 = getOrDefault(s);

    expect(r01).toEqual(10);
    expect(r02).toEqual('10');
    expect(r03).toEqual(o);
    expect(r04).toEqual(f);
    expect(r05).toEqual(10n);
    expect(r06).toEqual(s);
  });

  it('should return empty string when pass undefined without default value', () => {
    const result = getOrDefault(undefined, undefined);
    expect(result).toEqual('');
  });

  it('should return default value when pass undefined with default value', () => {
    const result = getOrDefault(undefined, 10);
    expect(result).toEqual(10);
  });

  it('should return default value when pass null with default value', () => {
    const result = getOrDefault(null, 10);
    expect(result).toEqual(10);
  });
});
