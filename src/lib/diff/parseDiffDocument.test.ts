import { describe, expect, it } from 'vitest';

import { formatDiffDocument, parseDiffDocument } from '#/lib/diff/parseDiffDocument';

describe('parseDiffDocument', () => {
  it('detects JSON documents', () => {
    expect(parseDiffDocument('{"name":"json-byte"}').language).toBe('json');
  });

  it('detects YAML documents', () => {
    expect(parseDiffDocument('name: json-byte\nactive: true').language).toBe('yaml');
  });

  it('rejects empty documents', () => {
    expect(parseDiffDocument('  ').error).toBeInstanceOf(Error);
  });

  it('formats documents using the detected language', () => {
    expect(formatDiffDocument('{"name":"json-byte"}', 2)).toBe('{\n  "name": "json-byte"\n}');
    expect(formatDiffDocument('name: json-byte', 2)).toBe('name: json-byte\n');
  });
});
