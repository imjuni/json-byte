import { describe, expect, it } from 'vitest';
import { stringify as yamlStringify } from 'yaml';

import { multiParse } from '#/lib/json/multiParse';

describe('multiParse', () => {
  it.only('should parse double-encoded JSON string when input is stringified twice', () => {
    const jsonString = '\\"{\\"name\\":\\"ironman\\"}\\"';
    const parsed = multiParse(jsonString);
    expect(parsed).toEqual({ language: 'json', data: { name: 'ironman' } });
  });

  it('should return json language type when input is valid JSON string', () => {
    const jsonString = JSON.stringify({ name: 'ironman' });
    const parsed = multiParse(jsonString);
    expect(parsed).toEqual({ language: 'json', data: { name: 'ironman' } });
  });

  it('should return jsonc language type when input is valid JSON string', () => {
    const jsoncString = `// json with comment\n${JSON.stringify({ name: 'ironman' })}`;
    const parsed = multiParse(jsoncString);
    expect(parsed).toEqual({ language: 'json', data: { name: 'ironman' } });
  });

  it('should return yaml language type when input is valid YAML string', () => {
    const yamlString = yamlStringify({ name: 'ironman' });
    const parsed = multiParse(yamlString);
    expect(parsed).toEqual({ language: 'yaml', data: { name: 'ironman' } });
  });

  it('should return Error when invalid input string', () => {
    const yamlString = `- AAAAA!:\n${yamlStringify({ name: 'ironman' })}`;
    const parsed = multiParse(yamlString);
    expect(parsed).instanceOf(Error);
  });
});
