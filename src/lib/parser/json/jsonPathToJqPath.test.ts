import { describe, expect, it } from 'vitest';

import { jsonPathToJqPath } from '#/lib/parser/json/jsonPathToJqPath';

describe('jsonPathToJqPath', () => {
  it('converts the root path', () => {
    expect(jsonPathToJqPath('$')).toBe('.');
  });

  it('converts object keys and array indexes', () => {
    expect(jsonPathToJqPath("$['users'][0]['display-name']")).toBe('.["users"][0]["display-name"]');
  });

  it('preserves escaped quotes and backslashes in keys', () => {
    expect(jsonPathToJqPath("$['it\\'s']['a\\\\b']")).toBe('.["it\'s"]["a\\\\b"]');
  });

  it('returns unsupported paths unchanged', () => {
    expect(jsonPathToJqPath('$.users')).toBe('$.users');
  });
});
